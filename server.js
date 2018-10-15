'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');

const { PORT, CLIENT_ORIGIN, HTTP_STATUS_CODES } = require('./config');
const { dbConnect } = require('./db.mongoose');

//routers
const { authRouter } = require('./auth/auth.router');
const { userRouter } = require('./user/user.router');
const { postRouter } = require('./post/post.router');

const app = express();

//middleware
app.use(express.json());

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

//router setup
app.use('/api/auth', authRouter); // Redirects all calls to /api/user to userRouter.
app.use('/api/user', userRouter); // Redirects all calls to /api/user to userRouter.
app.use('/api/post', postRouter); // Redirects all calls to /api/post to postRouter.

// In case we make a HTTP request that is unhandled by our Express server, we return a 404 status code and the message "Not Found."
app.use('*', function(req, res) {
  res.status(HTTP_STATUS_CODES.NOT_FOUND).json({ error: 'Not Found.' });
});

// Custom 404 Not Found route handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// Custom Error Handler
app.use((err, req, res, next) => {
  if (err.status) {
    const errBody = Object.assign({}, err, { message: err.message });
    res.status(err.status).json(errBody);
  } else {
    console.error(err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// App listen
function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

//Export
module.exports = { app };
