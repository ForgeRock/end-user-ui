FROM gcr.io/engineering-devops/ci/base-images/rockylinux-9.2:production
LABEL maintainer="Release Engineering (releng@pingidentity.com)"

#================
# Tool versioning
#================
# OpenJDK8U-jdk_x64_linux_hotspot_8u222b10.tar.gz
# OpenJDK17U-jdk_x64_linux_hotspot_17.0.9_9.tar.gz
ARG ADOPT_JDK8_UPDATE_VERSION=222
ARG ADOPT_JDK8_VERSION=8u$ADOPT_JDK8_UPDATE_VERSION
ARG ADOPT_JDK8_BUILD_NUMBER=b10
ARG ADOPT_JDK8_FULL_VERSION=$ADOPT_JDK8_VERSION$ADOPT_JDK8_BUILD_NUMBER
ARG JDK_PACKAGE=OpenJDK8U-jdk_x64_linux_hotspot_$ADOPT_JDK8_FULL_VERSION.tar.gz

ARG MAVEN_VERSION=3.6.0

RUN yum install -y --color=never \
    bzip2

#===============================================================
# Environment
# Allows the Build Assets GCS Bucket to be overriden in staging.
#===============================================================
ARG ENVIRONMENT=live

#======================
# Set Working Directory
#======================
WORKDIR /root

#================
# Install Node.js
#================
RUN set -o pipefail \
 && curl -fsSL https://rpm.nodesource.com/setup_14.x | bash - \
 && yum install -y nodejs --color=never \
 && yum clean all --color=never

#==============
# Install Maven
#==============
RUN curl -fsSL https://repo1.maven.org/maven2/org/apache/maven/apache-maven/$MAVEN_VERSION/apache-maven-$MAVEN_VERSION-bin.tar.gz | tar xzf - -C /opt \
    && mv /opt/apache-maven-$MAVEN_VERSION /opt/maven-$MAVEN_VERSION \
    && ln -s /opt/maven-$MAVEN_VERSION/bin/mvn /usr/local/bin

#=============
# JDK installs
#=============
RUN gsutil -q cat gs://forgerock-build-assets-$ENVIRONMENT/pkg/jdk/$JDK_PACKAGE | tar xzf - -C /opt \
    && ln -s /opt/jdk$ADOPT_JDK8_VERSION\-$ADOPT_JDK8_BUILD_NUMBER /opt/jdk1.8.0_$ADOPT_JDK8_UPDATE_VERSION \
    && ln -s /opt/jdk$ADOPT_JDK8_VERSION\-$ADOPT_JDK8_BUILD_NUMBER /opt/jdk8 \
    && ln -s /opt/jdk8/bin/java /usr/local/bin
ENV JAVA_HOME /opt/jdk8