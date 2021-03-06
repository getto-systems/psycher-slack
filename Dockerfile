FROM amazonlinux:2

ENV NODE_VERSION 12

RUN set -x && \
  yum install -y \
    tar \
    gzip \
    curl \
    git-core \
    python3-pip \
  && \
  : "to fix vulnerabilities, update packages : 2020-07-20" && \
  yum install -y \
    bash \
    cpio \
    expat \
    glibc \
    glibc-common \
    glibc-langpack-en \
    glibc-minimal-langpack \
    libcom_err \
    libcrypt \
    libssh2 \
    libxml2 \
    openldap \
    python \
    python-libs \
  && \
  : "install awscli" && \
  pip3 install awscli && \
  : "install node" && \
  curl -sL https://rpm.nodesource.com/setup_$NODE_VERSION.x | bash - && \
  yum install -y nodejs && \
  npm install -g npm && \
  rm -rf /root/.npm && \
  : "add working user" && \
  useradd -m getto && \
  : "prepare app directory" && \
  mkdir -p /opt/app && \
  chown getto:getto /opt/app && \
  : "environment prepared"

COPY package*.json /opt/app/

WORKDIR /opt/app
USER getto

RUN set -x && \
  : "install node modules" && \
  npm clean-install && \
  : "project prepared"

CMD ["/bin/bash"]
