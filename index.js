'use strict';
const express = require('express');
const Sequelize = require('sequelize');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const fs = require('fs');
const jwt = require('jsonwebtoken');

let port = process.env.PORT || 3001;

const errors = require('./utils/errors');
const config = require('./config');

const dbcontext = require('./context/db')(Sequelize, config);

const stopService = require('./services/stop')(dbcontext.stop, dbcontext.bus, dbcontext.router, dbcontext.routerBelong, dbcontext.user, errors);
const routerService = require('./services/router')(dbcontext.router, dbcontext.user, errors);
const routerBelongService = require('./services/routerBelong')(dbcontext.routerBelong, dbcontext.user, errors);
const authService = require('./services/auth')(dbcontext.user, errors);
const historyService = require('./services/history')(dbcontext.user, dbcontext.history, errors);
const busService = require('./services/bus')(dbcontext.bus, dbcontext.router, dbcontext.routerBelong, dbcontext.stop, dbcontext.user, historyService, errors);

const apiController = require('./controllers/api')(busService, stopService, routerService, routerBelongService, authService, historyService, config);

const auth = require('./utils/auth')(authService, config, errors);

const app = express();
app.use(cookieParser(config.cookie.key));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/panel.html', function (req, res) {
    var tokenUserId = req.cookies['x-access-token'];
    jwt.verify(tokenUserId, 'userToken', function (err, decoded) {
        if (err) return res.send(errors.invalidSignature);

        dbcontext.user.findOne({
            where: {
                id: decoded.userId
            }
        })
            .then((user) => {
                if (!user) return res.send(errors.accessDenied);
                res.setHeader('Content-Type', 'text/html');
                fs.readFile('public/panel.html', (err, result) => {
                    res.send(result);
                });
            });
    })
});
app.use('/api',express.static('public/doc'));
app.use(express.static('public'));



app.use('/api', auth);
app.use('/api', apiController);

app.get('/api/swagger.json', function (req, res) {
    res.setHeader('Content-Type', 'application/json');
    fs.readFile('swagger.json', (err, result) => {
        res.send(result);
    });
});


dbcontext.sequelize
    .sync()
    .then(() => {
        app.listen(port, () => {
            console.log('Running on http://' + 'localhost' + ':' + port);
        })
    })
    .catch((err) => console.log(err));

module.exports = app;