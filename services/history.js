'use strict';
const jwt = require('jsonwebtoken');
const saltRounds = 10;

module.exports = (userRepository,historyRepository, errors) => {
    const BaseService = require('./base');

    Object.setPrototypeOf(UserService.prototype, BaseService.prototype);

    function UserService(userRepository,historyRepository, errors) {
        BaseService.call(this, userRepository,historyRepository, errors);

        let self = this;

        self.give = give;
        self.add = add;

        function give(tokenUserId) {
            return new Promise((resolve, reject) => {
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
                                var d = new Date();
                                d.setMonth(d.getMonth() - 1);
                                historyRepository.findAll({
                                    where: {
                                        createdAt: {
                                            $gt: d
                                        }
                                    },
                                    attributes: {
                                        include: ['busId']
                                    }
                                })
                                    .then((history) => resolve(history))
                            }
                            else {
                                reject(errors.accessDenied);
                            }
                        });
                })
            });
        }

        function add(busId) {
            historyRepository.create({busId:busId})
        }


    }

    return new UserService(userRepository,historyRepository, errors);
};