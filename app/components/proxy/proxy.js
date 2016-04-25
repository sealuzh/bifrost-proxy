'use strict';

import httpProxy from 'http-proxy'
import http from 'http'
import log from '../log/log'
import filter from './filters'
import cookies from 'cookies'
import sessionStore from './session'
import httpMocks from 'node-mocks-http';
import request from 'request'
import util from 'util'

export default {launch: launch};

var BIFROST_SESSION_ID_COOKIE = 'BIFROST-SESSIONID';

/**
 * @param config
 */
function launch(config) {

    // clear filters
    filter.clear();

    //var agent = new http.Agent({keepAlive: true});
    //var proxy = httpProxy.createProxy({agent: agent});
    var proxy = httpProxy.createProxy();

    proxy.on('error', function (err, req, res) {
        res.writeHead(500, {
            'Content-Type': 'text/plain'
        });

        res.end('proxied Service could probably not be reached.');
    });

    var server = http.createServer(function (req, res) {

        var options = {target: `http://${config.hostname}:${config.port}`, shadow: []};
        var cookieJar = new cookies(req, res);
        var sessionId = null;

        if (cookieJar.get(BIFROST_SESSION_ID_COOKIE) === undefined) {
            sessionId = sessionStore.generate();
            cookieJar.set(BIFROST_SESSION_ID_COOKIE, sessionId);
            log.debug(`new session ${sessionId}`);
        } else {
            sessionId = cookieJar.get(BIFROST_SESSION_ID_COOKIE);

            if (!sessionStore.exists(sessionId)) {
                log.debug(`${sessionId} is old - reissue.`);
                sessionId = sessionStore.generate();
                cookieJar.set(BIFROST_SESSION_ID_COOKIE, sessionId);
            }

            log.debug(`session identified or re-issued as ${sessionId}`);
        }

        if (filter.hasFilters()) {
            routeRequest(req, filter.listFilters(), options, sessionId);
            log.debug(`proxying request...`);
            log.debug(options);
        }

        // default: redirect everything to target service
        options.shadow.forEach(function(shadowTarget) {
            request({method: req.method, uri: shadowTarget + req.url, headers: req.headers});
        });

        proxy.web(req, res, options);

    });

    log.debug(`proxy setup for http://${config.hostname}:${config.port}`);
    return server.listen(config.proxyPort);

}

/**
 *
 * @param filters
 * @param options
 */
function routeRequest(req, filters, options, sessionId) {
    log.debug(`having ${filters.length} filters setup`);

    filters.forEach(filterConfig => {

        if (filterConfig.sticky) {
            if (sessionStore.isFilterRegistered(sessionId, filterConfig.uuid)) {
                if (sessionStore.isFilterActive(sessionId, filterConfig.uuid)) {
                    setTarget(options, filterConfig);
                }
            } else {
                if (filterConfig.hasOwnProperty("field")) {
                    if (req.headers[filterConfig.field.toLowerCase()] == filterConfig.value) {
                        withChance(filterConfig.traffic !== undefined ? filterConfig.traffic : 100, function () { // either use the chance provided by the filter, or re-route all.
                            sessionStore.addFilter(sessionId, filterConfig.uuid, true);
                            setTarget(options, filterConfig);
                        }, function () {
                            sessionStore.addFilter(sessionId, filterConfig.uuid, false);
                        });
                    }
                } else {
                    log.debug("CHANCE %s", filterConfig.traffic !== undefined ? filterConfig.traffic : 100);
                    withChance(filterConfig.traffic !== undefined ? filterConfig.traffic : 100, function () { // either use the chance provided by the filter, or re-route all.
                        sessionStore.addFilter(sessionId, filterConfig.uuid, true);
                        setTarget(options, filterConfig);
                    }, function () {
                        sessionStore.addFilter(sessionId, filterConfig.uuid, false);
                    });
                }
            }
        } else {
            withChance(filterConfig.traffic !== undefined ? filterConfig.traffic : 100, function () { // either use the chance provided by the filter, or re-route all.
                setTarget(options, filterConfig);
            });
        }

    });
}

/**
 * Set new target on proxy-http-options object
 * @param options
 */
function setTarget(options, filterConfig) {
    if (filterConfig.shadow) {
        options.shadow.push(`http://${filterConfig.targetHost}:${filterConfig.targetPort}`);
        return;
    }
    options.target = `http://${filterConfig.targetHost}:${filterConfig.targetPort}`;
}

/**
 *
 * @param percentage
 * @param effect
 */
function withChance(percentage, effect, countereffect) {
    if ((Math.random() * 100) < percentage) {
        if (effect) effect();
    } else {
        if (countereffect) countereffect();
    }
}