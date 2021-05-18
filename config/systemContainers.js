const HOST_IP = "HOST_IP=" + global.gConfig.HOST_IP;
const MASTER_HOST = "MASTER_HOST=" + global.gConfig.MASTER_HOST;
const REDIS_HOST = "REDIS_HOST=" + global.gConfig.REDIS_HOST;
const REDIS_PORT = "REDIS_PORT=" + global.gConfig.REDIS_PORT;

let conducktorOpts = {
    Hostname: "conducktor",
    Image: "seljuke/conducktor:latest",
    name: "conducktor",
    Labels: {
        "shef-conducktor": "true"
    },
    Env: [
        REDIS_HOST,
        REDIS_PORT,
        HOST_IP
    ],
    ExposedPorts: {'8044/tcp':{}},
    HostConfig: {
        "PortBindings": {
            "8044/tcp": [
                {
                    "HostPort": "8044"   //Map container to a random unused port.
                }
            ]
        },
        "RestartPolicy": {
            "Name": "unless-stopped"
        }
    }
};
let shefRunnerOpts = {
    Hostname: "shefRunner",
    Image: "seljuke/shefrunner:latest",
    name: "shefRunner",
    Labels: {
        "shef-shefRunner": "true"
    },
    Env: [
        HOST_IP,
        MASTER_HOST
    ],
    ExposedPorts: {'11044/tcp':{}},
    HostConfig: {
        "Binds": ["/var/run/docker.sock:/var/run/docker.sock"],
        "PortBindings": {
            "11044/tcp": [
                {
                    "HostPort": "11044"   //Map container to a random unused port.
                }
            ]
        },
        "RestartPolicy": {
            "Name": "unless-stopped"
        }
    }
};

let redisOpts = {
    Hostname: "shefRedis",
    Image: "redis:6.2",
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

module.exports = {
    conducktorOpts,
    shefRunnerOpts,
    redisOpts,
};