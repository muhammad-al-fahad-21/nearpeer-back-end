const models = require('../models');
const bcrypt = require('bcrypt');

class UserController {
    static getAllUsers = async (req, res) => {
        try{

            const users = await models.users.findAll()

            res.status(202).json({success: true, users})
        }catch(err) {
            return res.status(500).json({success: false, msg: err.message})
        }
    }

    static updateProfile = async (req, res) => {
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

            res.status(202).json({success: true, msg: 'Profile Updated!', user})
        }catch(err) {
            return res.status(500).json({success: false, msg: err.message})
        }
    }

    static isAdmin = async (req, res) => {
        try{

            const { id } = req.params
            const { admin } = req.body

            if(id === '' || id <= 0) return res.status(400).json({success: false, msg: "Inavlid user id!"})

            const find = await models.users.findOne({
                where: {
                    id
                }
            })

            if(!find) return res.status(404).json({success: false, msg: "User does not exists!"})

            const user = await models.users.update({
                admin
            }, {
                where: {
                    id: find.id
                }
            })

            res.status(202).json({success: true, msg: "Role Updated!", user})
        }catch(err) {
            return res.status(500).json({success: false, msg: err.message})
        }
    }

    static getUser = async (req, res) => {
        try{

            const id = req.header('id')

            const user = await models.users.findOne({
                where: {
                    id
                }
            })

            if(!user) return res.status(400).json({success: false, msg: "User does not exists!"})

            res.status(202).json({success: true, user})
        }catch(err) {
            return res.status(500).json({success: false, msg: err.message})
        }
    }

    static getProfile = async (req, res) => {
        try{

            const user = await models.users.findOne({
                where: {
                    id: req.user.id
                }
            })

            if(!user) return res.status(404).json({success: false, msg: "Not Found!"})

            res.status(202).json({success: true, user})

        }catch(err) {
            return res.status(500).json({success: false, msg: err.message})
        }
    }

    static deleteUser = async (req, res) => {
        try{

            const id = req.header('id')

            const user = await models.users.destroy({
                where: {
                    id
                }
            })

            res.status(202).json({success: true, msg: 'Deleted Successfully', user})

        }catch(err) {
            return res.status(500).json({success: false, msg: err.message})
        }
    }
}

module.exports = UserController