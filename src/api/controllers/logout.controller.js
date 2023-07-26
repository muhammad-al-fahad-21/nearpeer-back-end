const jwt = require('jsonwebtoken')

class UserController {
    static logoutUser = async (req, res) => {
        try{           
            res.clearCookie('refresh_token', { path: '/', httpOnly: true })
            res.status(202).json({success: true, msg: "Logout Successfully"})
        }catch(err) {
            return res.status(500).json({success: false, msg: err.message})
        }
    }
}

module.exports = UserController