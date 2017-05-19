'use strict';
const express = require('express');

module.exports = (busService, stopService, routerService, routerBelongService, authService, historyService, config) => {
    const router = express.Router();

    const busController = require('./bus')(busService, promiseHandler);
    const stopController = require('./stop')(stopService, promiseHandler);
    const routerController = require('./router')(routerService, promiseHandler);
    const routerBelongController = require('./routerBelongs')(routerBelongService, promiseHandler);
    const authController = require('./auth')(authService, config, promiseHandler);
    const historyController = require('./history')(historyService, promiseHandler);

    router.use('/sessions', authController);
    router.use('/buses', busController);
    router.use('/stops', stopController);
    router.use('/routers', routerController);
    router.use('/belongs', routerBelongController);
    router.use('/histories', historyController);


    return router;
};

function promiseHandler(res, promise) {
    promise
        .then((data) => res.json(data))
        .catch((err) => res.error(err));
}
