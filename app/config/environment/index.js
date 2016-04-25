'use strict';

import path from 'path'
import _ from 'lodash'

import envTest from './test'
import envDevelopment from './development'
import envProduction from './production'
import localEnv from '../local.env'

var env = {
    production: envProduction,
    test: envTest,
    development: envDevelopment
}

// All configurations will extend these options
// ============================================
var all = {
    env: process.env.NODE_ENV,

    // Root path of server
    root: path.normalize(__dirname + '/../../..'),

    // REST-API
    port: process.env.PORT || 9090,
    ip: process.env.IP || '0.0.0.0',

};

// Export the config object based on the NODE_ENV
// ==============================================

export default _.merge(all, env[all.env] || {}, localEnv);