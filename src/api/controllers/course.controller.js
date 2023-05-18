const models = require('../models')

class CourseController {
    static createCourse = async (req, res) => {
        try{

            const user = req.header('user_id');

            const {title, description, rating, publisher, lastest_update, upload_date } = req.body

            if(user <= 0) return res.status(402).json({success: false, msg: "Required a valid user id!"})

            const find = models.users.findOne({
                where: {
                    id: user
                }
            })

            if(!find) return res.status(404).json({success: false, msg: "User does not exists!"})

            const course = await models.courses.create({
                user_id: user, title, description, rating, publisher, lastest_update, upload_date
            })

            res.status(202).json({success: true, msg: `Successfully created course for ${find.name}`, course: course})
        }catch(err) {
            if (err.name === 'SequelizeForeignKeyConstraintError') {
                return res.status(404).json({ success: false, msg: "User does not exists!" });
            } else {
                return res.status(500).json({ success: false, msg: err.message });
            }
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

    static getAllCourses = async (req, res) => {
        try{

            const course = await models.courses.findAll()

            res.status(202).json({success: true, course: course})

        }catch(err) {
            return res.status(500).json({success: false, msg: err.message})
        }
    }

    static deleteCourse = async (req, res) => {
        try{

            const courseId = req.header('id')

            const course = await models.courses.destroy({
                where: {
                    id: courseId
                }
            })

            res.status(202).json({success: true, msg: 'Deleted Successfully', course: course})

        }catch(err) {
            return res.status(500).json({success: false, msg: err.message})
        }
    }

    static updateCourse = async (req, res) => {
        try{

            const { id } = req.params
            const user = req.header('user_id')

            const {title, description, rating, publisher, lastest_update, upload_date } = req.body

            if(user <= 0) return res.status(402).json({success: false, msg: "Required a valid user id!"})

            const find = models.users.findOne({
                where: {
                    id: user
                }
            })


            const cor = await models.courses.findOne({
                where: {
                    id: id
                }
            })

            const result = !cor ? 'Course' : !find ? 'User' : ''

            if(result !== '') return res.status(404).json({success: false, msg: `${result} does not exists!`})

            const course = await models.courses.update({
                user_id: user, title, description, rating, publisher, lastest_update, upload_date
            }, {
                where: {
                    id: id
                }
            })

            res.status(202).json({success: true, msg: 'Updated Successfully', course: course})

        }catch(err) {
            if (err.name === 'SequelizeForeignKeyConstraintError') {
                return res.status(404).json({ success: false, msg: "User does not exists!" });
            } else {
                return res.status(500).json({ success: false, msg: err.message });
            }
        }
    }

    static getCourse = async (req, res) => {
        try{

            const { id } = req.params

            const course = await models.courses.findOne({
                where: {
                    id: id
                }
            })

            if(!course) return res.status(404).json({success: false, msg: "Course does not exists!"})

            res.status(202).json({success: true, course: course})

        }catch(err) {
            if (err.name === 'SequelizeForeignKeyConstraintError') {
                return res.status(404).json({ success: false, msg: "Course does not exists!" });
            } else {
                return res.status(500).json({ success: false, msg: err.message });
            }
        }
    }

}

module.exports = CourseController