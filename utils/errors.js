'use strict';
const express = require('express');

express.response.error = function(error) {
    if (!error.code) {
        error = {
            message: error.toString(),
            code: 'server_error',
            status: 500
        };
    }

    this.status(error.status).json(error);
};


module.exports = {
    badRequest: {
        message: 'Bad request',
        code: 'bad_request',
        status: 400
    },
    invalidSignature: {
        message: 'I\'m a teapot',
        code: 'I\'m_a_teapot',
        status: 418
    },
    notFound: {
        message: 'Entity not found',
        code: 'entity_not_found',
        status: 404
    },
    wrongCredentials: {
        message: 'Email or password are wrong',
        code: 'wrong_credentials',
        status: 404
    },
    accessDenied: {
        message: 'Access denied',
        code: 'access_denied',
        status: 403
    },
    unauthorized: {
        message: 'Unauthorized',
        code: 'unauthorized',
        status: 401
    },
    emailAlreadyUse: {
        message: 'Email already use',
        code: 'bad_request',
        status: 409
    },
    alreadyExist: {
        message: 'Already exist',
        code: 'bad_request',
        status: 409
    },
    groupNotFound: {
        message: 'Group not found',
        code: 'group_not_found',
        status: 404
    },
    InternalServerError: {
        message: 'Internal Server Error',
        code: 'internal_server_error',
        status: 500
    }

};