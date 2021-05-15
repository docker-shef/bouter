'use strict'

class Util {
    constructor(dockerCon) {
        this.dockerCon = dockerCon;
    }

    async ping(cb) {
        await this.dockerCon.ping((err, data) => {
            if (err) {
                return cb(err, {});
            }
            return cb(null, data);
        });
    }
}

module.exports = Util