const _ = require("lodash");
const bunyan = require("bunyan");
const { isIPv4 } = require("net");
const config = require("./config.json");

const defaultConfig = config.development;
const environment = process.env.NODE_ENV || "development";
const environmentConfig = config[environment];
const finalConfig = _.merge(defaultConfig, environmentConfig);
finalConfig.LOG_LEVEL = (process.env.LOG_LEVEL || finalConfig.LOG_LEVEL).toLowerCase();
if( environment == "production" ) {
    var log = bunyan.createLogger({ name: "bouter", level: finalConfig.LOG_LEVEL, localtime: new Date().toISOString() });
} else {
    var log = bunyan.createLogger({ name: "bouter", level: finalConfig.LOG_LEVEL});
}


finalConfig.SLAVE = !((process.env.SLAVE || finalConfig.SLAVE) == "false");
finalConfig.HOST_IP = process.env.HOST_IP || finalConfig.HOST_IP;
if (!isIPv4(finalConfig.HOST_IP)) {
    throw log.fatal("HOST_IP environment variable is not a valid IPv4 address!");
}

if (finalConfig.SLAVE) {
    if (!process.env.MASTER_HOST) {
        throw log.fatal("Bouter started as non-master but MASTER_HOST variable wasn't set!");
    }
}

if(finalConfig.SLAVE) {
    finalConfig.MASTER_HOST = process.env.MASTER_HOST || finalConfig.MASTER_HOST || finalConfig.HOST_IP;
} else {
    finalConfig.MASTER_HOST = finalConfig.MASTER_HOST || finalConfig.HOST_IP;
}

finalConfig.REDIS_HOST = process.env.REDIS_HOST || finalConfig.HOST_IP ;
finalConfig.REDIS_PORT = process.env.REDIS_PORT || "6379";

finalConfig.CONDUCKTOR_URL = "http://" + finalConfig.MASTER_HOST + ":8044";
finalConfig.LOG_LEVEL = process.env.LOG_LEVEL || finalConfig.LOG_LEVEL;

log.info("Timezone", Intl.DateTimeFormat().resolvedOptions().timeZone);

global.gConfig = finalConfig;

module.exports = { log };