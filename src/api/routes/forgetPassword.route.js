const express = require('express');
const router = express.Router();
const controller = require('../controllers/forgetPassword.controller')

router.route('/')
    .put(controller.forgetPassword)

module.exports = router