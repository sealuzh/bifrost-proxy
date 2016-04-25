import should from 'should'
import nock from 'nock'
import proxy from '../../../components/proxy/proxy'
import filter from '../../../components/proxy/filters'
import sessionStore from '../../../components/proxy/session'
import request from 'request-promise'

describe('Filter: Traffic', function () {

    var serviceConfigA = {hostname: 'serviceA', port: 80, proxyPort: 80};
    var serviceConfigB = {hostname: 'serviceB', port: 80, proxyPort: 80};
    var serviceConfigC = {hostname: 'serviceC', port: 80, proxyPort: 80};

    var serviceAnswerA = 'reached proxied serviceA';
    var serviceAnswerB = 'reached proxied serviceB';
    var serviceAnswerC = 'reached proxied serviceB';

    var trafficFilter = {
        traffic: 100,
        targetHost: serviceConfigB.hostname,
        targetPort: serviceConfigB.port
    };

    var trafficFilterReset = {
        traffic: 0,
        targetHost: serviceConfigB.hostname,
        targetPort: serviceConfigB.port
    };

    var trafficFilterShadow = {
        traffic: 100,
        shadow: true,
        targetHost: serviceConfigC.hostname,
        targetPort: serviceConfigC.port
    };

    var server;

    before(function (done) {

        // mock default service
        nock(`http://serviceA`).filteringPath(function (path) {
            return '/';
        }).get('/').times(10).reply(200, serviceAnswerA);

        nock(`http://serviceB`).filteringPath(function (path) {
            return '/';
        }).get('/').times(10).reply(200, serviceAnswerB);

        // launch proxy-server
        server = proxy.launch(serviceConfigA);

        done();

    });

    it('should route traffic by default to the proxied service', async function () {
        var response = await request({uri: 'http://localhost:80/', simple: false, resolveWithFullResponse: true, json: true});
        response.body.should.be.eql(serviceAnswerA);
    });

    it('should route redirect traffic to alternative services', async function () {

        // add redirect-all filter
        filter.addFilter(trafficFilter);

        var response = await request({uri: 'http://localhost:80/', simple: false, resolveWithFullResponse: true, json: true});
        response.body.should.be.eql(serviceAnswerB);

        filter.removeFilter(trafficFilter);

    });

    it('should route redirect traffic to alternative services, also with session', async function () {

        sessionStore.generate('c9799375-f1d4-4c2b-972a-aa032152c1fa');

        // set session-cookie
        var j = request.jar();
        j.setCookie(request.cookie('BIFROST-SESSIONID=c9799375-f1d4-4c2b-972a-aa032152c1fa'), 'http://localhost:80/');

        // add redirect-all filter
        filter.addFilter(trafficFilter);

        var response = await request({uri: 'http://localhost:80/', simple: false, resolveWithFullResponse: true, json: true, jar: j});
        response.body.should.be.eql(serviceAnswerB);

        filter.addFilter(trafficFilterReset);

        var response = await request({uri: 'http://localhost:80/', simple: false, resolveWithFullResponse: true, json: true, jar: j});
        response.body.should.be.eql(serviceAnswerA);

        var response = await request({uri: 'http://localhost:80/', simple: false, resolveWithFullResponse: true, json: true, jar: j});
        response.body.should.be.eql(serviceAnswerA);

        filter.removeFilter(trafficFilterReset);

    });

    it('should route redirect traffic based on assigned weight', async function () {

        // add redirect-none filter
        filter.addFilter(trafficFilterReset);

        var response = await request({uri: 'http://localhost:80/', simple: false, resolveWithFullResponse: true, json: true});
        response.body.should.be.eql(serviceAnswerA);

        filter.removeFilter(trafficFilterReset);

    });

    it('adding the same filter twice should overwrite it', async function () {

        filter.addFilter(trafficFilter);
        filter.listFilters().length.should.be.eql(1);
        filter.listFilters()[0].traffic.should.be.eql(100);

        filter.addFilter(trafficFilterReset);
        filter.listFilters().length.should.be.eql(1);
        filter.listFilters()[0].traffic.should.be.eql(0);

    });

    it('should route redirect traffic based on assigned weight', async function () {

        // add redirect-none filter
        filter.addFilter(trafficFilterReset);

        var response = await request({uri: 'http://localhost:80/', simple: false, resolveWithFullResponse: true, json: true});
        response.body.should.be.eql(serviceAnswerA);

        filter.removeFilter(trafficFilterReset);

    });

    it('should shadow-route requests', async function () {

        var shadowRequest = nock(`http://serviceC`).get('/').reply(200, serviceAnswerC);
        var shadowRequest2 = nock(`http://serviceC`).get('/testEndpoint').reply(200, serviceAnswerC);
        var shadowRequest3 = nock(`http://serviceC`).get('/testEndpoint/testli/what?about=this').reply(200, serviceAnswerC);

        // add shadow-traffic filter
        filter.addFilter(trafficFilterShadow);

        var response = await request({uri: 'http://localhost:80/testEndpoint', simple: false, resolveWithFullResponse: true, json: true});
        response.body.should.be.eql(serviceAnswerA);

        var response = await request({uri: 'http://localhost:80/', simple: false, resolveWithFullResponse: true, json: true});
        response.body.should.be.eql(serviceAnswerA);

        var response = await request({uri: 'http://localhost:80/testEndpoint/testli/what?about=this', simple: false, resolveWithFullResponse: true, json: true});
        response.body.should.be.eql(serviceAnswerA);

        shadowRequest.isDone().should.be.eql(true);
        shadowRequest2.isDone().should.be.eql(true);
        shadowRequest3.isDone().should.be.eql(true);

    });

    after(function (done) {
        nock.cleanAll();
        server.close();
        done();
    });

});