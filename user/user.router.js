'use strict';

const express = require('express');
const Joi = require('joi');

const { HTTP_STATUS_CODES } = require('../config.js');
const { User, UserJoiSchema } = require('./user.model.js');

const userRouter = express.Router();

//Create a new user
userRouter.post('/', (request, response, next) => {
  //access passed request body to set up newUser
  const newUser = {
    name: request.body.name,
    email: request.body.email,
    username: request.body.username,
    password: request.body.password
  };

  //validate
  const validation = Joi.validate(newUser, UserJoiSchema);
  if (validation.error) {
    // If validation error is found, end the the request with a server error and error message.
    return response
      .status(HTTP_STATUS_CODES.BAD_REQUEST)
      .json({ error: validation.error });
  }

  //verify the new user's email and username don't already exist
  User.findOne({
    //mongoose $or operator
    $or: [{ email: newUser.email }, { username: newUser.username }]
  })
    .then(user => {
      if (user) {
        return response.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
          message: 'A user with that username and/or email already exists.'
        });
      }
      // if good to go - hash pw before saving it
      return User.hashPassword(newUser.password);
    })
    .then(passwordHash => {
      newUser.password = passwordHash;

      //now create user
      User.create(newUser)
        .then(createdUser => {
          return response
            .status(HTTP_STATUS_CODES.CREATED)
            .json(createdUser.serialize());
        })
        .catch(error => {
          next(error);
        });
    });
});

// Get all users
userRouter.get('/', (request, response, next) => {
  //attempt to retrieve all users from database using mongoose.model.find()
  User.find()
    .then(users => {
      // Return the correct HTTP status code, and the users correctly formatted via serialization.
      return response
        .status(HTTP_STATUS_CODES.OK)
        .json(users.map(user => user.serialize()));
    })
    .catch(error => {
      next(error);
    });
});

// Get user by id
userRouter.get('/:userid', (request, response, next) => {
  //Attempt to retrieve a specific user using Mongoose.Model.findById()
  User.findById(request.params.userid)
    .then(user => {
      return response.status(HTTP_STATUS_CODES.OK).json(user.serialize());
    })
    .catch(error => {
      next(error);
    });
});

module.exports = { userRouter };
