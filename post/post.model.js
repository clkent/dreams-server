'use strict';

//requirements
const mongoose = require('mongoose');
const Joi = require('joi');

//schema
const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
  title: { type: String, required: true },
  content: { type: String, required: true }
});

// Add 'createdAt' and 'updatedAt' fields
postSchema.set('timestamps', true);

//serialize - switch to virtuals?
postSchema.methods.serialize = function() {
  let user;
  // We serialize the user if it's populated to avoid returning any sensitive information, like the password hash.
  if (typeof this.user.serialize === 'function') {
    user = this.user.serialize();
  } else {
    user = this.user;
  }
  return {
    id: this._id,
    user: user,
    title: this.title,
    content: this.content,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// validation
const PostJoiSchema = Joi.object().keys({
  user: Joi.string().optional(),
  title: Joi.string()
    .min(1)
    .required(),
  content: Joi.string()
    .min(1)
    .required(),
  createdAt: Joi.date().timestamp()
});

//model
const Post = mongoose.model('post', postSchema);

//export
module.exports = { Post, PostJoiSchema };
