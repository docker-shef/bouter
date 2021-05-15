const { log } = require("../config/config.js");

let opts = {
    Hostname: "shefRedis",
    Image: "redis",
    name: "shefRedis",
    Labels: {
        "shef-Redis": "true"
    },
    HostConfig: {
        "Binds": ["shefRedis-data:/data"],
        "PortBindings": {
            "6379/tcp": [
                {
                    "HostPort": "6379"   //Map container to a random unused port.
                }
            ]
        },
        "RestartPolicy": {
            "Name": "unless-stopped"
        }
    },
    Cmd: ["redis-server", "--appendonly", "yes"]
};

const checkRedisExist = async (dockerCon) => {
    return await dockerCon.listContainers({ "all": true }).then((containers) => {
        var status = false;
        containers.every((containerInfo) => {
            if (containerInfo.Labels["shef-Redis"]) {
                log.debug("Redis already exist.");
                status = true;
                if (containerInfo.State != "running") {
                    log.debug("Starting stopped Redis!");
                    dockerCon.getContainer(containerInfo.Id).start();
                }
                return false; //break for every() func
            }
            return true; //continue for every() func
        })
        return status;
    });
}
const bootRedis = async (dockerCon) => {
    if (await checkRedisExist(dockerCon)) {
        return true;
    } else {
        return await dockerCon.createContainer(opts)
            .then(function (container) {
                log.debug("Creating Redis container!");
                container.start();
                return true;
            }).catch(function (err) {
                log.fatal(err);
            });
    }
}

module.exports = { checkRedisExist, bootRedis };