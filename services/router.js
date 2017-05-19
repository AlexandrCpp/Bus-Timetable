'use strict';
const Promise = require("bluebird");
const jwt = require('jsonwebtoken');
var url = require('url');

module.exports = (routerRepository, userRepository, errors) => {
    const BaseService = require('./base');

    Object.setPrototypeOf(RouterService.prototype, BaseService.prototype);

    function RouterService(routerRepository, userRepository, errors) {
        BaseService.call(this, routerRepository, userRepository, errors);

        let self = this;

        self.create = create;
        self.update = update;
        self.read = read;
        self.readAll = readAll;
        self.delete = del;

        function create(body, tokenUserId) {
            return new Promise((resolve, reject) => {
                if(!body.name) return reject(errors.badRequest);

                jwt.verify(tokenUserId, 'userToken', function (err, decoded) {
                    if (err) return reject(errors.invalidSignature);

                    userRepository.findOne({
                        where: {
                            id: decoded.userId
                        }
                    })
                        .then((user) => {
                            if (!user) return reject(errors.accessDenied);
                            var name = body.name;
                            routerRepository.findOne({
                                where: {name: name}
                            })
                                .then((router) => {
                                    if (router) return reject(errors.alreadyExist);

                                    routerRepository.create({name:name})
                                        .then((cRouter) => {
                                            resolve(cRouter)
                                        });
                                })
                        });

                })
            });
        }

        function readAll() {
            return new Promise((resolve) => {
                routerRepository.findAll()
                    .then((routers) => {
                        resolve(routers);
                    })
            })
        }

        function read(routerId) {
            return new Promise((resolve, reject) => {
                if (routerId <= 0) {
                    return reject(errors.badRequest)
                }

                routerRepository.findOne({
                    where: {
                        id: routerId
                    }
                })
                    .then((router) => {
                        if (!router) return reject(errors.notFound);

                        resolve(router);
                    });
            });
        }

        function update(routerId, router, tokenUserId) {
            return new Promise((resolve, reject) => {
                if(!router.name) return reject(errors.badRequest);

                if (routerId > 0) {
                    routerRepository.findOne({
                        where: {
                            id: routerId
                        },
                        attributes: {
                            include: ['name'],
                            exclude: ['createdAt', 'updatedAt', 'deletedAt']
                        }
                    })
                        .then((sRouter) => {
                            if (!sRouter) return reject(errors.notFound);

                            jwt.verify(tokenUserId, 'userToken', function (err, decoded) {
                                if (err) return reject(errors.invalidSignature);

                                userRepository.findOne({
                                    where: {
                                        id: decoded.userId
                                    }
                                })
                                    .then((user) => {
                                        if (!user) return reject(errors.accessDenied);

                                        if (decoded.userId === user.id) {
                                            sRouter.update(
                                                {
                                                    name: router.name
                                                }
                                            )
                                                .then((tRoute) => resolve(tRoute))
                                        }
                                        else {
                                            reject(errors.accessDenied);
                                        }
                                    });
                            })
                        })
                }
                else {
                    reject(errors.badRequest)
                }
            });
        }

        function del(routerId, tokenUserId) {
            return new Promise((resolve, reject) => {
                if (routerId <= 0) {
                    reject(errors.badRequest);
                }
                routerRepository.findOne({
                    where: {
                        id: routerId
                    },
                    attributes: {
                        include: ['name'],
                        exclude: ['createdAt', 'updatedAt', 'deletedAt']
                    }
                })
                    .then((stop) => {
                        if (!stop) return reject(errors.notFound);

                        jwt.verify(tokenUserId, 'userToken', function (err, decoded) {
                            if (err) return reject(errors.invalidSignature);

                            userRepository.findOne({
                                where: {
                                    id: decoded.userId
                                }
                            })
                                .then((user) => {
                                    if (!user) return reject(errors.accessDenied);

                                    if (decoded.userId === user.id) {
                                        self.baseDelete(routerId)
                                            .then((router) => {
                                                resolve(router)
                                            })
                                    }
                                    else {
                                        reject(errors.accessDenied);
                                    }
                                });
                        })
                    });
            });
        }
    }

    return new RouterService(routerRepository, userRepository, errors);
};
