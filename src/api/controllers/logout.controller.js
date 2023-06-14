const jwt = require('jsonwebtoken')

class UserController {
    static logoutUser = async (req, res) => {
        try{
            const token = req.headers('Authorization')

            if(!token) return res.status(400).json({success: false, msg: 'Please Login'})

            const verify = jwt.verify(token, process.env.JWT_SECRET)

            if(!verify) return res.status(400).json({success: false, msg: 'Unauthorized'})
            
            res.clearCookie('refresh_token', {path: '/'})

            res.status(202).json({success: true, msg: "Logout Successfully"})
        }catch(err) {
            return res.status(500).json({success: false, msg: err.message})
        }
    }
}

module.exports = UserController