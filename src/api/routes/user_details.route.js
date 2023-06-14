const express = require('express');
const router = express.Router();
const controller = require('../controllers/user_details.controller')
const isAuthenticated = require('../middlewares/auth')
const isAdmin = require('../middlewares/authAdmin')

router.route('/')
    .get(isAuthenticated, isAdmin, controller.getAllUsers)
    .delete(isAuthenticated, isAdmin, controller.deleteUser)

router.route('/info')
    .get(isAuthenticated, isAdmin, controller.getUser)

router.route('/profile')
    .get(isAuthenticated, controller.getProfile)
    .put(isAuthenticated, controller.updateProfile)

router.route('/isAdmin/:id')
    .put(isAuthenticated, isAdmin, controller.isAdmin)

module.exports = router