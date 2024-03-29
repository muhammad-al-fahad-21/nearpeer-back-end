const models = require('../models');
const bcrypt = require('bcrypt');
const validateEmail = require('../../config/validation')
const createActivationToken = require('../../config/token')

class UserController {
    static signupUser = async (req, res) => {
        try{
            const {name, password, email, city, dob, phone, gender} = req.body
            
            if(!validateEmail(email)) return res.status(400).json({success: false, msg: "Invalid Email!"})

            const findUser = await models.users.findOne({
                where: {
                    email
                }
            })

            if(findUser) return res.status(400).json({success: false, msg: "This email is already existed in the database, use another email!"})

            const encryptedPassword = await bcrypt.hash(password, 12)

            const user = await models.users.create({
                name, password: encryptedPassword, email, city, dob, phone, gender
            })

            const refresh_token = createActivationToken({id: user.id})

            res.cookie('refresh_token', refresh_token, { path: '/', httpOnly: true });
            res.status(202).json({success: true, msg: "Signup Successfully", refresh_token, user})
        }catch(err) {
            return res.status(500).json({success: false, msg: err.message})
        }
    }
}

module.exports = UserController