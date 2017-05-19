'use strict';
module.exports = (Sequelize, sequelize) => {
    return sequelize.define('router', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: Sequelize.STRING
    });
};