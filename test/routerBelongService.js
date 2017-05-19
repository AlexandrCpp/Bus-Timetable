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

let routerBelongRepository = dbcontext.routerBelong;
let userRepository = dbcontext.user;


var routerBelongService = require('../services/routerBelong')(routerBelongRepository, userRepository, errors);

var sandbox;
beforeEach(function () {
    sandbox = sinon.sandbox.create();
});

afterEach(function () {
    sandbox.restore();
});

let belongObj = {
    id: 1,
    serialNumber: "1",
    departureTime: "00:00:00",
    routerId: 1,
    stopId: 2,
    update: function () {
    }
};
let belongObjWithInfo = {
    id: 1,
    serialNumber: "1",
    departureTime: "00:00:00",
    routerId: 1,
    stopId: 2,
    infos: {
        id: 1,
        referer: 'localhost',
        userIP: 'localhost'
    },
    update: function () {
    }
};

let user = {
    id: 1,
    email: "antas@3a.by",
    password: "123",
    addLink: function () {

    }
};

let nullQueryObj = {
    query: {
        start: null,
        end: null,
        referer: null,
        ip: null
    }
};
let nullObj = {

};
var tokenUserId = getTokenId(1);
describe('Запрос на /belongs', () => {
    describe('методом GET должен', () =>  {
        it('отдавать массив связей', () => {
            sandbox.stub(routerBelongRepository, 'findAll').returns(Promise.resolve([belongObj, belongObj]));
            let promise = routerBelongService.readAll();
            return promise.then((result) => {
                result.should.be.an.Array();
            })

        });
    });

    describe('методом POST должен', () => {
        it('выбрасывать исключение если не один из параметров null', () => {
            let promise = routerBelongService.create(nullObj,tokenUserId);
            return promise.catch((result) => {
                result.status.should.be.equal(400);
            });
        });
        it('выбрасывать исключение если токен подделан', () => {
            let promise = routerBelongService.create(belongObj, tokenUserId + 1);
            return promise.catch((result) => {
                result.status.should.be.equal(errors.invalidSignature.status);
            })
        });
        it('выбрасывать accessDenied если не админ', () => {
            sandbox.stub(userRepository, 'findOne').returns(Promise.resolve(null));
            let promise = routerBelongService.create(belongObj, tokenUserId);
            return promise.catch((result) => {
                result.status.should.be.equal(errors.accessDenied.status);
            })
        });
    });

});

describe('Запрос на /belongs/:id', () => {
    describe('методом GET должен', () => {
        it('выбрасывать 400 если идентификатор меньше либо равен 0', () => {
            let promise = routerBelongService.read(-1);
            return promise.catch((result) => {
                result.status.should.be.equal(errors.badRequest.status);
            })

        });
        it('отдавать подробную информацию о пути', () => {
            sandbox.stub(routerBelongRepository, 'findAll').returns(Promise.resolve(belongObjWithInfo));
            let promise = routerBelongService.read(nullQueryObj, 1, tokenUserId);
            return promise.then((result) => {
                result.should.be.a.object;
                result.serialNumber.should.equal("1");
                result.should.have.property('departureTime');
            })

        });
    });

    describe('методом PUT должен', () => {
        it('возвращать обновленную информацию о пути', () => {
            sandbox.stub(routerBelongRepository, 'findOne').returns(Promise.resolve(belongObj));
            sandbox.stub(userRepository, 'findOne').returns(Promise.resolve(user));
            sandbox.stub(belongObj, 'update').returns(Promise.resolve(belongObj));
            let promise = routerBelongService.update(1, belongObj, tokenUserId);
            return promise.then((value) => {
                value.should.be.called;

            })
        });
        it('запрещать доступ если  не админ', () => {
            sandbox.stub(routerBelongRepository, 'findOne').returns(Promise.resolve(belongObj));
            sandbox.stub(userRepository, 'findOne').returns(Promise.resolve(user));
            sandbox.stub(belongObj, 'update').returns(Promise.resolve(belongObj));
            let promise = routerBelongService.update(1, belongObj, tokenUserId+1);
            return promise.catch((value) => {
                value.should.be.called;

            })
        });
        it('проверять отрицательный идентификатор', () => {
            let promise = routerBelongService.update(-1, tokenUserId);
            return promise.catch((value) => {
                value.status.should.be.equal(errors.badRequest.status);
            });
        });
        it('проверять несуществующие идентификаторы', () => {
            sandbox.stub(routerBelongRepository, 'findOne').returns(Promise.resolve(null));
            let promise = routerBelongService.update(9999,belongObj, tokenUserId);
            return promise.catch((value) => {
                value.status.should.be.equal(errors.notFound.status);
            });
        });
    });

    describe('методом DELETE должен', () => {
        it('выбрасывать 400 если идентификатор меньше либо равен 0', () => {
            let promise = routerBelongService.delete(-1, tokenUserId);
            return promise.catch((result) => {
                result.status.should.be.equal(errors.badRequest.status);
            })

        });
        it('выбрасывать 404 если нет путей', () => {
            sandbox.stub(routerBelongRepository, 'findOne').returns(Promise.resolve(null));
            let promise = routerBelongService.delete(nullQueryObj, 1, tokenUserId);
            return promise.catch((result) => {
                result.status.should.be.equal(errors.notFound.status);
            })

        });
        it('выбрасывать исключение если токен подделан', () => {
            sandbox.stub(routerBelongRepository, 'findOne').returns(Promise.resolve(belongObj));
            let promise = routerBelongService.delete(1, tokenUserId + 1);
            return promise.catch((result) => {
                result.status.should.be.equal(errors.invalidSignature.status);
            })

        });
        it('возвращать удаленную ссылку', () => {
            sandbox.stub(routerBelongRepository, 'findOne').returns(Promise.resolve(belongObj));
            sandbox.stub(userRepository, 'findOne').returns(Promise.resolve(user));
            sandbox.stub(routerBelongService, 'baseDelete').returns(Promise.resolve(belongObj));
            let promise = routerBelongService.delete(1, tokenUserId);
            return promise.then((result) => {
                result.should.be.a.object;
                result.serialNumber.should.equal("1");
                result.should.have.properties(['id', 'departureTime']);
            })

        });
    });

});

function getTokenId(userId) {
    return jwt.sign({userId: userId}, 'userToken');
}
