'use strict';
const Sequelize = require('sequelize');
const assert = require("assert");
const sinon = require('sinon');
var should = require('should');
const config = require('../config');
const dbcontext = require('../context/db')(Sequelize, config);
const errors = require('../utils/errors');
const jwt = require('jsonwebtoken');
const Promise = require("bluebird");

let routerRepository = dbcontext.router;
let userRepository = dbcontext.user;


var routerService = require('../services/router')(routerRepository, userRepository, errors);

var sandbox;
beforeEach(function () {
    sandbox = sinon.sandbox.create();
});

afterEach(function () {
    sandbox.restore();
});

let routerObj = {
    id: 1,
    name: "2",
    update: function () {

    }
};

let routerObjWithInfo = {
    id: 1,
    name: "2",
    update: function () {

    }
};

var tokenUserId = getTokenId(1);
describe('Запрос на /routers', ()=> {
    describe('методом GET должен', () => {
        it('отдавать массив путей', () => {
            sandbox.stub(routerRepository, 'findAll').returns(Promise.resolve([routerObj, routerObj]));
            let promise = routerService.readAll();
            return promise.then((result)=> {
                result.should.be.an.Array();
            })

        });
    });
});

describe('Запрос на /routers/:id', ()=> {
    describe('методом GET должен', () => {
        it('выбрасывать 400 если идентификатор меньше либо равен 0', () => {
            let promise = routerService.read(-1);
            return promise.catch((result)=> {
                result.status.should.be.equal(errors.badRequest.status);
            })

        });
        it('выбрасывать 404 если нет пути', () => {
            sandbox.stub(routerRepository, 'findOne').returns(Promise.resolve(null));
            let promise = routerService.read(1,tokenUserId);
            return promise.catch((result)=> {
                result.status.should.be.equal(errors.notFound.status);
            })

        });
        it('отдавать подробную информацию об пути', () => {
            sandbox.stub(routerRepository, 'findOne').returns(Promise.resolve(routerObjWithInfo));
            let promise = routerService.read(1, tokenUserId);
            return promise.then((result)=> {
                result.should.be.a.object;
                result.should.have.property('name');
            })

        });
    });


    describe('методом DELETE должен', () => {
        it('выбрасывать 400 если идентификатор меньше либо равен 0', () => {
            let promise = routerService.delete(-1,tokenUserId);
            return promise.catch((result)=> {
                result.status.should.be.equal(errors.badRequest.status);
            })

        });
        it('выбрасывать 404 если остановка не найдена', () => {
            sandbox.stub(routerRepository, 'findOne').returns(Promise.resolve(null));
            let promise = routerService.delete(1,tokenUserId);
            return promise.catch((result)=> {
                result.status.should.be.equal(errors.notFound.status);
            })

        });
        it('выбрасывать исключение если токен подделан', () => {
            sandbox.stub(routerRepository, 'findOne').returns(Promise.resolve("h"));
            let promise = routerService.delete(1,tokenUserId + 1);
            return promise.catch((result)=> {
                result.status.should.be.equal(errors.invalidSignature.status);
            })

        });
        it('запрещать доступ если не админ',() => {
            sandbox.stub(routerRepository, 'findOne').returns(Promise.resolve(routerObj));
            sandbox.stub(userRepository, 'findOne').returns(Promise.resolve(routerObj));
            let tokenUserId = getTokenId(2);
            let promise = routerService.delete(1,tokenUserId);
            return promise.catch((result)=> {
                result.status.should.be.equal(errors.accessDenied.status);
            })

        });
    });

});

function getTokenId(userId) {
    return jwt.sign({userId: userId}, 'userToken');
}
