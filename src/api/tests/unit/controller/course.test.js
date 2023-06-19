const controller = require('../../../controllers/course.controller');
const models = require('../../../models');

const { Sequelize } = require('sequelize')

let sequelize;

beforeAll( async () => {
    sequelize = new Sequelize({
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
        dialect: "postgres",
        logging: false
    })

    await sequelize.authenticate();
})

afterAll( async () => {
    await sequelize.close()
})

describe('Create Course For Specific User', () => {
    it('should create new course for user if user is exists in the system', async () => {
        const req = {
            header: jest.fn().mockReturnValue('15'),
            body: {
                title: 'Java Mastery',
                description: 'This Java Course can cover OOP, DSA and DB. where you can create one final project using this three pattern',
                rating: 5,
                publisher: 'Muhammad Al Fahad',
                upload_date: new Date('1990-01-01')
            }
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const course = {
            id: 1,
            user_id: 15,
            title: 'Java Mastery',
            description: 'This Java Course can cover OOP, DSA and DB. where you can create one final project using this three pattern',
            rating: 5,
            publisher: 'Muhammad Al Fahad',
            upload_date: new Date('1990-01-01')
        }

        const user = {
            id: 15,
            name: 'John Doe',
            password: 'encryptedPassword123',
            email: 'john.doe@gmail.com',
            city: 'New York',
            dob: '1990-01-01',
            phone: '1234567890',
            gender: 'Male',
        }

        models.users.findOne = jest.fn().mockResolvedValue(user)
        models.courses.create = jest.fn().mockResolvedValue(course)

        await controller.createCourse(req, res)

        expect(req.header('user_id')).toBe('15')
        expect(models.users.findOne).toHaveBeenCalledWith({
            where: {
                id: '15'
            }
        })
        expect(models.courses.create).toHaveBeenCalledWith({
            user_id: '15',
            title: req.body.title,
            description: req.body.description,
            rating: req.body.rating,
            publisher: req.body.publisher,
            upload_date: req.body.upload_date
        })
        expect(res.status).toHaveBeenCalledWith(202)
        expect(res.json).toHaveBeenCalledWith({success: true, msg: `Successfully created course for ${user.name}`, course: course})
    })

    it('should return an error message if user id is invalid', async () => {
        const req = {
            header: jest.fn().mockReturnValue('-1'),
            body: {
                title: 'Java Mastery',
                description: 'This Java Course can cover OOP, DSA and DB. where you can create one final project using this three pattern',
                rating: 5,
                publisher: 'Muhammad Al Fahad',
                upload_date: new Date('1990-01-01')
            }
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        await controller.createCourse(req, res)

        expect(res.status).toHaveBeenCalledWith(402)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: "Required a valid user id!"})
    })

    it('should return an error message if user is not exists', async () => {
        const req = {
            header: jest.fn().mockReturnValue('2'),
            body: {
                title: 'Java Mastery',
                description: 'This Java Course can cover OOP, DSA and DB. where you can create one final project using this three pattern',
                rating: 5,
                publisher: 'Muhammad Al Fahad',
                upload_date: new Date('1990-01-01')
            }
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        models.users.findOne = jest.fn().mockResolvedValue(null)

        await controller.createCourse(req, res)

        expect(req.header('user_id')).toBe('2')
        expect(models.users.findOne).toHaveBeenCalledWith({
            where: {
                id: '2'
            }
        })
        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: "User does not exists!"})
    })

    it('should handle sequelize foreign key constraint error', async () => {
        const req = {
            header: jest.fn().mockReturnValue('2'),
            body: {
                title: 'Java Mastery',
                description: 'This Java Course can cover OOP, DSA and DB. where you can create one final project using this three pattern',
                rating: 5,
                publisher: 'Muhammad Al Fahad',
                upload_date: new Date('1990-01-01')
            }
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const user = {
            id: 2,
            name: 'John Doe',
            password: 'encryptedPassword123',
            email: 'john.doe@gmail.com',
            city: 'New York',
            dob: '1990-01-01',
            phone: '1234567890',
            gender: 'Male',
        }

        const mockError = {
            name: 'SequelizeForeignKeyConstraintError',
            message: 'User does not exists!'
        }

        models.users.findOne = jest.fn().mockResolvedValue(user)
        models.courses.create = jest.fn().mockRejectedValue(mockError)

        await controller.createCourse(req, res)

        expect(req.header('user_id')).toBe('2')
        expect(models.users.findOne).toHaveBeenCalledWith({
            where: {
                id: '2'
            }
        })
        expect(models.courses.create).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: mockError.message})
    })

    it('should handle server error', async () => {
        const req = {
            header: jest.fn().mockReturnValue('2'),
            body: {
                title: 'Java Mastery',
                description: 'This Java Course can cover OOP, DSA and DB. where you can create one final project using this three pattern',
                rating: 5,
                publisher: 'Muhammad Al Fahad',
                upload_date: new Date('1990-01-01')
            }
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const user = {
            id: 2,
            name: 'John Doe',
            password: 'encryptedPassword123',
            email: 'john.doe@gmail.com',
            city: 'New York',
            dob: '1990-01-01',
            phone: '1234567890',
            gender: 'Male',
        }

        const mockError = new Error('something went wrong')

        models.users.findOne = jest.fn().mockResolvedValue(user)
        models.courses.create = jest.fn().mockRejectedValue(mockError)

        await controller.createCourse(req, res)

        expect(req.header('user_id')).toBe('2')
        expect(models.users.findOne).toHaveBeenCalledWith({
            where: {
                id: '2'
            }
        })
        expect(models.courses.create).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: mockError.message})
    })
})

