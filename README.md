[![Docker Build](https://github.com/docker-shef/bouter/actions/workflows/main.yml/badge.svg)](https://github.com/docker-shef/bouter/actions)

## POC Docker-shef bouter🎿(as booter) Repository

Bouter is booter of the system(I like word games). Bouter designed for easier deployment of docker-shef master and slaves. Bouter manages lifecycle of all other system components. It boots them with necessary variables, volume and port bindings.

## Bouter Specific Configurations

There is just 3 variables to configure shefRunner service manually:

| VARIABLE    | DESCRIPTION                                                  | OPTIONS                                  |
| ----------- | ------------------------------------------------------------ | ---------------------------------------- |
| LOG_LEVEL   | Decides the log output level, default: info                  | fatal<br /> error<br /> info<br /> debug |
| HOST_IP     | IPv4 address of docker host, default: ""                     | Valid IPv4 address                       |
| REDIS_HOST  | FQDN of Redis host, default: HOST_IP                         | Valid FQDN                               |
| REDIS_PORT  | Port of Redis, default: 6379                                 | Port Number                              |
| SLAVE       | Decides to start bouter as master or slave node which effect containers to start. If set to false, bouter will try to start Conducktor, Redis(If REDIS_HOST variable isn't given) and shefRunner containers. default: false | true<br />false                          |
| MASTER_HOST | IPv4 address of master docker-shef host that contains Conducktor service. If SLAVE variable set to true then this variable must be set too. default: HOST_IP | Valid IPv4 address                       |