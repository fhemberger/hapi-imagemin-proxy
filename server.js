'use strict';

const Hapi   = require('hapi');
const Config = require('config');

const server = new Hapi.Server();

const internals = {};
internals.plugins = [
    { register: require('good'),           options: Config.good },
    { register: require('./lib/index.js'), options: Config.optimizer }
];


server.connection({
    port: Number(process.env.PORT) || Config.port
});

server.register(internals.plugins, (err) => {

    if (err) {
        throw err;
    }

    // We don't serve their kind here
    server.route({
        method: 'GET',
        path: '/favicon.ico',
        handler: function (request, reply) {

            reply().code(404);
        }
    });

    server.start(() => {

        if (process.env.NODE_ENV === 'test') {
            return;
        }
        server.log('info', `Server running at: ${server.info.uri}`);
    });
});
