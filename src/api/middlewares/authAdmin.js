const models = require('../models')


const isAdmin = async (req, res, next) => {
    try {

        const user = await models.users.findOne({
            where: {
                id: req.user.id
            }
        })

        if(!user.admin) return res.status(401).json({success: false, msg: "Admin resources access denied!"})

        next()

    }catch(err) {
        return res.status(500).json({success: false, msg: err.message})
    }
  };


  module.exports = isAdmin