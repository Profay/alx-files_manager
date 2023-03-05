const express = require('express');
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');

const route = express.Router();

route.get('/status', AppController.getStatus);
route.get('/stats', AppController.getStats);
route.post('/users', UsersController.postNew);
route.get('/users/me', UsersController.getMe);
route.get('/connect', AuthController.getConnect)
route.get('/disconnect', AuthController.getDisconnect)


module.exports = route;
