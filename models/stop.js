'use strict';
module.exports = (Sequelize, sequelize) => {
    return sequelize.define('stop', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: Sequelize.STRING.BINARY,
                unique: true
            }
        }
    );
};