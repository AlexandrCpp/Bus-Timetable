'use strict';
module.exports = (routerBelongService, promiseHandler) => {
    const BaseController = require('./base');

    Object.setPrototypeOf(RouterBelongController.prototype, BaseController.prototype);

    function RouterBelongController(routerBelongService, promiseHandler) {
        BaseController.call(this, routerBelongService, promiseHandler);

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
                routerBelongService.readAll()
            );
        }


        function read(req, res) {
            promiseHandler(res,
                routerBelongService.read(req.params.id)
            );
        }


        function create(req, res) {
            promiseHandler(res,
                routerBelongService.create(req.body, req.cookies['x-access-token'])
            );
        }

        function update(req, res) {
            promiseHandler(res,
                routerBelongService.update(req.params.id,req.body,req.cookies['x-access-token'])
            );
        }

        function del(req, res) {
            promiseHandler(res,
                routerBelongService.delete(req.params.id, req.cookies['x-access-token'])
            );
        }

    }

    return new RouterBelongController(routerBelongService, promiseHandler);
};