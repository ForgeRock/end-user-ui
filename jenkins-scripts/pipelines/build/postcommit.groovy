#!/usr/bin/env groovy

//====================================
// Postcommit pipeline for IDM Enduser
//====================================

import com.forgerock.pipeline.GlobalConfig
import com.forgerock.pipeline.mend.ScanResult

def build() {

  properties([buildDiscarder(logRotator(daysToKeepStr: '', numToKeepStr: '10'))])

  slackChannel = '#idm'
  emailNotificationMailingList = ['openidm-dev@forgerock.com, oliver.bradley@forgerock.com, brendan.miller@forgerock.com']

  def javaVersion = '8'
  def mavenVersion = '3.6.0'
  def mavenBuildOptions = ''

  try {

    stage('Setup') {
      stageErrorMessage = 'Setup failed, please have a look at the console output'

      // Generate a short Git commit
      SHORT_GIT_COMMIT = sh(returnStdout: true, script: "git rev-parse --short HEAD").trim()

      // Git change log
      lastChanges since: 'LAST_SUCCESSFUL_BUILD', format: 'SIDE', matching: 'LINE'

      // Set build description
      currentBuild.displayName = "#${env.BUILD_NUMBER} - ${SHORT_GIT_COMMIT}"
    }

    withEnv(["JAVA_HOME=" + tool("JDK${javaVersion}"),
             "MAVEN_OPTS=${mavenBuildOptions}",
             "PATH+MAVEN=" + tool("Maven ${mavenVersion}") + "/bin"]) {
      privateWorkspace.withCopyOfWorkspace {
        stage('Maven build') {
          stageErrorMessage = 'The Maven build failed, please check the console output'
          withCredentials([string(credentialsId: 'mend-ci-user-key', variable: 'MEND_USER_KEY')]) {
            def mendProductToken = mendUtils.getProductToken(scmUtils.getRepoName(), env.BRANCH_NAME)
            sh "mvn -B -e -U clean deploy -Psource-copyright,thirdpartylicensing -Dci.scm.revision=${SHORT_GIT_COMMIT}" +
                    " -Dmend.product.key=${mendProductToken} -Dmend.user.key=${env.MEND_USER_KEY}"
          }
        }

        stage('Build and push Docker image') {
          stageErrorMessage = 'Docker image creation failed, please check the console output'
          def versionPrefix = ENDUSER_VERSION.substring(0, ENDUSER_VERSION.lastIndexOf("-")) // e.g. '6.0.0'
          // The *-SNAPSHOT tag will be created by default, and comes from the project version provided to Maven
          sh """mvn -B docker:build docker:push \
              -Ddocker.tags.0=${versionPrefix}-postcommit-latest \
              -Ddocker.tags.1=${versionPrefix}-${SHORT_GIT_COMMIT}
            """
        }
      }

      stage('Mend Scan') {
        stageErrorMessage = 'The Mend scan failed, please check the console output'
        privateWorkspace.withCopyOfWorkspace {
          runMendScan()
        }
      }
    }

    stage('Checkmarx scan') {
      stageErrorMessage = 'The Checkmarx scan failed, please check the console output'
      privateWorkspace.withCopyOfWorkspace {
        runCheckmarxScan()
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

/* Run the Mend scan */
private void runMendScan() {
  def repoName = scmUtils.getRepoName()
  def branchName = env.BRANCH_NAME
  ScanResult mendScanResult
  try {
    mendScanResult = mendUtils.performScan(repoName, branchName, SHORT_GIT_COMMIT)
  } catch (exception) {
    emailUtils.alertReleaseEngineeringAboutExternalServiceIssue('Mend', exception.message)
    currentBuild.result = 'UNSTABLE'
    return
  }
  if (!mendScanResult.scanPassed) {
    error 'Mend scan failure'
  }
}

/* Run the Checkmarx SAST scan */
private void runCheckmarxScan() {
  def CHECKMARX_VULNERABILITY_THRESHOLD = 0 // No high vulnerabilities allowed in codebase.
  try {
    step([
            $class                       : 'CxScanBuilder',
            sastEnabled                  : true,
            groupId                      : '6',
            projectName                  : "UI - IDM EndUser ${env.BRANCH_NAME.replaceAll('/', ' ')}",
            preset                       : '100004', // ASA-Premium
            sourceEncoding               : '5', // Multi-language scan

            //Non-security Settings
            exclusionSetting             : 'job',
            excludeFolders               : 'tests',
            filterPattern                : "!**/*.spec.js, ${GlobalConfig.CHECKMARX_EXCLUDE_PATTERNS}",
            waitForResultsEnabled        : true,
            // Incremental scans should only be performed when adding new code to the project.
            // When changing existing code or adding new code directly affected by the old code, always perform a full scan.
            incremental                  : false,

            // Use the number of HIGH vulnerabilities (CXSAST_RESULTS_HIGH) as the outcome of this stage.
            // Enable the vulnerability threshold option to include the scan result in the report PDF.
            vulnerabilityThresholdEnabled: true,
            vulnerabilityThresholdResult : 'FAILURE',
            highThreshold                : 0,
            failBuildOnNewResults        : false,
            jobStatusOnError             : 'UNSTABLE',
    ])
  } catch (Throwable t) {
    // The Checkmarx step shouldn't throw an exception; if it did then alert RE so they can investigate.
    // Don't collect report URL because the report may be unavailable.
     emailUtils.alertReleaseEngineeringAboutExternalServiceIssue('Checkmarx', t.message)
    // Mark the stage as unstable, but do not fail the build.
    unstable('Checkmarx', t.message)
    return
  }
  archiveArtifacts(allowEmptyArchive: true, artifacts: 'Checkmarx/Reports/Report_CxSAST.html')

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
    error errorMsg
  }
  echo "PASS: Checkmarx found HIGH vulnerabilities: ${env.CXSAST_RESULTS_HIGH} " +
          "(${CHECKMARX_VULNERABILITY_THRESHOLD} allowed)"
}

return this
