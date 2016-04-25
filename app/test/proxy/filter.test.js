import should from 'should'
import filter from '../../components/proxy/filters'

describe('Filter:', function () {

    before(function (done) {
        filter.filters = [{uuid:1}, {uuid:2}];
        done();
    });

    it('should return the right amount of filters', function () {
        filter.hasFilters().should.be.true;
        filter.listFilters().should.have.lengthOf(2);
    });

    it('should return right filter if queried by UUID', function () {
        filter.getFilterByUUID(1).should.eql({uuid:1});
        filter.getFilterByUUID(2).should.eql({uuid:2});
    });

    it('should return right filter if queried by index', function () {
        filter.getFilterByIndex(0).should.eql({uuid:1});
        filter.getFilterByIndex(1).should.eql({uuid:2});
    });

    after(function (done) {
        done();
    });

});