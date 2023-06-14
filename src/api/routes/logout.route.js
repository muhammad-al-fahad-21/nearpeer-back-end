const express = require('express');
const router = express.Router();
const controller = require('../controllers/logout.controller')
const isAuthenticated = require('../middlewares/auth')

router.route('/')
    .post(isAuthenticated, controller.logoutUser)

module.exports = router