describe('Get Specific User Courses', () => {
    it('should return courses for specific user if available', async () => {
        const req = {
            user: {
                id: 15
            }
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const courses = [
            {
                id: 1,
                user_id: 15,
                title: 'Java Mastery',
                description: 'This Java Course can cover OOP, DSA and DB. where you can create one final project using this three pattern',
                rating: 2,
                publisher: 'Muhammad Al Fahad',
                upload_date: new Date('1990-01-01')
            },
            {
                id: 2,
                user_id: 15,
                title: 'Node Mastery',
                description: 'This Node Course can cover OOP, DSA and DB. where you can create one final project using this three pattern',
                rating: 3,
                publisher: 'Muhammad Al Fahad',
                upload_date: new Date('1980-01-01')
            }
        ]

        models.courses.findAll = jest.fn().mockResolvedValue(courses)

        await controller.getUserCourses(req, res)

        expect(models.courses.findAll).toHaveBeenCalledWith({
            where: {
                user_id: req.user.id
            }
        })

        expect(res.status).toHaveBeenCalledWith(202)
        expect(res.json).toHaveBeenCalledWith({success: true, course: courses})
    })

    it('should handle server error', async () => {
        const req = {
            user: {
                id: 15
            }
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockError = new Error('something went wrong')

        models.courses.findAll = jest.fn().mockRejectedValue(mockError)

        await controller.getUserCourses(req, res)

        expect(models.courses.findAll).toHaveBeenCalledWith({
            where: {
                user_id: req.user.id
            }
        })

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: mockError.message})
    })
})

describe('Get All Courses', () => {
    it('should return all courses to admin user', async () => {
        const req = {}

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const courses = [
            {
                id: 1,
                user_id: 15,
                title: 'Java Mastery',
                description: 'This Java Course can cover OOP, DSA and DB. where you can create one final project using this three pattern',
                rating: 2,
                publisher: 'Muhammad Al Fahad',
                upload_date: new Date('1990-01-01')
            },
            {
                id: 2,
                user_id: 14,
                title: 'Node Mastery',
                description: 'This Node Course can cover OOP, DSA and DB. where you can create one final project using this three pattern',
                rating: 3,
                publisher: 'Muhammad Al Fahad',
                upload_date: new Date('1980-01-01')
            }
        ]

        models.courses.findAll = jest.fn().mockResolvedValue(courses)

        await controller.getAllCourses(req, res)

        expect(models.courses.findAll).toHaveBeenCalledWith()

        expect(res.status).toHaveBeenCalledWith(202)
        expect(res.json).toHaveBeenCalledWith({success: true, course: courses})
    })

    it('should handle server error', async () => {
        const req = {}

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockError = new Error('something went wrong')

        models.courses.findAll = jest.fn().mockRejectedValue(mockError)

        await controller.getAllCourses(req, res)

        expect(models.courses.findAll).toHaveBeenCalledWith()

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: mockError.message})
    })
})

