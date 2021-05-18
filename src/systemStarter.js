const { log } = require("../config/config.js");
const { isEmpty } = require("lodash");
const streamToPromise = require("stream-to-promise");

const checkExist = async (dockerCon, opts) => {
    let listOpts = {"all": true,"filters": ""};
    listOpts["filters"] = {"label": Object.keys(opts.Labels)};
    return await dockerCon.listContainers(listOpts).then((containers) => {
        var status = false;
        if (!isEmpty(containers)) {
            log.debug(opts.name + " already exist.");
            status = true;
            if (containers[0].State != "running") {
                log.debug("Starting stopped " + opts.name);
                dockerCon.getContainer(containers[0].Id).start();
            }
        }
        return status;
    });
}
const bootSystemContainer = async (dockerCon, opts) => {
    if (await checkExist(dockerCon, opts)) {
        return true;
    } else {
        await streamToPromise(await dockerCon.pull(opts.Image).catch((err) => {
            log.fatal(err);
            throw "Couldn't pull Image!";
        }));
        return await dockerCon.createContainer(opts).then((container) => {
            log.info(`Creating ${opts.name} container!`);
            container.start();
            return true;
        }).catch((err) => {
            log.fatal(err);
            throw "Couldn't create container!";
        });
    }
}

module.exports = { bootSystemContainer };