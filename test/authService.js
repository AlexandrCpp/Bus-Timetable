'use strict';
const Sequelize = require('sequelize');
const assert = require("assert");
const sinon = require('sinon');
var should = require('should');
const config = require('../config');
const dbcontext = require('../context/db')(Sequelize, config);
const errors = require('../utils/errors');
const Promise = require("bluebird");

let userRepository = dbcontext.router;

var authService = require('../services/auth')(userRepository, errors);

var sandbox;
beforeEach(function () {
    sandbox = sinon.sandbox.create();
});

afterEach(function () {
    sandbox.restore();
});


let userObj = {
    id: 1,
    email: "sanya@3a.by",
    password: "$2a$10$sF9HD1J8MwSu0JwSrHmt4OaJpvnXd0HV5rQi6UVExq6tul9.ShS/y"
};
let userObj3 = {
    id: 3,
    email: "sanya@3a.by",
    password: "$2a$10$sF9HD1J8MwSu0JwSrHmt4OaJpvnXd0HV5rQi6UVExq6tul9.ShS/y"
};
let userObj2 = {
    id: 1,
    email: "sanya@3a.by",
    password: "123"
};

let resObj = {
    cookie: function () {

    }
};

describe('Запрос на /sessions', ()=> {
    describe('методом POST должен', () => {
        it('отдавать куку с токеном', () => {
            sandbox.stub(userRepository, 'findOne').returns(Promise.resolve(userObj));
            let promise = authService.login(resObj, config, userObj2);
            return promise.then((result)=> {
                result.should.have.property('success');
            })

        });
        it('выбрасывать 404 если нет пользователя', () => {
            sandbox.stub(userRepository, 'findOne').returns(Promise.resolve(userObj));
            let promise = authService.login(resObj, config, userObj2);
            return promise.then((result)=> {
                result.should.have.property('success');
            })

        });
    });
});

describe('промежуточный обработчик checkPermissions должен', () => {
    it('выбрасывать unauthorized если нет токена', () => {
        let promise = authService.checkPermissions(null, "", "");
        return promise.catch((result)=> {
            result.status.should.be.equal(errors.accessDenied.status)
        })

    });
    it('выбрасывать 404 если нет пользователя', () => {
        sandbox.stub(userRepository, 'findOne').returns(Promise.resolve(userObj));
        let promise = authService.login(resObj, config, userObj3);
        return promise.catch((result)=> {
            result.status.should.be.equal(errors.wrongCredentials.status)
        })

    });
});
