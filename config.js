'use strict';

module.exports = {
  PORT: process.env.PORT || 8080,
  HTTP_STATUS_CODES: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    NOT_FOUND: 404
  },
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/dreams-db',
  TEST_DATABASE_URL:
    process.env.TEST_DATABASE_URL || 'mongodb://localhost:27017/dreams-db-test',
  JWT_SECRET: process.env.JWT_SECRET || 'default',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '1d'
};
