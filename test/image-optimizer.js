'use strict';

const Path = require('path');
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
/* eslint-disable brace-style, hapi/hapi-scope-start */
const jpeg = new Buffer(new Uint8Array([0xFF, 0xD8]));
const imageminGmStub = {
    convert : Sinon.stub().returns(() => { Promise.resolve(jpeg); }),
    resize  : Sinon.stub().returns(() => { Promise.resolve(jpeg); })
};
const imageOptimizer = proxyquire('../lib/image-optimizer.js', { 'imagemin-gm': imageminGmStub });
/* eslint-enable brace-style, hapi/hapi-scope-start */


describe('Image Optimizer', () => {

    describe('fullPath', () => {

        it('should return a valid path for local files', (done) => {

            expect( imageOptimizer.fullPath('/foo/bar', '/baz.jpg') ).to.equal('/foo/bar/baz.jpg');
            expect( imageOptimizer.fullPath('/foo/bar/', '/baz.jpg') ).to.equal('/foo/bar/baz.jpg');
            done();
        });


        it('should return a valid URL for remote files', (done) => {

            expect( imageOptimizer.fullPath('http://foo.bar', '/baz.jpg') ).to.equal('http://foo.bar/baz.jpg');
            expect( imageOptimizer.fullPath('http://foo.bar/baz', 'zing/zang.jpg') ).to.equal('http://foo.bar/baz/zing/zang.jpg');
            expect( imageOptimizer.fullPath('http://basic:auth@foo.bar/', '/baz.jpg') ).to.equal('http://basic:auth@foo.bar/baz.jpg');
            done();
        });
    });


    describe('get', () => {

        it('should load a local file and return its content', (done) => {

            imageOptimizer.get(Path.join(process.cwd(), '.gitignore'))
                .then(( content ) => {

                    expect(content).to.exist();
                    done();
                })
                .catch((err) => done(err));
        });


        it('should reject if the local file could not be loaded', (done) => {

            imageOptimizer.get('nonexistantfile')
                .catch((err) => {

                    expect( err ).to.be.an.error();
                    done();
                });
        });


        it('should GET a remote file and return its content', (done) => {

            imageOptimizer.get('http://example.com/')
                .then((content) => {

                    expect( content ).to.exist();
                    done();
                })
                .catch((err) => done(err));
        });


        it('should reject if the remote file could not be loaded', (done) => {

            imageOptimizer.get('http://nonexistantdomainna.me')
                .catch((err) => {

                    expect( err ).to.be.an.error();
                    done();
                });
        });
    });


    describe('optimize', () => {

        /* eslint-disable brace-style, hapi/hapi-scope-start */
        it('should convert image formats', (done) => {

            imageOptimizer.optimize(jpeg, { format: 'png', plugins: [] });
            expect( imageminGmStub.convert.calledOnce ).to.be.true();
            done();
        });

        it('should resize the image', (done) => {

            imageOptimizer.optimize(jpeg, { width: 100, plugins: [] });
            expect( imageminGmStub.resize.calledOnce ).to.be.true();
            done();
        });

        it('should pass the original buffer if no plugins were given', (done) => {

            const result = imageOptimizer.optimize(jpeg, { plugins: [] });
            expect( result ).to.equal( Promise.resolve(jpeg) );
            done();
        });
    });

});
