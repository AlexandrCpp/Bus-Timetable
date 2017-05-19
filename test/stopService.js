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

let stopRepository = dbcontext.stop;
let busRepository = dbcontext.bus;
let routerRepository = dbcontext.router;
let routerBelongRepository = dbcontext.routerBelong;
let userRepository = dbcontext.user;


var stopService = require('../services/stop')(stopRepository, busRepository,routerRepository, routerBelongRepository, userRepository, errors);

var sandbox;
beforeEach(function () {
    sandbox = sinon.sandbox.create();
});

afterEach(function () {
    sandbox.restore();
});

let stopObj = {
    id: 1,
    serialNumber: "2",
    departureTime: "2",
    update: function () {

    }
};

let stopObjWithInfo = {
    id: 1,
    serialNumber: "2",
    departureTime: "2",
    stop: {},
    update: function () {

    },
    userId: 1
};

var tokenUserId = getTokenId(1);
describe('Запрос на /stops', ()=> {
    describe('методом GET должен', () => {
        it('отдавать массив остановок', () => {
            sandbox.stub(stopRepository, 'findAll').returns(Promise.resolve([stopObj, stopObj]));
            let promise = stopService.readAll();
            return promise.then((result)=> {
                result.should.be.an.Array();
            })

        });
    });
});

describe('Запрос на /stops/:id', ()=> {
    describe('методом GET должен', () => {
        it('выбрасывать 400 если идентификатор меньше либо равен 0', () => {
            let promise = stopService.read(-1);
            return promise.catch((result)=> {
                result.status.should.be.equal(errors.badRequest.status);
            })

        });
        it('выбрасывать 404 если нет остановки', () => {
            sandbox.stub(routerBelongRepository, 'findAll').returns(Promise.resolve(null));
            let promise = stopService.read(1,tokenUserId);
            return promise.catch((result)=> {
                result.status.should.be.equal(errors.notFound.status);
            })

        });
        it('отдавать подробную информацию об остановке', () => {
            sandbox.stub(routerBelongRepository, 'findAll').returns(Promise.resolve(stopObjWithInfo));
            let promise = stopService.read(1, tokenUserId);
            return promise.then((result)=> {
                result.should.be.a.object;
                result.should.have.property('stop');
                result.should.have.property('serialNumber');
            })

        });
    });


    describe('методом DELETE должен', () => {
        it('выбрасывать 400 если идентификатор меньше либо равен 0', () => {
            let promise = stopService.delete(-1,tokenUserId);
            return promise.catch((result)=> {
                result.status.should.be.equal(errors.badRequest.status);
            })

        });
        it('выбрасывать 404 если остановка не найдена', () => {
            sandbox.stub(stopRepository, 'findOne').returns(Promise.resolve(null));
            let promise = stopService.delete(1,tokenUserId);
            return promise.catch((result)=> {
                result.status.should.be.equal(errors.notFound.status);
            })

        });
        it('выбрасывать исключение если токен подделан', () => {
            sandbox.stub(stopRepository, 'findOne').returns(Promise.resolve("h"));
            let promise = stopService.delete(1,tokenUserId + 1);
            return promise.catch((result)=> {
                result.status.should.be.equal(errors.invalidSignature.status);
            })

        });
        it('запрещать доступ если не админ',() => {
            sandbox.stub(stopRepository, 'findOne').returns(Promise.resolve(stopObj));
            sandbox.stub(userRepository, 'findOne').returns(Promise.resolve(stopObj));
            let tokenUserId = getTokenId(2);
            let promise = stopService.delete(1,tokenUserId);
            return promise.catch((result)=> {
                result.status.should.be.equal(errors.accessDenied.status);
            })

        });
    });

});

function getTokenId(userId) {
    return jwt.sign({userId: userId}, 'userToken');
}
