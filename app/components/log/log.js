'use strict';

import bunyan from 'bunyan';

var log;

var defaultConfig = {
    name: "proxy",
    level: process.env.LOG_LEVEL || 'info'
};

export default createLogger();

function createLogger() {

    if (log) {
        return log;
    }

    log = bunyan.createLogger(defaultConfig);

    return log;

}