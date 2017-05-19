'use strict';
module.exports = (busService, promiseHandler) => {
    const BaseController = require('./base');

    Object.setPrototypeOf(BusController.prototype, BaseController.prototype);

    function BusController(busService, promiseHandler) {
        BaseController.call(this, busService, promiseHandler);

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
                busService.readAll()
            );
        }


        function read(req, res) {
            promiseHandler(res,
                busService.read(req.params.id)
            );
        }


        function create(req, res) {
            promiseHandler(res,
                busService.create(req.body, req.cookies['x-access-token'])
            );
        }

        function update(req, res) {
            promiseHandler(res,
                busService.update(req.params.id,req.body,req.cookies['x-access-token'])
            );
        }

        function del(req, res) {
            promiseHandler(res,
                busService.delete(req.params.id, req.cookies['x-access-token'])
            );
        }

    }

    return new BusController(busService, promiseHandler);
};