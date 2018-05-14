#!/usr/bin/env groovy

//==============================
// Pull request pipeline for IDM
//==============================

import org.jenkinsci.plugins.workflow.steps.FlowInterruptedException

import com.forgerock.pipeline.PullRequestBuild

def build() {

  properties([buildDiscarder(logRotator(daysToKeepStr: '14', numToKeepStr: '3'))])

  // Abort any active builds relating to the current PR, as they are superseded by this build
  abortMultibranchPrBuilds()

  prBuild = new PullRequestBuild(steps, env, currentBuild, scm)
  prBuild.setBuildNameAndDescription()
  //prBuild.disableNotifications()

  bitbucketCommentId = ''

  def javaVersion = '8'
  def mavenVersion = '3.2.5'
  def mavenBuildOptions = ''

  try {

    stage ('Initial Bitbucket notification; set global variables') {

      bitbucketCommentId = prBuild.commentOnPullRequest(buildStatus: 'IN PROGRESS', excludeCommitHash: true)

      // Generate a short Git commit
      SHORT_GIT_COMMIT = sh(returnStdout: true, script: 'git rev-parse --short HEAD').trim()
    }

    stage ('Maven build') {

      withEnv(["JAVA_HOME=" + tool("JDK${javaVersion}"),
               "MAVEN_OPTS=${mavenBuildOptions}",
               "PATH+MAVEN=" + tool("Maven ${mavenVersion}") + "/bin"]) {

        withCredentials([string(credentialsId: 'whitesource-key-openidm-enduser', variable: 'WS_PRODUCT_KEY')]) {
         sh "mvn -B -e -U clean verify -Psource-copyright,thirdpartylicensing -Dci.scm.revision=${SHORT_GIT_COMMIT} -Dwhitesource.product.key=${WS_PRODUCT_KEY}"
        }
      }
    }

    stage ('Final notification') {
      currentBuild.result = 'SUCCESS'
      prBuild.commentOnPullRequest(originalCommentId: bitbucketCommentId)
    }

  } catch (FlowInterruptedException ex) {
    currentBuild.result = 'ABORTED'
    prBuild.commentOnPullRequest(buildStatus: 'ABORTED', originalCommentId: bitbucketCommentId)
    throw ex
  } catch (exception) {
    currentBuild.result = 'FAILURE'
    prBuild.commentOnPullRequest(originalCommentId: bitbucketCommentId)
    throw exception
  }
}

return this
