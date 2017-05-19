'use strict';
module.exports = (Sequelize, sequelize) => {
    return sequelize.define('user', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        email: {
            type: Sequelize.STRING,
            validate: {
                isEmail:true
            },
            unique: true
        },
        password: Sequelize.STRING
    });
};