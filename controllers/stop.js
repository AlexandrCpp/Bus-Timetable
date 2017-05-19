'use strict';
module.exports = (stopService, promiseHandler) => {
    const BaseController = require('./base');

    Object.setPrototypeOf(StopController.prototype, BaseController.prototype);

    function StopController(stopService, promiseHandler) {
        BaseController.call(this, stopService, promiseHandler);

        this.routes['/'] = [
            {method: 'get', cb: readAll},
            {method: 'post', cb: create}];
        this.routes['/:id'] = [
            {method: 'put', cb: update},
            {method: 'delete', cb: del},
            {method: 'get', cb: read}];
        this.registerRoutes();

        return this.router;


        function readAll(req,res) {
            promiseHandler(res,
                stopService.readAll()
            );
        }


        function read(req, res) {
            promiseHandler(res,
                stopService.read(req.params.id)
            );
        }


        function create(req, res) {
            promiseHandler(res,
                stopService.create(req.body, req.cookies['x-access-token'])
            );
        }

        function update(req, res) {
            promiseHandler(res,
                stopService.update(req.params.id,req.body,req.cookies['x-access-token'])
            );
        }

        function del(req, res) {
            promiseHandler(res,
                stopService.delete(req.params.id, req.cookies['x-access-token'])
            );
        }

    }

    return new StopController(stopService, promiseHandler);
};