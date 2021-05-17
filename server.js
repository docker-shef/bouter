#!/usr/bin/env node
'use strict'

const { log } = require("./config/config.js");
const axios = require("axios");
const Docker = require("dockerode");
const DockerUtils = require("./src/dockerUtils");
const { bootSystemContainer } = require("./src/systemStarter");
const systemContainers = require("./config/systemContainers");

const dockerCon = new Docker({ socketPath: "/var/run/docker.sock" });

log.info("Log level:", global.gConfig.LOG_LEVEL);
log.info("Slave:", global.gConfig.SLAVE);

initBouter();

async function initBouter() {
    try {
        log.info("Starting shef bouter.");
        var docker = new DockerUtils(dockerCon);

        await docker.ping((err) => {
            if (err) {
                log.fatal("Docker socket isn't working.", err);
                process.exit(1)
            }
            log.info("Docker connected.");
        });

        log.info("First boot checks!");
        if (!global.gConfig.SLAVE) {
            log.info("Node is not a slave. Checking Redis and System containers.");
            await bootSystemContainer(dockerCon, systemContainers.redisOpts);
            await bootSystemContainer(dockerCon, systemContainers.conducktorOpts);
        }
        await bootSystemContainer(dockerCon, systemContainers.shefRunnerOpts);

        setInterval(async () => {
            try {
                let runnerSchema = {
                    node: global.gConfig.HOST_IP,
                    master: !global.gConfig.SLAVE
                }
                await axios.post(global.gConfig.CONDUCKTOR_URL + "/node", runnerSchema).then((res) => {
                    log.debug(`conducktor post ${JSON.stringify(res.data)}`);
                }).catch((e) => {
                    log.error("Something wrong with conducktor endpoint.");
                    log.debug(e);
                })

                log.info("Scheduled container checks!");
                var status = true;
                if (!global.gConfig.SLAVE) {
                    if (!await bootSystemContainer(dockerCon, systemContainers.redisOpts)) status = false;
                    if (!await bootSystemContainer(dockerCon, systemContainers.conducktorOpts)) status = false;
                }
                if (!await bootSystemContainer(dockerCon, systemContainers.shefRunnerOpts)) status = false;
                log.info(status ? "Containers healthy!" : "Some system containers unhealthy!");
            } catch (err) {
                log.error("Something wrong with system containers.");
                log.debug(err);
            }
        }, 30000);

    } catch (err) {
        throw log.fatal(err);
    }
}
