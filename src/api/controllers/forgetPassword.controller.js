const models = require('../models');
const bcrypt = require('bcrypt');

class ForgetController {
    static forgetPassword = async (req, res) => {
        try{
            const { email, password } = req.body

            const findUser = await models.users.findOne({
                where: {
                    email
                }
            })

            if(!findUser) return res.status(404).json({success: false, msg: "This email is not exists!"})

            const encryptedPassword = await bcrypt.hash(password, 12)

            await models.users.update({
                password: encryptedPassword
            }, {
                where: {
                    id: findUser.id
                }
            })

            res.status(202).json({success: true, msg: "Password reset successfully"})
        }catch(err) {
            return res.status(500).json({success: false, msg: err.message})
        }
    }
}

module.exports = ForgetController