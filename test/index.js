'use strict';

const Hapi = require('hapi');
const Code = require('code');
const Lab = require('lab');


// Test shortcuts
const lab = exports.lab = Lab.script();
const expect = Code.expect;
const before = lab.before;
const after = lab.after;
const describe = lab.describe;
const it = lab.it;


describe('imageoptimizer-proxy', () => {

    const Config = require('config');
    const server = new Hapi.Server();


    before((done) => {

        server.connection({ port: Config.port });

        server.register(
            { register: require('../lib/index.js'), options: Config.optimizer },
            (err) => {

                if (err) {
                    throw err;
                }

                server.start(done);
            }
        );
    });


    after((done) => {

        server.stop({ timeout: 0 }, () => {

            done();
        });
    });


    describe('Hapi server', () => {

        it('is running', (done) => {

            expect(new Date(server.info.started)).to.be.a.date();
            done();
        });
    });


    describe('Plugin', () => {

        it('should respond with HTTP 404 (Not Found) for /', (done) => {

            server.inject('/', (res) => {

                expect( res.statusCode ).to.equal( 404 );
                done();
            });
        });


    });
});
