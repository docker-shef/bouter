#!/usr/bin/env node
'use strict'

const { log } = require("./config/config.js");
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
            const { bootRedis } = require("./src/redisStarter");
            log.info(await bootRedis(dockerCon) ? "Redis container created." : "Redis container already exist.");
            if (await bootSystemContainer(dockerCon, systemContainers.conducktorOpts)) {
                log.info(systemContainers.conducktorOpts.name, "container created.");
            } else {
                log.info(systemContainers.conducktorOpts.name, "container already exist.");
            }
        }
        if (await bootSystemContainer(dockerCon, systemContainers.shefRunnerOpts)) {
            log.info(systemContainers.shefRunnerOpts.name, "container created.");
        } else {
            log.info(systemContainers.shefRunnerOpts.name, "container already exist.");
        }

        const client = require("./src/redis-client");
        await client.onAsync("ready").then(() => log.debug("Redis connected."));

        setInterval(async () => {
            try {
                client.setAsync("nodes." + global.gConfig.HOST_IP, JSON.stringify({
                    node: global.gConfig.HOST_IP, master: !global.gConfig.SLAVE, lastAlive: new Date().toISOString()
                })).then((res) => log.debug("node status: ", res));

                log.info("Scheduled container checks!");
                var status = true;
                if (!global.gConfig.SLAVE) {
                    const { bootRedis } = require("./src/redisStarter");
                    if (!await bootRedis(dockerCon)) status = false;
                    if (!await bootSystemContainer(dockerCon, systemContainers.conducktorOpts)) status = false;
                }
                if (!await bootSystemContainer(dockerCon, systemContainers.shefRunnerOpts)) status = false;
                log.info(status ? "Containers healthy!" : "Some system containers unhealthy!");
            } catch (err) {
                log.error("Something wrong with system containers and couldn't restarted.", err);
            }
        }, 30000);

    } catch (err) {
        throw log.fatal(err);
    }
}
