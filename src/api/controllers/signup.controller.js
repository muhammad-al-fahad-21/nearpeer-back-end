const models = require('../models');
const bcrypt = require('bcrypt');
const validateEmail = require('../../config/validation')

class UserController {
    static signupUser = async (req, res) => {
        try{
            const {name, password, email, city, dob, phone, gender} = req.body
            
            if(!validateEmail(email)) return res.status(400).json({status: false, msg: "Invalid Email!"})

            const findUser = await models.users.findOne({
                where: {
                    email: email
                }
            })

            if(findUser) return res.status(400).json({status: false, msg: "This email is already existed in the database, use another email!"})
            if(!gender || gender == 'select') return res.status(400).json({status: false, msg: "Please fill all the fields!"})

            const encryptedPassword = await bcrypt.hash(password, 12)

            const user = await models.users.create({
                name, password: encryptedPassword, email, city, dob, phone, gender
            })

            res.status(202).json({success: true, msg: "Signup Successgully", user: user})
        }catch(err) {
            return res.status(500).json({success: false, msg: err.message})
        }
    }
}

module.exports = UserController