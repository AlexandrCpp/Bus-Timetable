'use strict';
const Promise = require("bluebird");
const jwt = require('jsonwebtoken');
var url = require('url');

module.exports = (busRepository, routerRepository, routerBelongRepository, stopRepository, userRepository,historyService, errors) => {
    const BaseService = require('./base');

    Object.setPrototypeOf(BusService.prototype, BaseService.prototype);

    function BusService(busRepository, routerRepository, routerBelongRepository, stopRepository, userRepository, errors) {
        BaseService.call(this, busRepository, routerRepository, routerBelongRepository, stopRepository, userRepository, errors);

        let self = this;

        self.create = create;
        self.update = update;
        self.read = read;
        self.readAll = readAll;
        self.delete = del;

        function create(body, tokenUserId) {
            return new Promise((resolve, reject) => {
                if (!body.number || !body.routerId) return reject(errors.badRequest);
                jwt.verify(tokenUserId, 'userToken', function (err, decoded) {
                    if (err) return reject(errors.invalidSignature);

                    userRepository.findOne({
                        where: {
                            id: decoded.userId
                        }
                    })
                        .then((user) => {
                            if (!user) return reject(errors.accessDenied);

                            var number = body.number;
                            busRepository.findOne({
                                where: {number: number}
                            })
                                .then((bus) => {
                                    if (bus) return reject(errors.alreadyExist);

                                    busRepository.create({number: number, routerId: body.routerId})
                                        .then((cBus) => {
                                            resolve(cBus)
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
                routerRepository.findAll({
                    include: [{
                        model: busRepository,
                        as: 'buses',
                        attributes: {
                            include: ['id','number','routerId'],
                            exclude: ['createdAt', 'updatedAt', 'deletedAt', 'id', 'number', 'routerId']
                        }
                    }]
                })
                    .then((buses) => {
                        resolve(buses);
                    })
            })
        }

        function read(busId) {
            return new Promise((resolve, reject) => {
                if (busId <= 0) {
                    return reject(errors.badRequest)
                }

                routerBelongRepository.findAll({
                    order:"'serialNumber' ASC",
                    group:['serialNumber'],
                    include: [{
                        model: routerRepository,
                        as: 'router',
                        include: [{
                            model: busRepository,
                            as: 'buses',
                            where: {
                                id: busId
                            },
                            attributes: {
                                exclude: ['createdAt', 'updatedAt', 'deletedAt', 'id', 'number', 'routerId']
                            }
                        }],
                        attributes: {
                            exclude: ['createdAt', 'updatedAt', 'deletedAt', 'id', 'name']
                        }
                    },
                        {
                            model: stopRepository,
                            as: 'stop',
                            included: ['id', 'name']
                        }],
                    attributes: {
                        exclude: ['createdAt', 'updatedAt', 'deletedAt', 'id', 'departureTime', 'routerId', 'stopId']
                    }

                })

                    .then((stops) => {
                        if (!stops) return reject(errors.notFound);
                        historyService.add(busId);
                        resolve(stops);
                    });
            });
        }

        function update(busId, bus, tokenUserId) {
            return new Promise((resolve, reject) => {
                if (busId > 0) {
                    if (!bus.number || !bus.routerId) return reject(errors.badRequest);

                    busRepository.findOne({
                        where: {
                            id: busId
                        },
                        attributes: {
                            include: ['number'],
                            exclude: ['createdAt', 'updatedAt', 'deletedAt']
                        }
                    })
                        .then((sBus) => {
                            if (!sBus) return reject(errors.notFound);

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
                                            if(bus.number){
                                                sBus.update(
                                                    {
                                                        number: bus.number
                                                    }
                                                )
                                                    .then((tBus) => resolve(tBus))
                                            }
                                            else{
                                                sBus.update(
                                                    {
                                                        routerId: bus.routerId
                                                    }
                                                )
                                                    .then((tBus) => resolve(tBus))
                                            }

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

        function del(busId, tokenUserId) {
            return new Promise((resolve, reject) => {
                if (busId <= 0) {
                    reject(errors.badRequest);
                }
                busRepository.findOne({
                    where: {
                        id: busId
                    },
                    attributes: {
                        include: ['number'],
                        exclude: ['createdAt', 'updatedAt', 'deletedAt']
                    }
                })
                    .then((bus) => {
                        if (!bus) return reject(errors.notFound);

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
                                        self.baseDelete(busId)
                                            .then((bus) => {
                                                resolve(bus)
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

    return new BusService(busRepository, routerRepository, routerBelongRepository, stopRepository, userRepository, errors);
};
