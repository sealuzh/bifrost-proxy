'use strict'

import 'babel-polyfill'

import config from './config/environment'
import proxy from './components/proxy/proxy'
import restAPI from './components/proxy/api'
import log from './components/log/log'
import http from 'http'

var port = process.env.PROXIED_PORT || 80;
var host = process.env.PROXIED_HOST;

proxy.launch({port: port, hostname: host, proxyPort: port});

// Start REST-API of Proxy
var server = http.createServer(restAPI);

server.listen(config.port, config.ip, function () {
    log.info('express server listening on %d, in %s mode', config.port, restAPI.get('env'));
});