describe('Delete Specific Course', () => {
    it('should delete course if course is available to course list', async () => {
        const req = {
            header: jest.fn().mockReturnValue('2')
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const course = {
                id: 2,
                user_id: 15,
                title: 'Java Mastery',
                description: 'This Java Course can cover OOP, DSA and DB. where you can create one final project using this three pattern',
                rating: 2,
                publisher: 'Muhammad Al Fahad',
                upload_date: new Date('1990-01-01')
            }

        models.courses.destroy = jest.fn().mockResolvedValue(course)

        await controller.deleteCourse(req, res)

        expect(req.header('id')).toBe('2')

        expect(models.courses.destroy).toHaveBeenCalledWith({
            where: {
                id: '2'
            }
        })

        expect(res.status).toHaveBeenCalledWith(202)
        expect(res.json).toHaveBeenCalledWith({success: true, msg: 'Deleted Successfully', course: course})
    })

    it('should handle server error', async () => {
        const req = {
            header: jest.fn().mockReturnValue('2')
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockError = new Error('something went wrong')

        models.courses.destroy = jest.fn().mockRejectedValue(mockError)

        await controller.deleteCourse(req, res)

        expect(req.header('id')).toBe('2')

        expect(models.courses.destroy).toHaveBeenCalledWith({
            where: {
                id: '2'
            }
        })

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: mockError.message})
    })
})

describe('Get Specific Course', () => {
    it('should return course data if course is available to course list', async () => {
        const req = {
            params: {
                id: 2
            }
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const course = {
                id: 2,
                user_id: 15,
                title: 'Java Mastery',
                description: 'This Java Course can cover OOP, DSA and DB. where you can create one final project using this three pattern',
                rating: 2,
                publisher: 'Muhammad Al Fahad',
                upload_date: new Date('1990-01-01')
            }

        models.courses.findOne = jest.fn().mockResolvedValue(course)

        await controller.getCourse(req, res)

        expect(models.courses.findOne).toHaveBeenCalledWith({
            where: {
                id: req.params.id
            }
        })

        expect(res.status).toHaveBeenCalledWith(202)
        expect(res.json).toHaveBeenCalledWith({success: true, course: course})
    })

    it('should return an error message if course is not exists', async () => {
        const req = {
            params: {
                id: 2
            }
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        models.courses.findOne = jest.fn().mockResolvedValue(null)

        await controller.getCourse(req, res)

        expect(models.courses.findOne).toHaveBeenCalledWith({
            where: {
                id: req.params.id
            }
        })

        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: "Course does not exists!"})
    })

    it('should handle sequelize foreign key constraint error', async () => {
        const req = {
            params: {
                id: 2
            }
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockError = {
            name: 'SequelizeForeignKeyConstraintError',
            message: 'Course does not exists!'
        }

        models.courses.findOne = jest.fn().mockRejectedValue(mockError)

        await controller.getCourse(req, res)

        expect(models.courses.findOne).toHaveBeenCalledWith({
            where: {
                id: req.params.id
            }
        })

        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: mockError.message})
    })

    it('should handle server error', async () => {
        const req = {
            params: {
                id: 2
            }
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockError = new Error('something went wrong')

        models.courses.findOne = jest.fn().mockRejectedValue(mockError)

        await controller.getCourse(req, res)

        expect(models.courses.findOne).toHaveBeenCalledWith({
            where: {
                id: req.params.id
            }
        })

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: mockError.message})
    })
})

