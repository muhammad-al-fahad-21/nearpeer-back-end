const jwt = require('jsonwebtoken')

const isAuthenticated = (req, res, next) => {
    try {

        const token = req.header('Authorization');

        if(!token) return res.status(400).json({success: false, msg: 'Token has been expired, please login to system'})

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {

            if(err) return res.status(400).json({success: false, msg: 'Token has been expired, please login to system'})

            req.user = user

            next()

        })

    }catch(err) {
        return res.status(500).json({success: false, msg: err.message})
    }
  };


  module.exports = isAuthenticated