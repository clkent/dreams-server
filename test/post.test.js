'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const { app } = require('../server');
const { TEST_MONGODB_URI, JWT_EXPIRY, JWT_SECRET } = require('../config');

const { Post } = require('../post/post.model');
const { posts } = require('../db/seed/posts');

const { User } = require('../user/user.model');
const { users } = require('../db/seed/users');

const expect = chai.expect;
chai.use(chaiHttp);

describe('Dream Recall API – Posts', function() {
  let user;
  let token;

  //hooks
  before(function() {
    return mongoose
      .connect(TEST_MONGODB_URI)
      .then(() => mongoose.connection.db.dropDatabase());
  });

  beforeEach(function() {
    return Promise.all([User.insertMany(users), Post.insertMany(posts)]).then(
      ([users]) => {
        user = users[0];
        token = jwt.sign({ user: user.serialize() }, JWT_SECRET, {
          subject: user.username,
          expiresIn: JWT_EXPIRY,
          algorithm: 'HS256'
        });
      }
    );
  });

  afterEach(function() {
    return Promise.all([User.deleteMany(), Post.deleteMany()]);
  });

  after(function() {
    return mongoose.disconnect();
  });

  describe('GET /api/post', function() {
    it('should return the correct number of Posts', function() {
      return Promise.all([
        Post.find(),
        chai
          .request(app)
          .get('/api/post')
          .set('Authorization', `Bearer ${token}`)
      ]).then(([data, res]) => {
        console.log(data);
        const filteredData = data.filter(post => {
          return post.user === res.body[0].user.id;
        });
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        expect(res.body).to.have.length(filteredData.length);
      });
    });

    it('should return a list with the correct right fields', function() {
      return Promise.all([
        Post.find().sort({ updatedAt: 'desc' }),
        chai
          .request(app)
          .get('/api/post')
          .set('Authorization', `Bearer ${token}`)
      ]).then(([data, res]) => {
        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.a('array');
        res.body.forEach(function(item, i) {
          expect(item).to.be.a('object');
          expect(item).to.include.all.keys(
            'id',
            'user',
            'title',
            'content',
            'createdAt',
            'updatedAt'
          );
          expect(item.id).to.equal(data[i].id);
          expect(item.title).to.equal(data[i].title);
          expect(item.content).to.equal(data[i].content);
          expect(new Date(item.createdAt)).to.eql(data[i].createdAt);
          expect(new Date(item.updatedAt)).to.eql(data[i].updatedAt);
        });
      });
    });
  });
});
