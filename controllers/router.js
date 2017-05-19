'use strict';
module.exports = (routerService, promiseHandler) => {
    const BaseController = require('./base');

    Object.setPrototypeOf(RouterController.prototype, BaseController.prototype);

    function RouterController(routerService, promiseHandler) {
        BaseController.call(this, routerService, promiseHandler);

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
                routerService.readAll()
            );
        }


        function read(req, res) {
            promiseHandler(res,
                routerService.read(req.params.id)
            );
        }


        function create(req, res) {
            promiseHandler(res,
                routerService.create(req.body, req.cookies['x-access-token'])
            );
        }

        function update(req, res) {
            promiseHandler(res,
                routerService.update(req.params.id,req.body,req.cookies['x-access-token'])
            );
        }

        function del(req, res) {
            promiseHandler(res,
                routerService.delete(req.params.id, req.cookies['x-access-token'])
            );
        }

    }

    return new RouterController(routerService, promiseHandler);
};