describe('Update User Course', () => {
    it('should update specific course for user if course is exists in course list', async () => {
        const req = {
            header: jest.fn().mockReturnValue('46'),
            params: {
                id: 1
            },
            body: {
                title: 'Java Mastery',
                description: 'This Java Course can cover OOP, DSA and DB. where you can create one final project using this three pattern',
                rating: 5,
                publisher: 'Muhammad Al Fahad',
                last_update: new Date('2023-05-23'),
                upload_date: new Date('1990-01-01')
            }
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const course = {
            id: 1,
            user_id: 46,
            title: 'Java Mastery',
            description: 'This Java Course can cover OOP, DSA and DB. where you can create one final project using this three pattern',
            rating: 5,
            publisher: 'Muhammad Al Fahad',
            last_update: new Date('2023-05-23'),
            upload_date: new Date('1990-01-01')
        }

        const user = {
            id: 46,
            name: 'John Doe',
            password: 'encryptedPassword',
            email: 'john.doe@gmail.com',
            city: 'New York',
            dob: '1990-01-01',
            phone: '1234567890',
            gender: 'Male',
        }

        models.users.findOne = jest.fn().mockResolvedValue(user)
        models.courses.findOne = jest.fn().mockResolvedValue(course)
        models.courses.update = jest.fn().mockResolvedValue([1])

        await controller.updateCourse(req, res)

        expect(req.header('user_id')).toBe('46')
        expect(models.users.findOne).toHaveBeenCalledWith({
            where: {
                id: '46'
            }
        })
        expect(models.courses.findOne).toHaveBeenCalledWith({
            where: {
                id: req.params.id
            }
        })
        expect(models.courses.update).toHaveBeenCalledWith({
            user_id: '46',
            title: req.body.title,
            description: req.body.description,
            rating: req.body.rating,
            publisher: req.body.publisher,
            last_update: req.body.last_update,
            upload_date: req.body.upload_date
        }, {
            where: {
                id: req.params.id
            }
        })
        expect(res.status).toHaveBeenCalledWith(202)
        expect(res.json).toHaveBeenCalledWith({success: true, msg: 'Updated Successfully', course: [1]})
    })

    it('should return error message if user id is invalid', async () => {
        const req = {
            header: jest.fn().mockReturnValue(''),
            params: {
                id: 1
            },
            body: {
                title: 'Java Mastery',
                description: 'This Java Course can cover OOP, DSA and DB. where you can create one final project using this three pattern',
                rating: 5,
                publisher: 'Muhammad Al Fahad',
                last_update: new Date('2023-05-23'),
                upload_date: new Date('1990-01-01')
            }
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        await controller.updateCourse(req, res)

        expect(req.header('user_id')).toBe('')

        expect(res.status).toHaveBeenCalledWith(402)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: "Required a valid user id!"})
    })

    it('should return an error message if course is not exists', async () => {

        const req = {
            header: jest.fn().mockReturnValue('1'),
            params: {
                id: 1
            },
            body: {
                title: 'Java Mastery',
                description: 'This Java Course can cover OOP, DSA and DB. where you can create one final project using this three pattern',
                rating: 5,
                publisher: 'Muhammad Al Fahad',
                last_update: new Date('2023-05-23'),
                upload_date: new Date('1990-01-01')
            }
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const user = {
            id: 1,
            name: 'John Doe',
            password: 'encryptedPassword',
            email: 'john.doe@gmail.com',
            city: 'New York',
            dob: '1990-01-01',
            phone: '1234567890',
            gender: 'Male',
        }

        models.users.findOne = jest.fn().mockResolvedValue(user)
        models.courses.findOne = jest.fn().mockResolvedValue(null)

        await controller.updateCourse(req, res)

        expect(req.header('user_id')).toBe('1')
        expect(models.users.findOne).toHaveBeenCalledWith({
            where: {
                id: '1'
            }
        })
        expect(models.courses.findOne).toHaveBeenCalledWith({
            where: {
                id: req.params.id
            }
        })
        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: 'Course does not exists!'})
    })

    it('should handle sequelize foreign key constraint error', async () => {
        const req = {
            header: jest.fn().mockReturnValue('46'),
            params: {
                id: 1
            },
            body: {
                title: 'Java Mastery',
                description: 'This Java Course can cover OOP, DSA and DB. where you can create one final project using this three pattern',
                rating: 5,
                publisher: 'Muhammad Al Fahad',
                last_update: new Date('2023-05-23'),
                upload_date: new Date('1990-01-01')
            }
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const course = {
            id: 1,
            user_id: 46,
            title: 'Java Mastery',
            description: 'This Java Course can cover OOP, DSA and DB. where you can create one final project using this three pattern',
            rating: 5,
            publisher: 'Muhammad Al Fahad',
            last_update: new Date('2023-05-23'),
            upload_date: new Date('1990-01-01')
        }

        const user = {
            id: 46,
            name: 'John Doe',
            password: 'encryptedPassword',
            email: 'john.doe@gmail.com',
            city: 'New York',
            dob: '1990-01-01',
            phone: '1234567890',
            gender: 'Male',
        }

        const mockError = {
            name: 'SequelizeForeignKeyConstraintError',
            message: 'User does not exists!'
        }

        models.users.findOne = jest.fn().mockResolvedValue(user)
        models.courses.findOne = jest.fn().mockResolvedValue(course)
        models.courses.update = jest.fn().mockRejectedValue(mockError)

        await controller.updateCourse(req, res)

        expect(req.header('user_id')).toBe('46')
        expect(models.users.findOne).toHaveBeenCalledWith({
            where: {
                id: '46'
            }
        })
        expect(models.courses.findOne).toHaveBeenCalledWith({
            where: {
                id: req.params.id
            }
        })
        expect(models.courses.update).toHaveBeenCalledWith({
            user_id: '46',
            title: req.body.title,
            description: req.body.description,
            rating: req.body.rating,
            publisher: req.body.publisher,
            last_update: req.body.last_update,
            upload_date: req.body.upload_date
        }, {
            where: {
                id: req.params.id
            }
        })
        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: mockError.message})
    })


    it('should handle server error', async () => {
        const req = {
            header: jest.fn().mockReturnValue('46'),
            params: {
                id: 1
            },
            body: {
                title: 'Java Mastery',
                description: 'This Java Course can cover OOP, DSA and DB. where you can create one final project using this three pattern',
                rating: 5,
                publisher: 'Muhammad Al Fahad',
                last_update: new Date('2023-05-23'),
                upload_date: new Date('1990-01-01')
            }
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const course = {
            id: 1,
            user_id: 46,
            title: 'Java Mastery',
            description: 'This Java Course can cover OOP, DSA and DB. where you can create one final project using this three pattern',
            rating: 5,
            publisher: 'Muhammad Al Fahad',
            last_update: new Date('2023-05-23'),
            upload_date: new Date('1990-01-01')
        }

        const user = {
            id: 46,
            name: 'John Doe',
            password: 'encryptedPassword',
            email: 'john.doe@gmail.com',
            city: 'New York',
            dob: '1990-01-01',
            phone: '1234567890',
            gender: 'Male',
        }

        const mockError = new Error('something went wrong')

        models.users.findOne = jest.fn().mockResolvedValue(user)
        models.courses.findOne = jest.fn().mockResolvedValue(course)
        models.courses.update = jest.fn().mockRejectedValue(mockError)

        await controller.updateCourse(req, res)

        expect(req.header('user_id')).toBe('46')
        expect(models.users.findOne).toHaveBeenCalledWith({
            where: {
                id: '46'
            }
        })
        expect(models.courses.findOne).toHaveBeenCalledWith({
            where: {
                id: req.params.id
            }
        })
        expect(models.courses.update).toHaveBeenCalledWith({
            user_id: '46',
            title: req.body.title,
            description: req.body.description,
            rating: req.body.rating,
            publisher: req.body.publisher,
            last_update: req.body.last_update,
            upload_date: req.body.upload_date
        }, {
            where: {
                id: req.params.id
            }
        })
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: mockError.message})
    })
})

