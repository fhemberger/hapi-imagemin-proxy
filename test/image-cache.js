'use strict';

const Code = require('code');
const Lab = require('lab');
const Sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();


// Test shortcuts
const lab = exports.lab = Lab.script();
const expect = Code.expect;
const describe = lab.describe;
const it = lab.it;


// Test stubs
/* eslint-disable hapi/hapi-scope-start, brace-style */
const Catbox = { Client: function (engine) { this.engine = engine; } };
Catbox.Client.prototype = {
    get   : Sinon.stub(),
    set   : Sinon.stub(),
    start : Sinon.stub()
};
/* eslint-enable hapi/hapi-scope-start, brace-style */


const ImageCache = proxyquire('../lib/image-cache.js', {
    'catbox'        : Catbox,
    'catbox-memory' : 'catbox-memory'
});


describe('Image Cache', () => {

    describe('constructor', () => {

        it('should use "catbox-memory" if no engine is specified', (done) => {

            const imageCache = new ImageCache();
            expect( imageCache._cache.engine ).to.equal( 'catbox-memory' );
            done();
        });


        it('should have a ttl of one hour if `options.expiresIn` is not given', (done) => {

            const imageCache = new ImageCache();
            expect( imageCache._ttl ).to.equal( 3600000 );
            done();
        });


        it('should set a ttl based on `options.expiresIn`', (done) => {

            const imageCache = new ImageCache(null, { expiresIn: 60000 });
            expect( imageCache._ttl ).to.equal( 60000 );
            done();
        });
    });


    describe('get', () => {

        it('should resolve on success', (done) => {

            const imageCache = new ImageCache();
            imageCache._cache.get.yields(null, { item: 'data' });
            imageCache.get('filename')
                .then((data) => {

                    expect( data ).to.equal( 'data' );
                    done();
                })
                .catch((err) => done(err));
        });


        it('should reject on error', (done) => {

            const imageCache = new ImageCache();
            imageCache._cache.get.yields(new Error('get'));
            imageCache.get('filename')
                .catch((err) => {

                    expect( err ).to.be.an.error(Error, 'get');
                    done();
                });
        });
    });


    describe('set', () => {

        it('should resolve on success', (done) => {

            const imageCache = new ImageCache();
            imageCache._cache.set.yields(null);
            imageCache.set('filename', 'data')
                .then((data) => {

                    expect( data ).to.equal( 'data' );
                    done();
                })
                .catch((err) => done(err));
        });


        it('should reject on error', (done) => {

            const imageCache = new ImageCache();
            imageCache._cache.set.yields(new Error('set'));
            imageCache.set()
                .catch((err) => {

                    expect( err ).to.be.an.error(Error, 'set');
                    done();
                });
        });
    });


    describe('start', () => {

        it('should start the caching engine', (done) => {

            const imageCache = new ImageCache();
            imageCache._cache.start.yields(null);
            imageCache.start()
                .then(() => {

                    expect( true ).to.be.true();
                    done();
                })
                .catch((err) => done(err));
        });

        it('should reject on error', (done) => {

            const imageCache = new ImageCache();
            imageCache._cache.start.yields(new Error('start'));
            imageCache.start()
                .catch((err) => {

                    expect( err ).to.be.an.error(Error, 'start');
                    done();
                });
        });
    });

});
