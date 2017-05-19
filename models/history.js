'use strict';
module.exports = (Sequelize, sequelize) => {
    return sequelize.define('history', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }
    });
};