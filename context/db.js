'use strict';
global.isProduction
    = process.env.NODE_ENV === 'production';

module.exports = (Sequelize, config) => {
    const options = {
        host: isProduction ? config.db.host : config.dbtest.host,
        dialect: 'mysql',
        logging: true,
        define: {
            timestamps: true,
            paranoid: true,
            defaultScope: {
                where: {
                    deletedAt: {$eq: null}
                },
                attributes: {
                    exclude: ['createdAt', 'updatedAt', 'deletedAt']
                }
            }
        }
    };

    const sequelize = isProduction ? new Sequelize(config.db.name, config.db.router, config.db.password, options) : new Sequelize(config.dbtest.name, config.dbtest.router, config.dbtest.password, options);

    const Router = require('../models/router')(Sequelize, sequelize);
    const History = require('../models/history')(Sequelize, sequelize);
    const Stop = require('../models/stop')(Sequelize, sequelize);
    const Bus = require('../models/bus')(Sequelize, sequelize);
    const RouterBelong = require('../models/routerBelong')(Sequelize, sequelize);
    const User = require('../models/user')(Sequelize, sequelize);


    // History -> Bus
    History.belongsTo(Bus);
    Bus.hasMany(History);

    // Bus -> Router
    Bus.belongsTo(Router, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });
    Router.hasMany(Bus, { foreignKey: { allowNull: false }, onDelete: 'CASCADE' });

    // RouterBelong -> Router
    RouterBelong.belongsTo(Router);
    Router.hasMany(RouterBelong);

    // RouterBelong -> Stop
    RouterBelong.belongsTo(Stop);
    Stop.hasMany(RouterBelong);

    return {
        router: Router,
        stop: Stop,
        bus: Bus,
        history: History,
        routerBelong: RouterBelong,
        user: User,

        sequelize: sequelize
    };
};