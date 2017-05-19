'use strict';
var bcrypt = require('bcryptjs');
const saltRounds = 10;

module.exports = (userRepository, errors) => {
    const BaseService = require('./base');

    Object.setPrototypeOf(UserService.prototype, BaseService.prototype);

    function UserService(userRepository, errors) {
        BaseService.call(this, userRepository, errors);

        let self = this;

        self.register = register;

        function register(data) {
            return new Promise((resolve, reject) => {
                if (data.email && data.password) {

                    bcrypt.hash(data.password, saltRounds, function (err, hash) {
                        if (err) return reject(errors.InternalServerError);


                        userRepository.findOrCreate(
                            {
                                where: {
                                    email: data.email
                                },
                                defaults: {
                                    email: data.email,
                                    password: hash
                                }
                            })
                            .spread((user, created)=> {
                                if (!created) return reject(errors.emailAlreadyUse);
                                var usr = {
                                    id: user.id,
                                    email: user.email
                                };
                                resolve(usr)
                            })
                    })
                }
                else {
                    reject(errors.badRequest);
                }
            });
        }

    }

    return new UserService(userRepository, errors);
};