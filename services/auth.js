'use strict';
var bcrypt = require('bcryptjs');
const saltRounds = 10;
const jwt = require('jsonwebtoken');

module.exports = (userRepository, errors) => {

    return {
        login: login,
        checkPermissions: checkPermissions
    };

    function login(res,config,data) {
        return new Promise((resolve, reject) => {
            if(!data.email || !data.password) return reject(errors.badRequest);

            userRepository.findOne(
                {
                    where: {
                        email: data.email
                    },
                    attributes: ['id', 'password']
                })
                .then((user) => {

                    if(!user){
                        return reject(errors.wrongCredentials);
                    }

                    bcrypt.compare(data.password, user.password, function (err, success) {
                        if (err || !success) return reject(errors.wrongCredentials);

                        let token = jwt.sign({ userId: user.id }, 'userToken');
                        res.cookie(config.cookie.token,token);
                        resolve({ success: true });
                    });
                })
        });
    }

    function checkPermissions(userToken, path, method) {
        return new Promise((resolve, reject) => {
            if (path === "/swagger.json") resolve();

            if (method !== "GET" && userToken === null) {
                reject(errors.accessDenied);
            }
            else {
                resolve();
            }

        });
    }
};