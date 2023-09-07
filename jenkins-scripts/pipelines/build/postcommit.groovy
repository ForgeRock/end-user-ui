#!/usr/bin/env groovy

//====================================
// Postcommit pipeline for IDM Enduser
//====================================

import com.forgerock.pipeline.whitesource.ScanResult

def build() {

  properties([buildDiscarder(logRotator(daysToKeepStr: '', numToKeepStr: '10'))])

  slackChannel = '#idm-ui'
  emailNotificationMailingList = ['openidm-dev@forgerock.com, jason.browne@forgerock.com, brendan.miller@forgerock.com']

  def javaVersion = '8'
  def mavenVersion = '3.6.0'
  def mavenBuildOptions = ''

  try {

    stage ('Setup') {

      stageErrorMessage = 'Setup failed, please have a look at the console output'

      // Generate a short Git commit
      SHORT_GIT_COMMIT = sh(returnStdout: true, script: "git rev-parse --short HEAD").trim()

      // Git change log
      lastChanges since: 'LAST_SUCCESSFUL_BUILD', format:'SIDE', matching: 'LINE'

      // Set build description
      currentBuild.displayName = "#${env.BUILD_NUMBER} - ${SHORT_GIT_COMMIT}"

    }

    stage ('Maven build') {

      stageErrorMessage = 'The Maven build failed, please check the console output'

      withEnv(["JAVA_HOME=" + tool("JDK${javaVersion}"),
               "MAVEN_OPTS=${mavenBuildOptions}",
               "PATH+MAVEN=" + tool("Maven ${mavenVersion}") + "/bin"]) {
        withCredentials([
                string(credentialsId: 'whitesource-ci-user-key', variable: 'WS_USER_KEY'),
        ]) {
          def whitesourceProductToken = whitesourceUtils.getWhitesourceToken(scmUtils.getRepoName(), env.BRANCH_NAME)
          sh "mvn -B -e -U clean deploy -Psource-copyright,thirdpartylicensing -Dci.scm.revision=${SHORT_GIT_COMMIT}" +
                  " -Dwhitesource.product.key=${whitesourceProductToken} -Dwhitesource.user.key=${env.WS_USER_KEY}"
        }
      }
    }

    stage ('Whitesource Scan') {
      try {
        def repoName = scmUtils.getRepoName()
        def branchName = env.BRANCH_NAME

        ScanResult whitesourceScanResult

        withEnv(["JAVA_HOME=" + tool("JDK${javaVersion}"),
                 "MAVEN_OPTS=${mavenBuildOptions}",
                 "PATH+MAVEN=" + tool("Maven ${mavenVersion}") + "/bin"]) {
          whitesourceScanResult = whitesourceUtils.performWhitesourceScan(repoName, branchName, SHORT_GIT_COMMIT)
        }

        if (!whitesourceScanResult.scanPassed) {
          currentBuild.result = 'FAILURE'
        }
      } catch (exception) {
        emailUtils.alertReleaseEngineeringAboutExternalServiceIssue('WhiteSource', exception.message)
        currentBuild.result = 'UNSTABLE'
      }
    }

    stage ('Checkmarx SAST Scan') {
      privateWorkspace.withCopyOfWorkspace {
        CHECKMARX_VULNERABILITY_THRESHOLD = 0 // No high vulnerabilities allowed in codebase.
          
        try {
          step([
            $class                          : 'CxScanBuilder',
            sastEnabled                     : true,
            groupId                         : '6',
            projectName                     : "UI - IDM EndUser ${env.BRANCH_NAME.replaceAll('/', ' ')}",
            preset                          : '100004', // ASA-Premium
            sourceEncoding                  : '5', // Multi-language scan

            //Non-security Settings
            exclusionSetting                : 'job',
            excludeFolders                  : 'tests', // Retrieved from Checkmarx
            filterPattern                   : '*.spec.js', // Retrieved from Checkmarx
            waitForResultsEnabled           : true,
            // Incremental scans should only be performed when adding new code to the project.
            // When changing existing code or adding new code directly affected by the old code, always perform a full scan.
            incremental                     : false,

            // Use the number of HIGH vulnerabilities (CXSAST_RESULTS_HIGH) as the outcome of this stage.
            // Enable the vulnerability threshold option to include the scan result in the report PDF.
            vulnerabilityThresholdEnabled   : true,
            vulnerabilityThresholdResult    : 'FAILURE',
            highThreshold                   : 0,
            failBuildOnNewResults           : false,
            jobStatusOnError                : 'UNSTABLE',
          ])
        } catch (Throwable t) {
          // The Checkmarx step shouldn't throw an exception; if it did then alert RE so they can investigate.
          // Don't collect report URL because the report may be unavailable.
          emailUtils.alertReleaseEngineeringAboutExternalServiceIssue('Checkmarx', t.message)
          // Mark the stage as unstable, but do not fail the build.
          unstable('Checkmarx', t.message)
          return
        }
        def reportName = 'Checkmarx/Reports/Report_CxSAST.html'
        archiveArtifacts(allowEmptyArchive: true, artifacts: reportName)
        def reportUrl = "${env.BUILD_URL}/artifact/${reportName}"

        // Requires Checkmarx plugin version 2020.2.20 or later
        if (!env.CXSAST_RESULTS_HIGH || !env.CXSAST_RESULTS_HIGH.isInteger()) {
          def errorMsg = "ERROR: Cannot determine Checkmarx high vulnerability count from non-integer value '${env.CXSAST_RESULTS_HIGH}'"
          echo errorMsg
          // If number of high vulnerabilities is not set correctly, alert RE so they can investigate.
          emailUtils.alertReleaseEngineeringAboutExternalServiceIssue('Checkmarx', errorMsg)
          // Mark the stage as unstable, but do not fail the build.
          unstable('Checkmarx', errorMsg)
          return
        } else if (env.CXSAST_RESULTS_HIGH.toInteger() > CHECKMARX_VULNERABILITY_THRESHOLD) {
          def errorMsg = "ERROR: Too many vulnerabilities found by Checkmarx scan: " + 
                      "'${env.CXSAST_RESULTS_HIGH} (${CHECKMARX_VULNERABILITY_THRESHOLD} allowed)'"
          echo errorMsg
          unstable('Checkmarx', errorMsg)
          return
        }
        echo "PASS: Checkmarx found HIGH vulnerabilities: '${env.CXSAST_RESULTS_HIGH} '" + 
              "'(${CHECKMARX_VULNERABILITY_THRESHOLD} allowed)'"
        return new Outcome(Status.SUCCESS, reportUrl)
      }
    }

    stage ('Build and push Docker image') {

      stageErrorMessage = 'Docker image creation failed, please check the console output'

      def versionPrefix = ENDUSER_VERSION.substring(0, ENDUSER_VERSION.lastIndexOf("-")) // e.g. '6.0.0'

      withEnv(["JAVA_HOME=" + tool("JDK${javaVersion}"),
               "MAVEN_OPTS=${mavenBuildOptions}",
               "PATH+MAVEN=" + tool("Maven ${mavenVersion}") + "/bin"]) {

        // The *-SNAPSHOT tag will be created by default, and comes from the project version provided to Maven
        sh """mvn -B docker:build docker:push \
            -Ddocker.tags.0=${versionPrefix}-postcommit-latest \
            -Ddocker.tags.1=${versionPrefix}-${SHORT_GIT_COMMIT}
          """
      }
    }

    currentBuild.result = 'SUCCESS'

    // Send a 'build is back to normal' notification if the previous build was not good
    if (buildIsBackToNormal()) {
      slackUtils.sendBackToNormalMessage(slackChannel)
    }

  } catch (exception) {
    currentBuild.result = 'FAILURE'
    slackUtils.sendNoisyStatusMessage(slackChannel)
    emailUtils.sendFailureNotification(
            emailNotificationMailingList,
            headlineMessage: "Stage failure message: ${stageErrorMessage}",
            detailedMessage: exception.message,
            notifyCulprits: true
    )
    throw exception
  }
}

return this
