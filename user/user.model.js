'use strict';

const mongoose = require('mongoose');
const Joi = require('joi');
const bcrypt = require('bcryptjs');

//Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true }
});

//serialize
userSchema.methods.serialize = function() {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    username: this.username
  };
};

//hash pw
userSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

//validate pw
userSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

//Joi validation on my schema
const UserJoiSchema = Joi.object().keys({
  name: Joi.string()
    .min(1)
    .trim()
    .required(),
  username: Joi.string()
    .alphanum()
    .min(1)
    .max(30)
    .trim()
    .required(),
  password: Joi.string()
    .min(8)
    .max(30)
    .trim()
    .required(),
  email: Joi.string()
    .email()
    .trim()
    .required()
});

//create mongoose model using userSchema
const User = mongoose.model('user', userSchema);

//export
module.exports = { User, UserJoiSchema };
