FROM gcr.io/engineering-devops/ci/base-images/rockylinux-9.2:production

# Install Mend CLI
RUN curl https://downloads.mend.io/cli/linux_amd64/mend -o /usr/local/bin/mend && chmod +x /usr/local/bin/mend

# Prevent a warning message in Jenkins, caused by the 'maven-build' ENTRYPOINT and CMD
ENTRYPOINT []
CMD []