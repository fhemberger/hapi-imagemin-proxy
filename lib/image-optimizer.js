'use strict';

const Url = require('url');
const Path = require('path');
const Https = require('https');
const gm = require('gm');
const spawn = require('child_process').spawn;
const generaterr = require('generaterr');

const stream2buffer = require('./stream2buffer.js');

const internals = {};

internals.optimize = {
    jpg: {
        bin: require('jpegoptim-bin').path,
        args: [
            '--strip-all',
            '--all-progressive',
            '--stdin',
            '--stdout'
        ]
    },
    gif: {
        bin: require('gifsicle'),
        args: [
            '-O3'
        ]
    },
    png: {
        bin: require('optipng-stream-bin').path,
        args: []
    }
};


internals.resolveFilePath = function (basePath, filename) {

    if (!/^https?:\/\//.test(basePath) ) {
        return Path.join(basePath, filename);
    }

    const parsed = Url.parse(basePath);
    const path = Path.join(parsed.path, filename);
    const auth = parsed.auth ? `${parsed.auth}@` : '';

    return `${parsed.protocol}//${auth}${parsed.host}${path}`;
};


/**
 * `gm` doesn't support https URLs. In this case we load the file directly
 * and hand over the raw buffer to `gm` instead.
 */
internals.getSrcImage = function (srcImage, callback) {

    if (srcImage.startsWith('https://')) {
        return Https.get(srcImage, (res) => stream2buffer(res, callback));
    }

    return callback(null, srcImage);
};


internals.convertImage = function (options, callback) {

    const srcImage = internals.resolveFilePath(options.source, options.filename);

    internals.getSrcImage(srcImage, (err, srcImage) => {

        if (err) {
            return callback(err);
        }

        let destImage = gm(srcImage).noProfile();

        // Check if reading file and metadata worked
        destImage.size((err) => {

            if (err) {
                const LoadImageError = generaterr('LoadImageError', err);
                return callback(new LoadImageError(`Error loading ${srcImage}`));
            }

            // Resize image?
            if (options.width || options.height) {
                destImage = destImage
                    .resize(options.width, options.height)
                    .gravity('Center');
            }

            // Make sure transparent PNGs get a white background when converted to JPG
            if (options.format === 'jpg') {
                destImage = destImage
                    // Compression level is adjusted later in the process
                    .quality(100)
                    .background('#ffffff')
                    .flatten();
            }

            destImage.toBuffer(options.format, (err, buffer) => {

                if (err) {
                    const ResizeImageError = generaterr('ResizeImageError', err);
                    return callback(new ResizeImageError());
                }

                if (!buffer || !buffer.length) {
                    return callback(new Error('Zero byte response from image resizer'));
                }

                return callback(null, buffer);
            });
        });
    });
};


internals.optimizeImage = function (format, imageBuffer, callback) {

    const childProcess = spawn(internals.optimize[format].bin, internals.optimize[format].args);
    childProcess.stdin.write(imageBuffer);
    childProcess.stdin.end();

    stream2buffer(childProcess.stdout, (err, buffer) => {

        if (err) {
            const OptimizeImageError = generaterr('OptimizeImageError', err);
            return callback(new OptimizeImageError());
        }

        if (!buffer || !buffer.length) {
            return callback(new Error('Zero byte response from image optimizer'));
        }

        return callback(null, buffer);
    });
};


module.exports.getImage = function (options, callback) {

    internals.convertImage(options, (err, imageBuffer) => {

        if (err) {
            return callback(err);
        }

        internals.optimizeImage(options.format, imageBuffer, (err, optimizedBuffer) => {

            if (err) {
                return callback(err);
            }

            return callback(null, optimizedBuffer);
        });
    });
};
