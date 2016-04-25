'use strict';

import uuid from 'node-uuid'
import _ from 'lodash'

export default {

    filters: [],

    /**
     *
     */
    hasFilters: function hasFilters() {
        return this.filters.length > 0;
    },

    /**
     * @returns [{}]
     */
    listFilters: function listFilters() {
        return this.filters;
    },

    /**
     * @return {}
     */
    getFilterByIndex: function getFilterByIndex(index) {
        return this.filters[index];
    },

    /*
     * @return {}
     */
    getFilterByUUID: function getFilterByUUID(uuid) {
        return _.find(this.filters, {uuid: uuid});
    },

    /**
     * @param filterConfig
     */
    removeFilter: function removeFilter(filterConfig) {
        delete filterConfig.uuid;
        this.filters.splice(this.filters.indexOf(filterConfig), 1);
    },

    /**
     *
     * @param {FilterConfig}
     */
    addFilter: function addFilter(filterConfig) {
        filterConfig = _.assign({}, filterConfig);

        var foundFilterIndex = _.findIndex(this.filters, {targetHost: filterConfig.targetHost, targetPort: filterConfig.targetPort});

        // TODO: this simply overwrites filters for the same targetHost, should be fixed.
        if (foundFilterIndex > -1) {
            _.merge(this.filters[foundFilterIndex], filterConfig);
        } else {
            filterConfig.uuid = uuid.v4();
            this.filters.push(filterConfig);
        }
    },

    /**
     * Clears all set filters
     */
    clear: function clear() {
        this.filters = [];
    }

}