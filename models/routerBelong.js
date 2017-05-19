'use strict';
module.exports = (Sequelize, sequelize) => {
    return sequelize.define('routerBelong', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        serialNumber: Sequelize.INTEGER,
        departureTime: Sequelize.TIME
    });
};