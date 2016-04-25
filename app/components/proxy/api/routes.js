'use strict';

import filterRoute from './filter'

export default function (app) {

    // Register Routes
    app.use('/api/v1/filters', filterRoute);

    // All undefined asset or api routes should return a 404
    app.route('/*').get(function (req, res) {
        res.status(404).send({msg: 'route not found'});
    });

};
