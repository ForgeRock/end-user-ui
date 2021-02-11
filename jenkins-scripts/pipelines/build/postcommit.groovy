#!/usr/bin/env groovy

//====================================
// Postcommit pipeline for IDM Enduser
//====================================

import com.forgerock.pipeline.Build
import com.forgerock.pipeline.whitesource.ScanResult
import com.forgerock.pipeline.scp.ScpHost
import java.text.SimpleDateFormat

def build() {

  properties([buildDiscarder(logRotator(daysToKeepStr: '', numToKeepStr: '10'))])

  postcommitBuild = new Build(steps, env, currentBuild)

  slackChannel = '#idm-ui'
  emailNotificationMailingList = ['openidm-dev@forgerock.com, jason.browne@forgerock.com, brendan.miller@forgerock.com']
  postcommitBuild.setBuildFailureEmailNotificationPolicy([ brokenBuildSuspects() ])

  def javaVersion = '8'
  def mavenVersion = '3.2.5'
  def mavenBuildOptions = ''

  try {

    stage ('Setup') {

      stageErrorMessage = 'Setup failed, please have a look at the console output'

      // Generate a short Git commit
      SHORT_GIT_COMMIT = sh(returnStdout: true, script: "git rev-parse --short HEAD").trim()

      // Git change log
      lastChanges since: 'LAST_SUCCESSFUL_BUILD', format:'SIDE', matching: 'LINE'

      // Set build description
      postcommitBuild.setBuildNameAndDescription("${env.BRANCH_NAME} - ${SHORT_GIT_COMMIT}")

    }

    stage ('Maven build') {

      stageErrorMessage = 'The Maven build failed, please check the console output'

      withEnv(["JAVA_HOME=" + tool("JDK${javaVersion}"),
               "MAVEN_OPTS=${mavenBuildOptions}",
               "PATH+MAVEN=" + tool("Maven ${mavenVersion}") + "/bin"]) {
        withCredentials([
                string(credentialsId: 'whitesource-key-openidm-enduser', variable: 'WS_PRODUCT_KEY'),
                string(credentialsId: 'whitesource-ci-user-key', variable: 'WS_USER_KEY'),
        ]) {
          sh "mvn -B -e -U clean deploy -Psource-copyright,thirdpartylicensing -Dci.scm.revision=${SHORT_GIT_COMMIT}" +
                  " -Dwhitesource.product.key=${env.WS_PRODUCT_KEY} -Dwhitesource.user.key=${env.WS_USER_KEY}"
        }
      }
    }

    stage ('Whitesource Scan') {
      try {
        def repoName = scmUtils.getRepoName()
        def projectVersion = env.BRANCH_NAME
        def mavenJvmOptions = '-XX:MaxPermSize=256m -Xmx2g'

        // Remove spaces from branch name, and build a clean branch name for the folder and log names (without /)
        def gitBranchNameForLogAndFolder = projectVersion.replaceAll("\\s","")
                .replaceAll("/","-")

        // Target security folder on Abondance FR
        def scpHost = ScpHost.ABONDANCE_FR
        def scpRemotePathRoot = "security/whitesource/${repoName}/${gitBranchNameForLogAndFolder}/${SHORT_GIT_COMMIT}"
        def scpRemotePath = "/export/${scpRemotePathRoot}"
        scp.checkCanCopyToPath(scpHost, scpRemotePath, false)
        def riskReportName = 'whitesource-scan-result.pdf'

        def productToken = whitesourceUtils.getWhitesourceToken(repoName, projectVersion)
        ScanResult whitesourceScanResult

        withEnv(["JAVA_HOME=" + tool("JDK${javaVersion}"),
                 "MAVEN_OPTS=${mavenBuildOptions}",
                 "PATH+MAVEN=" + tool("Maven ${mavenVersion}") + "/bin"]) {

          def scanArgs = [
                  productToken:   productToken,
                  projectVersion: projectVersion,
          ]

          whitesourceScanResult = whitesourceUtils.performWhitesourceScan(scanArgs, riskReportName)
        }

        if (!whitesourceScanResult.scanPassed) {
          scpRemotePath += '_CVE'
        }

        scp.scpToRemoteDirectory(riskReportName, scpHost, scpRemotePath)
        scp.scpToRemoteDirectory('whitesource/*', scpHost, "${scpRemotePath}/log")

        echo "Whitesource scan result: ${whitesourceScanResult.resultDescription}"

        if (whitesourceScanResult.scanPassed) {
          currentBuild.result = 'SUCCESS'
        } else {
          currentBuild.result = 'FAILURE'
        }
      } catch (exception) {
        emailUtils.alertReleaseEngineeringAboutExternalServiceIssue('WhiteSource', exception.message)
        currentBuild.result = 'UNSTABLE'
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
      postcommitBuild.sendBuildBackToNormalSlackNotification(slackChannel)
    }

  } catch (exception) {
    currentBuild.result = 'FAILURE'
    postcommitBuild.sendSlackNotification(slackChannel)
    postcommitBuild.sendEmailNotification(emailNotificationMailingList, stageErrorMessage, exception.message)
    throw exception
  }
}

return this
