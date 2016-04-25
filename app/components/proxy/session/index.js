import uuid from 'node-uuid'
import Map from 'collections/map'
import filterList from '../filters'
import _ from 'lodash'

export default {

    sessions: new Map(),

    /**
     * Generates a new Session with a corresponding sessionID
     * @returns {String}
     */
    generate: function generate(sessionId) {
        if (!sessionId) {
            sessionId = uuid.v4();
        }
        this.sessions.set(sessionId, {});
        return sessionId;
    },

    /**
     * Checks whether a specific session exists
     * @param sessionId
     * @returns {Boolean}
     */
    exists: function exists(sessionId) {
        return this.sessions.has(sessionId);
    },

    /**
     * Deletes all information about a session
     * @param sessionId
     */
    purge: function purge(sessionId) {
        return this.sessions.delete(sessionId);
    },

    /**
     *
     * @param sessionId
     * @param filterId
     * @param active
     */
    addFilter: function addFilter(sessionId, filterId, active) {
        var filters = {};

        if (this.exists(sessionId)) {
            filters = this.sessions.get(sessionId);
        }

        filters[filterId] = {active: active};
        this.sessions.set(sessionId, filters);
    },

    /**
     *
     * @param sessionId
     * @param filterId
     * @returns {Boolean}
     */
    isFilterRegistered: function isActive(sessionId, filterId) {
        return this.sessions.get(sessionId)[filterId] !== undefined;
    },

    /**
     *
     * @param sessionId
     * @param filterId
     * @returns {Boolean}
     */
    isFilterActive: function isActive(sessionId, filterId) {
        return this.sessions.get(sessionId)[filterId];
    }

}