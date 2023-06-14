const express = require('express');
const loginRoutes = require('./login.route');
const courseRoutes = require('./course.route');
const signupRoutes = require('./signup.route');
const userDetailsRoutes = require('./user_details.route')
const logoutRoutes = require('./logout.route')

const router = express.Router();

router.get('/status', (req, res) => res.send('OK'))

router.use('/docs', express.static('docs'));

router.use('/login', loginRoutes);
router.use('/course', courseRoutes);
router.use('/signup', signupRoutes);
router.use('/user', userDetailsRoutes);
router.use('/logout', loginRoutes)

module.exports = router