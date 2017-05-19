'use strict';
module.exports = (Sequelize, sequelize) => {
    return sequelize.define('bus', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            number: {
                type: Sequelize.INTEGER,
                unique: true
            }
        }
    )
};