'use strict';


module.exports = function (readStream, callback) {

    let errorState = null;
    const data = [];

    readStream.on('data', (chunk) => {

        if (errorState) {
            return;
        }

        data.push(chunk);
    });

    readStream.on('error', (err) => {

        callback(errorState = err);
    });

    readStream.on('end', () => {

        if (errorState) {
            return;
        }

        const buf = Buffer.concat(data);
        callback(null, buf);
    });
};
