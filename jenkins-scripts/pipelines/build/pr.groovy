#!/usr/bin/env groovy

//==============================
// Pull request pipeline for IDM
//==============================

import org.jenkinsci.plugins.workflow.steps.FlowInterruptedException

def build() {

  properties([buildDiscarder(logRotator(daysToKeepStr: '14', numToKeepStr: '3'))])

  // Abort any active builds relating to the current PR, as they are superseded by this build
  abortMultibranchPrBuilds()

  bitbucketCommentId = ''

  def mavenBuildOptions = ''

  try {

    stage ('Setup') {
      if (!scmUtils.isGitHubRepository()) {
        bitbucketCommentId = bitbucketUtils.postMultibranchBuildStatusCommentOnPullRequest(
                buildStatus: 'IN PROGRESS')
      }
    }

    stage ('Maven build') {
      dockerUtils.insideMavenImage( withCopyOfHostWorkspace: true ) {
        withEnv(["MAVEN_OPTS=${mavenBuildOptions}"]) {
          withCredentials([ string(credentialsId: 'mend-ci-user-key', variable: 'MEND_USER_KEY') ]) {
            def mendProductToken = mendUtils.getProductToken(scmUtils.getRepoName(), env.CHANGE_TARGET)
            sh "mvn -B -e -U clean verify -Psource-copyright,thirdpartylicensing -Dci.scm.revision=${SHORT_GIT_COMMIT}" +
                    " -Dmend.product.key=${mendProductToken} -Dmend.user.key=${env.MEND_USER_KEY}"
          }
        }
      }
    }

    stage ('Final notification') {
      currentBuild.result = 'SUCCESS'
      if (!scmUtils.isGitHubRepository()) {
        bitbucketUtils.postMultibranchBuildStatusCommentOnPullRequest(originalCommentId: bitbucketCommentId)
      }
    }

  } catch (FlowInterruptedException ex) {
    currentBuild.result = 'ABORTED'
    if (!scmUtils.isGitHubRepository()) {
      bitbucketUtils.postMultibranchBuildStatusCommentOnPullRequest(originalCommentId: bitbucketCommentId)
    }
    throw ex
  } catch (exception) {
    currentBuild.result = 'FAILURE'
    if (!scmUtils.isGitHubRepository()) {
      bitbucketUtils.postMultibranchBuildStatusCommentOnPullRequest(originalCommentId: bitbucketCommentId)
    }
    throw exception
  }
}

return this
