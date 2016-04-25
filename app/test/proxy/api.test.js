import should from 'should'
import restAPI from '../../components/proxy/api'
import filter from '../../components/proxy/filters'
import request from 'request-promise'
import http from 'http';

describe('Proxy: API', function () {

    var serviceAConfig = {hostname: 'serviceA', port: 80, proxyPort: 80};
    var serviceBConfig = {hostname: 'serviceB', port: 80, proxyPort: 80};

    var filterAConfig = {
        Traffic: 100,
        targetHost: serviceAConfig.hostname,
        targetPort: serviceAConfig.port
    };

    var filterBConfig = {
        Traffic: 100,
        targetHost: serviceBConfig.hostname,
        targetPort: serviceBConfig.port
    };

    var server = http.createServer(restAPI);

    before(function (done) {
        server.listen(9090, "127.0.0.1", function () {
            done();
        });
    });

    it('should have no filters defined from start', async function () {
        var response = await request({uri: 'http://localhost:9090/api/v1/filters', simple: false, resolveWithFullResponse: true, json: true});
        response.statusCode.should.be.equal(200);
        response.body.should.be.a.Array();
        response.body.should.be.empty();
    });

    it('should create a new filter after a POST', async function () {
        var response = await request({method: 'POST', uri: 'http://localhost:9090/api/v1/filters', simple: false, resolveWithFullResponse: true, body: filterBConfig, json: true});
        response.statusCode.should.be.equal(201);
        response.body.should.be.a.Array();

        delete response.body[0].uuid;

        response.body.should.be.eql([filterBConfig]);
    });

    it('should be able to keep multiple filters', async function () {
        var response = await request({method: 'POST', uri: 'http://localhost:9090/api/v1/filters', simple: false, resolveWithFullResponse: true, body: filterAConfig, json: true});
        response.statusCode.should.be.equal(201);
        response.body.should.be.a.Array();

        delete response.body[0].uuid;
        delete response.body[1].uuid;

        response.body.should.be.eql([filterBConfig, filterAConfig]);
    });

    it('should delete a specific filter', async function () {
        var response = await request({method: 'DELETE', uri: 'http://localhost:9090/api/v1/filters', simple: false, resolveWithFullResponse: true, body: filterAConfig, json: true});
        response.statusCode.should.be.equal(204);

        var response = await request({uri: 'http://localhost:9090/api/v1/filters', simple: false, resolveWithFullResponse: true, json: true});
        response.statusCode.should.be.equal(200);
        response.body.should.be.a.Array();

        delete response.body[0].uuid;

        response.body.should.be.eql([filterBConfig]);
    });

    after(function (done) {
        server.close();
        done();
    });

});