'use strict';

const Path = require('path');
const Boom = require('boom');
const XRegExp = require('xregexp').XRegExp;
const ImageCache = require('./image-cache.js');
const ImageOptimizer = require('./image-optimizer.js');

const internals = {};

internals.pathPattern = XRegExp(
    `^
        (?<filename>.+?(?:jpe?g|gif|png|svg))  # File name
        (?:,w(?<width>\\d{1,4})(?=,|$))?       # Width
        (?:,h(?<height>\\d{1,4})(?=,|$))?      # Height
        (?:,(?<format>jpe?g|gif|png|svg))?     # Output format
    $`, 'x');


exports.register = function (server, options, next) {

    const mime = server.mime._byExtension;

    const config = options.imagecache || {};
    const cache = ImageCache.init(config.strategy, config.ttl, config.options);

    server.route({
        method: 'GET',
        path: '/{param*}',
        config: {
            cache: options.cache
        },
        handler: function (request, reply) {

            const parsedPath = XRegExp.exec(request.path, internals.pathPattern);

            if (!parsedPath) {
                return reply(Boom.notFound());
            }

            const originalFormat = Path.extname(parsedPath.filename).replace(/^\./, '');

            const imageOptions = {
                source   : options.source,
                filename : parsedPath.filename,
                width    : parsedPath.width,
                height   : parsedPath.height,
                format   : parsedPath.format || originalFormat
            };

            if (imageOptions.format === 'jpeg') {
                imageOptions.format = 'jpg';
            }

            // Executed on cache miss, the result is stored afterwards
            const cacheMiss = function (callback) {

                server.log(['debug'], `cache miss: ${request.path}`);
                ImageOptimizer.getImage(imageOptions, callback);
            };

            cache.get(request.path, cacheMiss, (err, data) => {

                if (err) {
                    server.log(['error'], err);

                    const type = err.name === 'LoadImageError' ?
                        'notFound' :
                        'badImplementation';

                    return reply(Boom[type]());
                }

                server.log(['debug'], `cache hit: ${request.path}`);

                return reply(data)
                    .type(mime[imageOptions.format].type);
            });
        }
    });


    cache.start((err) => {

        if (err) {
            throw err;
        }

        return next();
    });
};


exports.register.attributes = {
    pkg: require('../package.json')
};
