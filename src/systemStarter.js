const { log } = require("../config/config.js");

const checkExist = async (dockerCon, opts) => {
    return await dockerCon.listContainers({ "all": true }).then((containers) => {
        var status = false;
        containers.every((containerInfo) => {
            if (Object.keys(containerInfo.Labels).includes(Object.keys(opts.Labels)[0])) {
                log.debug(opts.name + " already exist.");
                status = true;
                if (containerInfo.State != "running") {
                    log.debug("Starting stopped " + opts.name);
                    dockerCon.getContainer(containerInfo.Id).start();
                }
                return false; //break for every() func
            }
            return true; //continue for every() func
        })
        return status;
    });
}
const bootSystemContainer = async (dockerCon, opts) => {
    if (await checkExist(dockerCon, opts)) {
        return true;
    } else {
        return await dockerCon.createContainer(opts)
            .then(function (container) {
                log.debug(`Creating ${opts.name} container!`);
                container.start();
                return true;
            }).catch(function (err) {
                log.fatal(err);
            });
    }
}

module.exports = {bootSystemContainer};