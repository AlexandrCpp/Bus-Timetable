'use strict';
module.exports = (authService, config, errors) => {
    return (req, res, next) => {
        let userToken = req.cookies[config.cookie.token];
        let path = req.url;
        let method = req.method;


        authService.checkPermissions(userToken, path, method)
            .then(() => next())
            .catch((err) => res.error(err));
    };
};