const express = require('express');
const router = express.Router();
const controller = require('../controllers/course.controller')
const isAuthenticated = require('../middlewares/auth')
const isAdmin = require('../middlewares/authAdmin')

router.route('/')
    .get(isAuthenticated, controller.getUserCourses)
    .post(isAuthenticated, isAdmin, controller.createCourse)

module.exports = router