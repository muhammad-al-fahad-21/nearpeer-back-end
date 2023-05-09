const express = require('express');
const router = express.Router();
const controller = require('../controllers/user_details.controller')
const isAuthenticated = require('../middlewares/auth')
const isAdmin = require('../middlewares/authAdmin')

router.route('/')
    .get(isAuthenticated, isAdmin, controller.getAllUsers)

router.route('/profile')
    .get(isAuthenticated, controller.getUserProfile)
    
router.route('/:id')
    .put(isAuthenticated, controller.updateUser)

router.route('/isAdmin/:id')
    .put(isAuthenticated, isAdmin, controller.isAdmin)

module.exports = router