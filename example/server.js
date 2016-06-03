'use strict';

const Path   = require('path');
const Hapi   = require('hapi');
const server = new Hapi.Server();

const internals = {};
internals.plugins = [
    {
        register: require('good'),
        options: {
            reporters: {
                console: [
                    {
                        module: 'good-squeeze',
                        name: 'Squeeze',
                        args: [{ log: '*', request: '*' }]
                    },
                    {
                        module: 'good-console',
                        args: [{ format: 'YYYY-MM-DDTHH:mm:ss.SSS[Z]' }]
                    },
                    'stdout'
                ]
            }
        }
    },
    {
        register: require('../lib/index.js'),
        options: {
            source: Path.join(process.cwd(), 'images')
        }
    }
];

server.connection({
    port: Number(process.env.PORT) || 5678
});

server.register(internals.plugins, (err) => {

    if (err) {
        throw err;
    }

    // We don't serve their kind here
    server.route({
        method: 'GET',
        path: '/favicon.ico',
        handler: (request, reply) => reply().code(404)
    });

    server.start(() => server.log('info', `Server running at: ${server.info.uri}`));
});
