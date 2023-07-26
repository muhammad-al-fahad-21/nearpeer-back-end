const models = require('../models');
const bcrypt = require('bcrypt');
const createAccessToken = require('../../config/token')

class UserController {
    static loginUser = async (req, res) => {
        try{
            const {email, password} = req.body

            const encrypted = await models.users.findOne({
                where: {
                    email
                }
            })

            if(!encrypted) return res.status(404).json({success: false, msg: "User does not exists. please signup to the system!"})

            const isMatch = await bcrypt.compare(password, encrypted.password)

            if(!isMatch) return res.status(401).json({success: false, msg: "Wrong Password, please try again!"})

            const refresh_token = createAccessToken({id: encrypted.id})

            const user = await models.users.findOne({
                where: {
                    id: encrypted.id
                }
            })

            res.cookie('refresh_token', refresh_token, { path: '/', httpOnly: true });

            res.status(202).json({success: true, msg: "Login Successfully!", refresh_token, user})
        }catch(err) {
            return res.status(500).json({success: false, msg: err.message})
        }
    }
}

module.exports = UserController