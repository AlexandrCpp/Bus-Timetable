'use strict';
module.exports = (historyService, promiseHandler) => {
    const BaseController = require('./base');

    Object.setPrototypeOf(HistoryController.prototype, BaseController.prototype);

    function HistoryController(historyService, promiseHandler) {
        BaseController.call(this, historyService, promiseHandler);

        this.routes['/'] = [{ method: 'get', cb: give }];

        this.registerRoutes();

        return this.router;

        function give(req, res) {
            promiseHandler(res,
                historyService.give(req.cookies['x-access-token'])
            );
        }
    }

    return new HistoryController(historyService, promiseHandler);
};