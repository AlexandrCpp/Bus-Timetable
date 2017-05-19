'use strict';
const Promise = require("bluebird");
const jwt = require('jsonwebtoken');
var url = require('url');

module.exports = (stopRepository, busRepository, routerRepository, routerBelongRepository, userRepository, errors) => {
    const BaseService = require('./base');

    Object.setPrototypeOf(StopService.prototype, BaseService.prototype);

    function StopService(stopRepository, busRepository, routerRepository, routerBelongRepository, userRepository, errors) {
        BaseService.call(this, stopRepository, busRepository, routerRepository, routerBelongRepository, userRepository, errors);

        let self = this;

        self.create = create;
        self.update = update;
        self.read = read;
        self.readAll = readAll;
        self.delete = del;

        function create(body, tokenUserId) {
            return new Promise((resolve, reject) => {
                if (!body.name) return reject(errors.badRequest);

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
                            stopRepository.findOne({
                                where: {name: name}
                            })
                                .then((stop) => {
                                    if (stop) return reject(errors.alreadyExist);

                                    stopRepository.create({name: name})
                                        .then((cStop) => {
                                            resolve(cStop)
                                        });
                                })
                        });

                })
            });
        }

        function readAll() {
            return new Promise((resolve) => {
                stopRepository.findAll()
                    .then((stops) => {
                        resolve(stops);
                    })
            })
        }

        function read(stopId) {
            return new Promise((resolve, reject) => {
                if (stopId <= 0) {
                    return reject(errors.badRequest)
                }

                routerBelongRepository.findAll({
                    include: [
                        {
                            model: stopRepository,
                            as: 'stop',
                            where: {
                                id: stopId
                            }
                        }]
                })
                    .then((stop) => {
                        if (!stop) return reject(errors.notFound);

                        resolve(stop);
                    });
            });
        }

        function update(stopid, stop, tokenUserId) {
            return new Promise((resolve, reject) => {
                if (stopid > 0 || !stop.name) {
                    stopRepository.findOne({
                        where: {
                            id: stopid
                        },
                        attributes: {
                            include: ['name'],
                            exclude: ['createdAt', 'updatedAt', 'deletedAt']
                        }
                    })
                        .then((sStop) => {
                            if (!sStop) return reject(errors.notFound);

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
                                            sStop.update(
                                                {
                                                    name: stop.name
                                                }
                                            )
                                                .then((tStop) => resolve(tStop))
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

        function del(stopId, tokenUserId) {
            return new Promise((resolve, reject) => {
                if (stopId <= 0) {
                    reject(errors.badRequest);
                }
                stopRepository.findOne({
                    where: {
                        id: stopId
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
                                        self.baseDelete(stopId)
                                            .then((stop) => {
                                                resolve(stop)
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

    return new StopService(stopRepository, busRepository, routerRepository, routerBelongRepository, userRepository, errors);
};
