const models = require('../models');
const bcrypt = require('bcrypt');

class UserController {
    static getAllUsers = async (req, res) => {
        try{

            const user = await models.users.findAll()

            res.status(202).json({success: true, user})
        }catch(err) {
            return res.status(500).json({success: false, msg: err.message})
        }
    }

    static updateUser = async (req, res) => {
        try{

            const {name, password, city, dob, phone, gender} = req.body

            const encrypted = await bcrypt.hash(password, 12);

            const user = await models.users.update({
                name, password: encrypted, city, dob, phone, gender
            }, {
                where: {
                    id: req.user.id
                }
            })

            res.status(202).json({success: true, user: user})
        }catch(err) {
            return res.status(500).json({success: false, msg: err.message})
        }
    }

    static isAdmin = async (req, res) => {
        try{

            const { id } = req.params
            const { isAdmin } = req.body

            if(!id) return res.status(400).json({success: false, msg: "Please enter the user id!"})

            const find = await models.users.findOne({
                where: {
                    id: id
                }
            })

            if(!find) return res.status(404).json({success: false, msg: "User does not exists!"})

            const user = await models.users.update({
                isAdmin
            }, {
                where: {
                    id: find.id
                }
            })

            res.status(202).json({success: true, user: user})
        }catch(err) {
            return res.status(500).json({success: false, msg: err.message})
        }
    }

    static getUserProfile = async (req, res) => {
        try{

            const find = await models.users.findOne({
                where: {
                    id: req.user.id
                }
            })

            if(!find) return res.status(400).json({success: false, msg: "User does not exists!"})

            res.status(202).json({success: true, user: find})
        }catch(err) {
            return res.status(500).json({success: false, msg: err.message})
        }
    }
}

module.exports = UserController