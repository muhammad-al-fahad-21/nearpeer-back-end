const express = require('express');
const router = express.Router();
const controller = require('../controllers/course.controller')
const isAuthenticated = require('../middlewares/auth')
const isAdmin = require('../middlewares/authAdmin')

router.route('/')
    .get(isAuthenticated, isAdmin, controller.getAllCourses)
    .post(isAuthenticated, isAdmin, controller.createCourse)
    .delete(isAuthenticated, isAdmin, controller.deleteCourse)

router.route('/user')
    .get(isAuthenticated, controller.getUserCourses)

router.route('/:id')
    .put(isAuthenticated, isAdmin, controller.updateCourse)
    .get(isAuthenticated, controller.getCourse)

module.exports = router