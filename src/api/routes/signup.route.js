const express = require('express');
const router = express.Router();
const controller = require('../controllers/signup.controller')

router.route('/')
    .post(controller.signupUser)

module.exports = router