import should from 'should'
import nock from 'nock'
import proxy from '../../../components/proxy/proxy'
import filter from '../../../components/proxy/filters'
import request from 'request-promise'

describe('Filter: Header', function () {

    var serviceConfigA = {hostname: 'serviceA', port: 80, proxyPort: 80};
    var serviceConfigB = {hostname: 'serviceB', port: 80, proxyPort: 80};

    var serviceAnswerA = {msg: 'reached proxied serviceA'};
    var serviceAnswerB = {msg: 'reached proxied serviceB'};

    var headerFilter = {
        traffic: 100,
        field: 'X-HEADER-TEST',
        value: 'set',
        sticky: true,
        targetHost: serviceConfigB.hostname,
        targetPort: serviceConfigB.port
    };

    var server;


    before(function (done) {

        // mock default service
        nock('http://serviceA').filteringPath(function (path) {
            return '/';
        }).get('/').times(5).reply(200, serviceAnswerA);

        nock('http://serviceB').filteringPath(function (path) {
            return '/';
        }).get('/').times(5).reply(200, serviceAnswerB);

        // launch proxy-server
        server = proxy.launch(serviceConfigA);

        // add filter
        filter.addFilter(headerFilter);

        done();

    });

    it('should route requests without headers as usual', async function () {
        var response = await request({uri: 'http://localhost:80/', simple: false, resolveWithFullResponse: true, json: true});
        response.body.msg.should.be.eql(serviceAnswerA.msg);
    });

    it('should route requests with exact specific headers to assigned service', async function () {
        var response = await request({uri: 'http://localhost:80/', simple: false, resolveWithFullResponse: true, json: true, headers: {'X-HEADER-TEST': 'set'}});
        response.body.msg.should.be.eql(serviceAnswerB.msg);
    });

    it('should route requests with headers without matching as usual', async function () {
        var response = await request({uri: 'http://localhost:80/', simple: false, resolveWithFullResponse: true, json: true, headers: {'X-HEADER-TEST': 'sssettt'}});
        response.body.msg.should.be.eql(serviceAnswerA.msg);
    });

    it('should route requests with two filters based on their addition order', async function () {

        var headerFilter2 = {
            traffic: 100,
            field: 'X-HEADER-TEST2',
            value: 'set',
            targetHost: serviceConfigA.hostname,
            targetPort: serviceConfigA.port
        };

        filter.addFilter(headerFilter2);

        var response = await request({uri: 'http://localhost:80/', simple: false, resolveWithFullResponse: true, json: true, headers: {'X-HEADER-TEST': 'set', 'X-HEADER-TEST2': 'set'}});
        response.body.msg.should.be.eql(serviceAnswerA.msg);

    });

    after(function (done) {
        filter.removeFilter(headerFilter);
        nock.cleanAll();
        server.close();
        done();
    });

});