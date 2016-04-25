'use strict';

import morgan from 'morgan'
import compression from 'compression'
import bodyParser from 'body-parser'
import methodOverride from 'method-override'
import errorHandler from 'errorhandler'

export default function (app) {
    var env = app.get('env');

    app.use(compression());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(bodyParser.json());
    app.use(methodOverride());

    if ('production' === env) {
        app.use(morgan());
    }

    if ('development' === env) {
        app.use(morgan());
        app.use(errorHandler()); // Error handler - has to be last
    }

}