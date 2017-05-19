'use strict';
const Promise = require("bluebird");
const jwt = require('jsonwebtoken');
var url = require('url');

module.exports = (routerBelongRepository, userRepository, errors) => {
    const BaseService = require('./base');

    Object.setPrototypeOf(RouterBelongService.prototype, BaseService.prototype);

    function RouterBelongService(routerBelongRepository, userRepository, errors) {
        BaseService.call(this, routerBelongRepository, userRepository, errors);

        let self = this;

        self.create = create;
        self.update = update;
        self.read = read;
        self.readAll = readAll;
        self.delete = del;

        function create(body, tokenUserId) {
            return new Promise((resolve, reject) => {
                if(!body.serialNumber || !body.departureTime ||!body.routerId ||!body.stopId ) return reject(errors.badRequest);

                jwt.verify(tokenUserId, 'userToken', function (err, decoded) {
                    if (err || !tokenUserId) return reject(errors.invalidSignature);

                    userRepository.findOne({
                        where: {
                            id: decoded.userId
                        }
                    })
                        .then((user) => {
                            if (!user) return reject(errors.accessDenied);
                            routerBelongRepository.findOne({
                                where: {
                                    serialNumber: body.serialNumber,
                                    departureTime: body.departureTime,
                                    routerId: body.routerId,
                                    stopId: body.stopId
                                }
                            })
                                .then((router) => {
                                    if (router) return reject(errors.alreadyExist);

                                    routerBelongRepository.create({
                                        serialNumber: body.serialNumber,
                                        departureTime: body.departureTime,
                                        routerId: body.routerId,
                                        stopId: body.stopId
                                    })
                                        .then((cRouter) => {
                                            resolve(cRouter)
                                        })
                                        .catch((e) => {
                                            console.log(e);
                                            reject(errors.badRequest)
                                        })
                                })
                        });

                })
            });
        }

        function readAll() {
            return new Promise((resolve) => {
                routerBelongRepository.findAll()
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

                routerBelongRepository.findAll({
                    where: {
                        routerId: routerId
                    }
                })
                    .then((router) => {
                        if (router.length === 0) return reject(errors.notFound);

                        resolve(router);
                    });
            });
        }

        function update(Id, router, tokenUserId) {
            return new Promise((resolve, reject) => {
                if(!router.serialNumber || !router.departureTime ||!router.routerId ||!router.stopId ) return reject(errors.badRequest);

                if (Id > 0) {
                    routerBelongRepository.findOne({
                        where: {
                            id: Id
                        },
                        attributes: {
                            include: ['serialNumber','departureTime','routerId','stopId'],
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
                                                    serialNumber: router.serialNumber,
                                                    departureTime: router.departureTime,
                                                    routerId: router.routerId,
                                                    stopId: router.stopId
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
                routerBelongRepository.findOne({
                    where: {
                        id: routerId
                    },
                    attributes: {
                        include: ['serialNumber','departureTime','routerId','stopId'],
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

    return new RouterBelongService(routerBelongRepository, userRepository, errors);
};
