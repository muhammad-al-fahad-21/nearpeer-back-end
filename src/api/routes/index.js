const express = require('express');
const loginRoutes = require('./login.route');
const courseRoutes = require('./course.route');
const signupRoutes = require('./signup.route');
const userDetailsRoutes = require('./userDetails.route')
const logoutRoutes = require('./logout.route')
const forgetPasswordRoutes = require('./forgetPassword.route')

const router = express.Router();

router.get('/status', (req, res) => res.send('OK'))

router.use('/docs', express.static('docs'));

router.use('/login', loginRoutes);
router.use('/course', courseRoutes);
router.use('/signup', signupRoutes);
router.use('/user', userDetailsRoutes);
router.use('/logout', logoutRoutes)
router.use('/forget_password', forgetPasswordRoutes)

module.exports = router