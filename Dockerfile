FROM ubuntu:20.04
ENV DEBIAN_FRONTEND=noninteractive 

RUN apt update -y
RUN apt install -y make build-essential libssl-dev zlib1g-dev \
    libbz2-dev libreadline-dev libsqlite3-dev wget curl llvm \
    libncurses5-dev libncursesw5-dev xz-utils tk-dev libffi-dev \
    liblzma-dev python-openssl git vim

RUN apt install mysql-server -y
