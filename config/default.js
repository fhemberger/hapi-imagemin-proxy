'use strict';

const Path = require('path');


module.exports = {
    port: 5678,
    // hapi logging
    good: {
        reporters: [{
            reporter: require('good-console'),
            events: { log: '*', request: '*' },
            config: { format: 'YYYY-MM-DDTHH:mm:ss.SSS[Z]' }
        }]
    },
    optimizer: {
        source: Path.join(process.cwd(), 'demo')
    }
};
