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
let historyRepository = dbcontext.history;
let busRepository = dbcontext.bus;
let routerRepository = dbcontext.router;
let routerBelongRepository = dbcontext.routerBelong;
let userRepository = dbcontext.user;

const historyService = require('../services/history')(userRepository, historyRepository, errors);
var busService = require('../services/bus')(busRepository, routerRepository,routerBelongRepository, stopRepository, userRepository, historyService, errors);

var sandbox;
beforeEach(function () {
    sandbox = sinon.sandbox.create();
});

afterEach(function () {
    sandbox.restore();
});

let busObj = {
    id: 1,
    number: "2",
    routerId:"1",
    update: function () {

    }
};

let busObjWithInfo = {
    id: 1,
    number: "2",
    serialNumber: "2",
    stop: {},
    update: function () {

    },
    userId: 1
};

var tokenUserId = getTokenId(1);
describe('Запрос на /buses', ()=> {
    describe('методом GET должен', () => {
        it('отдавать массив автобусов', () => {
            sandbox.stub(routerRepository, 'findAll').returns(Promise.resolve([busObj, busObj]));
            let promise = busService.readAll();
            return promise.then((result)=> {
                result.should.be.an.Array();
            })

        });
    });
});

describe('Запрос на /buses/:id', ()=> {
    describe('методом GET должен', () => {
        it('выбрасывать 400 если идентификатор меньше либо равен 0', () => {
            let promise = busService.read(-1);
            return promise.catch((result)=> {
                result.status.should.be.equal(errors.badRequest.status);
            })

        });
        it('выбрасывать 404 если нет автобуса', () => {
            sandbox.stub(routerBelongRepository, 'findAll').returns(Promise.resolve(null));
            let promise = busService.read(1,tokenUserId);
            return promise.catch((result)=> {
                result.status.should.be.equal(errors.notFound.status);
            })

        });
        it('отдавать подробную информацию о автобусе', () => {
            sandbox.stub(routerBelongRepository, 'findAll').returns(Promise.resolve(busObjWithInfo));
            let promise = busService.read(1, tokenUserId);
            return promise.then((result)=> {
                result.should.be.a.object;
                result.should.have.property('stop');
                result.should.have.property('serialNumber');
            })

        });
    });


    describe('методом DELETE должен', () => {
        it('выбрасывать 400 если идентификатор меньше либо равен 0', () => {
            let promise = busService.delete(-1,tokenUserId);
            return promise.catch((result)=> {
                result.status.should.be.equal(errors.badRequest.status);
            })

        });
        it('выбрасывать 404 если автобус не найдена', () => {
            sandbox.stub(busRepository, 'findOne').returns(Promise.resolve(null));
            let promise = busService.delete(1,tokenUserId);
            return promise.catch((result)=> {
                result.status.should.be.equal(errors.notFound.status);
            })

        });
        it('выбрасывать исключение если токен подделан', () => {
            sandbox.stub(busRepository, 'findOne').returns(Promise.resolve("h"));
            let promise = busService.delete(1,tokenUserId + 1);
            return promise.catch((result)=> {
                result.status.should.be.equal(errors.invalidSignature.status);
            })

        });
        it('запрещать доступ если не админ',() => {
            sandbox.stub(busRepository, 'findOne').returns(Promise.resolve(busObj));
            sandbox.stub(userRepository, 'findOne').returns(Promise.resolve(busObj));
            let tokenUserId = getTokenId(2);
            let promise = busService.delete(1,tokenUserId);
            return promise.catch((result)=> {
                result.status.should.be.equal(errors.accessDenied.status);
            })

        });
    });

});

function getTokenId(userId) {
    return jwt.sign({userId: userId}, 'userToken');
}
