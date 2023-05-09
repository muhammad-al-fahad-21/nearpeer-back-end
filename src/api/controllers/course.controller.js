const models = require('../models')

class CourseController {
    static createCourse = async (req, res) => {
        try{

            const user = req.header('user_id');

            const {title, description, rating, publisher, last_update, upload_date } = req.body

            if(!user) return res.status(402).json({success: false, msg: "User id should be required!"})

            const find = models.users.findOne({
                where: {
                    id: user
                }
            })

            if(!find) return res.status(404).json({success: false, msg: "User does not exists!"})

            const course = await models.courses.create({
                user_id: user, title, description, rating, publisher, last_update, upload_date
            })

            res.status(202).json({success: true, msg: `Successfully created course for ${find.name}`, course: course})
        }catch(err) {
            return res.status(500).json({success: false, msg: err.message})
        }
    }

    static getUserCourses = async (req, res) => {
        try{

            const course = await models.courses.findAll({
                where: {
                    user_id: req.user.id
                }
            })

            res.status(202).json({success: true, course: course})

        }catch(err) {
            return res.status(500).json({success: false, msg: err.message})
        }
    }

}

module.exports = CourseController