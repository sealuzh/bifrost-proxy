import should from 'should'
import nock from 'nock'
import proxy from '../../components/proxy/proxy'
import filter from '../../components/proxy/filters'
import sessionStore from '../../components/proxy/session'
import request from 'request-promise'

describe('Sticky-Session: Session', function () {

    var serviceConfigA = {hostname: 'serviceA', port: 80, proxyPort: 80};
    var serviceAnswerA = {msg: 'reached proxied serviceA'};

    var server;

    before(function (done) {

        // mock default service
        nock('http://serviceA').filteringPath(function (path) {
            return '/';
        }).get('/').times(10).reply(200, serviceAnswerA);

        // launch proxy-server
        server = proxy.launch(serviceConfigA);

        done();

    });

    it('should get a session-id if none is set previously', async function () {
        var response = await request({uri: 'http://localhost:80/', simple: false, resolveWithFullResponse: true, json: true});
        response.headers.should.have.property('set-cookie').and.be.a.Array();
        response.headers['set-cookie'][0].should.startWith('BIFROST-SESSIONID=');
    });

    it('should not get a session-id if it is set previously, but instead receive the same', async function () {

        sessionStore.generate('c9799375-f1d4-4c2b-972a-aa032152c1fa');

        var j = request.jar();
        j.setCookie(request.cookie('BIFROST-SESSIONID=c9799375-f1d4-4c2b-972a-aa032152c1fa'), 'http://localhost:80/');

        var response = await request({uri: 'http://localhost:80/', simple: false, resolveWithFullResponse: true, json: true, jar: j});
        response.headers.should.not.have.property('set-cookie');

    });

    it('should be able to re-issue unknown session ids', async function () {

        sessionStore.purge('c9799375-f1d4-4c2b-972a-aa032152c1fa');

        var j = request.jar();
        j.setCookie(request.cookie('BIFROST-SESSIONID=c9799375-f1d4-4c2b-972a-aa032152c1fa'), 'http://localhost:80/');

        var response = await request({uri: 'http://localhost:80/', simple: false, resolveWithFullResponse: true, json: true, jar: j});
        response.headers.should.have.property('set-cookie').and.be.a.Array();
        response.headers['set-cookie'][0].should.startWith('BIFROST-SESSIONID=');

    });

    after(function (done) {
        nock.cleanAll();
        server.close();
        done();
    });

});