const HOST_IP = "HOST_IP=" + global.gConfig.HOST_IP;
const MASTER_HOST = "MASTER_HOST=" + global.gConfig.MASTER_HOST;
const REDIS_HOST = "REDIS_HOST=" + global.gConfig.REDIS_HOST;
const REDIS_PORT = "REDIS_PORT=" + global.gConfig.REDIS_PORT;

let conducktorOpts = {
    Hostname: "conducktor",
    Image: "nginx",
    name: "conducktor",
    Labels: {
        "shef-conducktor": "true"
    },
    Env: [
        REDIS_HOST,
        REDIS_PORT,
        HOST_IP
    ],
    HostConfig: {
        "PortBindings": {
            "80/tcp": [
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
    Image: "docker",
    name: "shefRunner",
    Labels: {
        "shef-shefRunner": "true"
    },
    Env: [
        HOST_IP,
        MASTER_HOST
    ],
    HostConfig: {
        "Binds": ["/var/run/docker.sock:/var/run/docker.sock"],
        "RestartPolicy": {
            "Name": "unless-stopped"
        }
    },
    Cmd: [ "sleep", "3600" ]
};

module.exports = {
    conducktorOpts,
    shefRunnerOpts,
};