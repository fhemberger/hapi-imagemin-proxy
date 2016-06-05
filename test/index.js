'use strict';

const Hapi = require('hapi');
const Code = require('code');
const Lab = require('lab');
const Boom = require('boom');
const Sinon = require('sinon');
const proxyquire = require('proxyquire').noCallThru();


// Test shortcuts
const lab = exports.lab = Lab.script();
const expect = Code.expect;
const before = lab.before;
const after = lab.after;
const describe = lab.describe;
const it = lab.it;


// Test stubs
const jpeg = new Buffer(new Uint8Array([0xFF, 0xD8]));
const imageOptimizer = {
    get      : Sinon.stub(),
    fullPath : Sinon.stub(),
    optimize : Sinon.stub()
};
const imageCache = {
    get   : Sinon.stub(),
    set   : Sinon.stub(),
    start : Sinon.stub()
};
const ImageCache = function () {};
ImageCache.prototype = imageCache;

const plugin = proxyquire('../lib/index.js', {
    './image-optimizer.js' : imageOptimizer,
    './image-cache.js'     : ImageCache
});


describe('hapi-imagemin-proxy', () => {

    const server = new Hapi.Server({ debug: false });

    before((done) => {

        imageCache.start.returns(Promise.resolve());
        server.connection({ port: 5678 });
        server.register(
            { register: plugin, options: { source: __dirname } },
            (err) => err ? done(err) : server.start(done));
    });


    after((done) => {

        server.stop({ timeout: 0 }, (err) => done(err));
    });


    it('is running', (done) => {

        expect(new Date(server.info.started)).to.be.a.date();
        done();
    });


    it('should respond with HTTP 404 if no matching file name was provided in URL', (done) => {

        server.inject('/', (res) => {

            expect( res.statusCode ).to.equal( 404 );
            done();
        });
    });


    it('should respond with cached image data on cache hit', (done) => {

        imageCache.get.returns(Promise.resolve(jpeg));

        server.inject('/imagename.jpg', (res) => {

            expect( res.rawPayload ).to.only.include( jpeg );
            expect( res.statusCode ).to.equal( 200 );
            done();
        });
    });


    it('should load the image file on cache miss', (done) => {

        imageCache.get.returns(Promise.resolve());
        imageCache.set.returns(Promise.resolve(jpeg));
        imageOptimizer.get.returns(Promise.resolve());

        server.inject('/imagename.jpg', (res) => {

            expect( res.rawPayload ).to.only.include( jpeg );
            expect( res.statusCode ).to.equal( 200 );
            done();
        });
    });


    it('should return HTTP 404 if image file could not be loaded', (done) => {

        const err = Boom.wrap(new Error('ENOENT: no such file or directory'), 404);
        imageCache.get.returns(Promise.reject(err));

        server.inject('/imagename.jpg', (res) => {

            expect( res.statusCode ).to.equal( 404 );
            expect( JSON.parse(res.payload).message ).to.not.exist();
            done();
        });
    });


    it('should return HTTP 500 on error', (done) => {

        const err = Boom.wrap(new Error(), 500);
        imageCache.get.returns(Promise.reject(err));

        server.inject('/imagename.jpg', (res) => {

            expect( res.statusCode ).to.equal( 500 );
            expect( JSON.parse(res.payload).message ).to.equal('An internal server error occurred');
            done();
        });
    });

});
