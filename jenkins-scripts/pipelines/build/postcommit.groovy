#!/usr/bin/env groovy

//====================================
// Postcommit pipeline for IDM Enduser
//====================================

import com.forgerock.pipeline.GlobalConfig
import com.forgerock.pipeline.mend.ScanResult

def build() {

  properties([buildDiscarder(logRotator(daysToKeepStr: '', numToKeepStr: '10'))])

  slackChannel = '#idm'
  emailNotificationMailingList = ['openidm-dev@pingidentity.com, oliver.bradley@pingidentity.com, brendan.miller@pingidentity.com']

  def mavenBuildOptions = ''

  try {

    stage('Setup') {
      stageErrorMessage = 'Setup failed, please have a look at the console output'

      // Git change log
      lastChanges since: 'LAST_SUCCESSFUL_BUILD', format: 'SIDE', matching: 'LINE'
    }

    dockerUtils.insideMavenImage( withCopyOfHostWorkspace: true ) {
      withEnv(["MAVEN_OPTS=${mavenBuildOptions}"]) {
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

      stage('Mend SCA Scan') {
        stageErrorMessage = 'The Mend SCA scan failed, please check the console output'
        runMendScaScan()
      }
    }

    stage('Mend SAST scan') {
      stageErrorMessage = 'The Mend Sast scan failed, please check the console output'
        runMendSastScan()
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

/* Run the Mend SCA scan */
private void runMendScaScan() {
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

/* Run the Mend SAST scan */
private void runMendSastScan() {
  /**
   * MEND_SAST_EXCLUDE_FOLDERS
   * String of relative paths to exclude from scan, delineated by commas. Wildcard characters supported.
   * See https://docs.mend.io/platform/latest/configure-the-mend-cli-for-sast#ConfiguretheMendCLIforSAST-MendCLISAST-ScanPerformanceparameters
   */
  MEND_SAST_EXCLUDE_FOLDERS = "!**/*.sql, ${GlobalConfig.CHECKMARX_EXCLUDE_PATTERNS}"

  /**
   * MEND_SAST_REPORT_LEVEL
   * The level of detail to include in the report.
   * Possible values: 'summary', 'short', 'technical'.
   * See https://docs.mend.io/platform/latest/configure-the-mend-cli-for-sast#ConfiguretheMendCLIforSAST-MendCLISAST-Reportparameters
   */
  MEND_SAST_REPORT_LEVEL = 'summary'

  /**
   * MEND_SAST_THRESHOLD_HIGH
   * The threshold of how many High CVEs the CLI will detect before sending exit code of 9.
   * Possible values: integers.
   * See https://docs.mend.io/platform/latest/configure-the-mend-cli-for-sast#ConfiguretheMendCLIforSAST-MendCLISAST-Thresholdparameters(Policy)
   */
  MEND_SAST_THRESHOLD_HIGH = 1

  dockerUtils.insideSecurityScanImage(withCopyOfHostWorkspace: true, dockerfilePath: 'jenkins-scripts/docker/mend-cli') {
    withCredentials([string(credentialsId: 'mend-ci-user-key', variable: 'MEND_USER_KEY')]) {
      withEnv(["MEND_URL=https://saas.whitesourcesoftware.com",
               "MEND_EMAIL=ci@pingidentity.com",
               "MEND_SAST_PATH_EXCLUSIONS=${MEND_SAST_EXCLUDE_FOLDERS}",
               "MEND_SAST_REPORT_LEVEL=${MEND_SAST_REPORT_LEVEL}",
               "MEND_SAST_THRESHOLD_HIGH=${MEND_SAST_THRESHOLD_HIGH}"
      ]) {
        def rootCodePath = "."
        def reportName = "mendSastReport_${BRANCH_NAME}_${SHORT_GIT_COMMIT}".replace('/','-')
        def cmd = "mend code --dir ${rootCodePath} --report --filename ${reportName} --formats json,pdf --non-interactive --scope 'OpenIDM Enduser ${BRANCH_NAME}//SAST'"
        def mendSastExitCode = sh script: cmd, returnStatus: true

        def bucketPath = "gs://forgerock-build-assets-live/security/mend-sast/idm-enduser/"
        def remoteReportPath = "${bucketPath}${reportName}.pdf"
        sh "gsutil cp ${reportName}.pdf ${bucketPath}"  // Upload PDF report for view via dashboard
        sh "gsutil cp ${reportName}.json ${bucketPath}" // Upload JSON report for debugging if needed
        def httpReportUrl = "https://storage.cloud.google.com/forgerock-build-assets-live/security/mend-sast/idm-enduser/${reportName}.pdf"

        switch (mendSastExitCode) {
          case 0:
            // Scan finished, no policy violations.
            echo "SUCCESS: SAST scan completed with no violations, view report at ${httpReportUrl}"
          case 9:
            // Scan finished, policy violations found.
            error "FAILURE: SAST scan completed with policy violations, view report at ${httpReportUrl}"
          default:
            // Scan finished with unhandled exit code or did not finish.
            def errorMsg = "UNSTABLE: SAST scan encountered an unexpected exit code: ${mendSastExitCode}. " +
                    "SAST scan was unable to finish. RE will be notified and this build will continue. " +
                    "See Mend CLI documentation: https://docs.mend.io/bundle/integrations/page/mend_cli_exit_codes.html" +
                    ""
            emailUtils.alertReleaseEngineeringAboutExternalServiceIssue('Mend SAST Scan', errorMsg)
            unstable(errorMsg)
        }
      }
    }
  }
}

return this
