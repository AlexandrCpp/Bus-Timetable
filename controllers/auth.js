'use strict';
const express = require('express');
module.exports = (authService, config,promiseHandler) => {
    const router = express.Router();


    router.post('/', (req, res) => {
        promiseHandler(res,
            authService.login(res,config,req.body))
    });

    router.delete('/', (req, res) => {
        res.cookie(config.cookie.token, '');
        res.json({ success: true });
    });

    return router;
};