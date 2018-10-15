'use strict';

const express = require('express');
const Joi = require('joi');
const postRouter = express.Router();

const { HTTP_STATUS_CODES } = require('../config.js');
const { jwtPassportMiddleware } = require('../auth/auth.strategy');
const { Post, PostJoiSchema } = require('./post.model.js');

//Create a new post
postRouter.post('/', jwtPassportMiddleware, (request, response, next) => {
  const newPost = {
    user: request.user.id,
    title: request.body.title,
    content: request.body.content,
    createdAt: Date.now()
  };

  // Validate new user information is correct.
  const validation = Joi.validate(newPost, PostJoiSchema);
  if (validation.error) {
    // If validation error is found, end the the request with a server error and error message.
    return response
      .status(HTTP_STATUS_CODES.BAD_REQUEST)
      .json({ error: validation.error });
  }

  // Attempt to create a new note using Mongoose.Model.create
  Post.create(newPost)
    .then(createdNote => {
      // Return the correct HTTP status code, and the note correctly formatted via serialization.
      return response
        .status(HTTP_STATUS_CODES.CREATED)
        .json(createdNote.serialize());
    })
    .catch(error => {
      next(error);
    });
});

//Get all user's posts
postRouter.get('/', jwtPassportMiddleware, (request, response, next) => {
  //Attempt to retrieve all notes using Mongoose.Model.find()
  Post.find({ user: request.user.id })
    .populate('user', ['id', 'username'])
    .then(posts => {
      //Return the correct HTTP status code, and the notes correctly formatted via serialization.
      return response
        .status(HTTP_STATUS_CODES.OK)
        .json(posts.map(post => post.serialize()));
    })
    .catch(error => {
      next(error);
    });
});

//Get all users' posts - not needed yet but will want this in future iterations
postRouter.get('/all', (request, response, next) => {
  //Attempt to retrieve all notes using Mongoose.Model.find()
  Post.find()
    .populate('user', ['id', 'username'])
    .then(posts => {
      //Return the correct HTTP status code, and the notes correctly formatted via serialization.
      return response
        .status(HTTP_STATUS_CODES.OK)
        .json(posts.map(post => post.serialize()));
    })
    .catch(error => {
      next(error);
    });
});

//Get one post by id
postRouter.get('/:postid', jwtPassportMiddleware, (request, response, next) => {
  //Attempt to retrieve the note using Mongoose.Model.findById()
  Post.findById(request.params.postid)
    .populate('user', ['id', 'username'])
    .then(post => {
      // Return the correct HTTP status code, and the note correctly formatted via serialization.
      return response.status(HTTP_STATUS_CODES.OK).json(post.serialize());
    })
    .catch(error => {
      next(error);
    });
});

//update post by id
postRouter.put('/:postid', jwtPassportMiddleware, (request, response, next) => {
  //create object of updated post content from request body
  const postUpdate = {
    title: request.body.title,
    content: request.body.content
  };

  //Validate new user information is correct.
  const validation = Joi.validate(postUpdate, PostJoiSchema);
  if (validation.error) {
    // If validation error is found, end the the request with a server error and error message.
    return response
      .status(HTTP_STATUS_CODES.BAD_REQUEST)
      .json({ error: validation.error });
  }

  //Attempt to find the note, and update it using Mongoose.Model.findByIdAndUpdate()
  Post.findByIdAndUpdate(request.params.postid, postUpdate)
    .then(() => {
      // Since the update was performed but no further data provided, we just end the request with NO_CONTENT status code.
      return response.status(HTTP_STATUS_CODES.NO_CONTENT).end();
    })
    .catch(error => {
      next(error);
    });
});

//delete post by id
postRouter.delete(
  '/:postid',
  jwtPassportMiddleware,
  (request, response, next) => {
    //Attempt to find the note by ID and delete it using Mongoose.Model.findByIdAndDelete()
    Post.findByIdAndDelete(request.params.postid)
      .then(() => {
        // Since the deletion was performed but no further data provided,we just end the request with NO_CONTENT status code.
        return response.status(HTTP_STATUS_CODES.NO_CONTENT).end();
      })
      .catch(error => {
        next(error);
      });
  }
);

//export
module.exports = { postRouter };
