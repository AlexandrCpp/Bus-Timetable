'use strict';
module.exports = BaseService;

function BaseService(repository, errors) {
    const defaults = {
        readChunk: {
            limit: 10,
            page: 1,
            order: 'asc',
            orderField: 'id'
        }
    };

    let self = this;

    this.readChunk = readChunk;
    this.read = read;
    this.baseCreate = baseCreate;
    this.baseUpdate = baseUpdate;
    this.baseDelete = del;

    function readChunk(options) {
        return new Promise((resolve, reject) => {
            options = Object.assign({}, defaults.readChunk, options);

            let limit = options.limit;
            let offset = (options.page - 1) * options.limit;

            repository
                .findAll({
                    limit: limit,
                    offset: offset,
                    order: [[options.orderField, options.order.toUpperCase()]],
                    raw: true
                })
                .then(resolve).catch(reject);
        });
    }

    function read(id) {
        return new Promise((resolve, reject) => {
            id = parseInt(id);

            if (isNaN(id)) {
                reject(errors.badRequest);
                return;
            }

            repository.findById(id, {raw: true})
                .then((obj) => {
                    if (obj == null) reject(errors.notFound);
                    else resolve(obj);
                })
                .catch(reject);
        });
    }

    function baseCreate(data) {
        return new Promise((resolve, reject) => {
            repository.create(data)
                .then(resolve).catch(reject);
        });
    }

    function baseUpdate(id, data) {
        return new Promise((resolve, reject) => {
            repository.update(data, {where: {id: id}, limit: 1})
                .then(() => {
                    return self.read(data.id);
                })
                .then(resolve).catch(reject);
        });
    }

    function del(id) {
        return new Promise((resolve, reject) => {
            repository.findOne(
                {
                    where: {
                        id: id
                    }
                })
                .then((obj)=> {
                    if (obj == null) reject(errors.notFound);
                    else {
                        obj.destroy()
                            .then(()=> {
                                resolve(obj);
                            })
                    }
                })
                .catch(reject);
        });
    }
}