'use strict';

import log from '../../../log/log'
import filter from '../../filters'

var exports = {};

/**
 * Get list of applied filters
 */

exports.index = function (req, res) {
    var filterList = filter.listFilters();
    res.status(200).send(filterList);
};

/**
 * add a new filter
 */
exports.create = function (req, res, next) {
    var filterObj = req.body;
    filter.addFilter(filterObj);
    return res.status(201).send(filter.listFilters());
};

/**
 * Get a single user
 */
exports.delete = function (req, res, next) {
    var filterObj = req.body;
    filter.removeFilter(filterObj);
    return res.status(204).send(filterObj);
};

export default exports;
