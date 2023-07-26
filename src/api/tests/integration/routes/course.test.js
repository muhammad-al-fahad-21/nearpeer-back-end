const request = require('supertest');
const models = require('../../../models');
const createRefreshToken = require('../../../../config/token')

const { Sequelize } = require('sequelize')

let sequelize;
let server;
let token;
let email;
let password;
let adminEmail;
let user_id;
let user_id2;
let email2;

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

describe('Course Details', () => {

    beforeEach(async () => {
        server = require('../../../../index');
        email = 'abc@example.com'
        adminEmail = 'cde@example.com'
        password = 'password123'
        token = 'invalidToken'
        user_id = 0
        user_id2 = 0
        email2 = 'efg@example.com'
    })

    afterEach( async () => {
        await models.courses.destroy({
            where: {
                user_id: [user_id, user_id2]
            }
        })
        await models.users.destroy({
            where: {
                email: [email, adminEmail, email2]
            }
        });
        await jest.restoreAllMocks();
        await server.close();
    })

    describe('Create Course', () => {

        it('should create new course for user if user is exist in the database', async () => {

            const User = {
                name: 'John Doe',
                password,
                email,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male',
                admin: false
            }


            const adminUser = {
                name: 'Muhammad Fahad',
                password,
                email: adminEmail,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male',
                admin: true
            }

            const user = await models.users.create(User);

            user_id = user.id

            const admin = await models.users.create(adminUser);

            token = createRefreshToken({id: admin.id});

            const course = {
                title: 'Mastery',
                description: 'This is best Course',
                rating: 4,
                publisher: 'Muhammad Ali',
                last_update: '1990-01-01',
                upload_date: '1989-08-23'
            }

            const res = await request(server).post('/api/course/').set('Authorization', token).set('user_id', user.id).send(course)

            expect(res.status).toBe(202)
            expect(res.body.success).toBe(true)
            expect(res.body.msg).toBe(`Successfully created course for ${User.name}`)
            expect(res.body.course).toHaveProperty('title', course.title)
        })

        it('should return 404 error if user is not exists', async () => {
    
            const adminUser = {
                name: 'Muhammad Fahad',
                password,
                email: adminEmail,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male',
                admin: true
            }

            const admin = await models.users.create(adminUser);

            token = createRefreshToken({id: admin.id})

            const course = {}

            const res = await request(server).post('/api/course/').set('Authorization', token).set('user_id', -1).send(course)

            expect(res.status).toBe(404)
            expect(res.body.success).toBe(false)
            expect(res.body.msg).toBe("User does not exists!")
        })

        it('should return 402 error if invlid id is passed', async () => {

            const adminUser = {
                name: 'Muhammad Fahad',
                password,
                email: adminEmail,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male',
                admin: true
            }

            const admin = await models.users.create(adminUser)

            token = createRefreshToken({id: admin.id})

            const course = {}

            const res = await request(server).post('/api/course/').set('Authorization', token).set('user_id', '').send(course)

            expect(res.status).toBe(402)
            expect(res.body.success).toBe(false)
            expect(res.body.msg).toBe("Required a valid user id!")
        })

        it('should return 500 error if unexpected error occured', async () => {
            const adminUser = {
                name: 'Muhammad Fahad',
                password,
                email: adminEmail,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male',
                admin: true
            }

            const admin = await models.users.create(adminUser)

            token = createRefreshToken({id: admin.id})

            const course = {}

            const res = await request(server).post('/api/course/').set('Authorization', token).set('user_id', 'p').send(course)

            expect(res.status).toBe(500)
            expect(res.body.success).toBe(false)
            expect(res.body.msg).toBeDefined()
        })
    })

    describe('Get User Courses', () => {

        it('should return all courses of authorized user if user is login', async () => {

            const User = {
                name: 'John Doe',
                password,
                email,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male',
                admin: false
            }

            const user = await models.users.create(User);

            const courses = [
                {
                    user_id: user.id,
                    title: 'Mastery',
                    description: 'This is best Course',
                    rating: 4,
                    publisher: 'Muhammad Ali',
                    last_update: '1990-01-01',
                    upload_date: '1989-08-23'
                },
                {
                    user_id: user.id,
                    title: 'Mastery 1',
                    description: 'This is best Course 2',
                    rating: 5,
                    publisher: 'Muhammad Akram',
                    last_update: '1990-01-01',
                    upload_date: '1989-08-23'
                }
            ]

            for(const course of courses) {
                await models.courses.create(course)
            }

            token = createRefreshToken({id: user.id})

            user_id = user.id

            const res = await request(server).get('/api/course/user').set('Authorization', token)

            expect(res.status).toBe(202)
            expect(res.body.success).toBe(true)
            expect(res.body.userCourse.length).toBe(2)
            expect(res.body.userCourse.some(c => c.title === courses[0].title)).toBeTruthy()
        })

        it('should return 500 error if unexpected error occured', async () => {

            jest.spyOn(models.courses, 'findAll').mockImplementation(() => {
                throw new Error('something went wrong')
            })

            const User = {
                name: 'John Doe',
                password,
                email,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male',
                admin: false
            }

            const user = await models.users.create(User);

            token = createRefreshToken({id: user.id})

            const res = await request(server).get('/api/course/user').set('Authorization', token)

            expect(res.status).toBe(500)
            expect(res.body.success).toBe(false)
            expect(res.body.msg).toBeDefined()
        })
    })

    describe('Get All Courses', () => {
        it('should return all courses if user is admin', async () => {
            const User = [
                {
                    name: 'John Doe',
                    password,
                    email,
                    city: 'New York',
                    dob: '1990-01-01',
                    phone: '1234567890',
                    gender: 'male',
                    admin: false
                },
                {
                    name: 'Muhammad Al Fahad',
                    password,
                    email: email2,
                    city: 'New York',
                    dob: '1990-01-01',
                    phone: '1234567890',
                    gender: 'male',
                    admin: false
                },
                {

                    name: 'Muhammad Fahad',
                    password,
                    email: adminEmail,
                    city: 'New York',
                    dob: '1990-01-01',
                    phone: '1234567890',
                    gender: 'male',
                    admin: true
                }
            ]

            const user = await models.users.create(User[0])
            const user2 = await models.users.create(User[1])
            const admin = await models.users.create(User[2])

            const Courses = [
                {
                    user_id: user.id,
                    title: 'Mastery',
                    description: 'This is best Course',
                    rating: 4,
                    publisher: 'Muhammad Ali',
                    last_update: '1990-01-01',
                    upload_date: '1989-08-23'
                },
                {
                    user_id: user2.id,
                    title: 'Mastery 1',
                    description: 'This is best Course 2',
                    rating: 5,
                    publisher: 'Muhammad Akram',
                    last_update: '1990-01-01',
                    upload_date: '1989-08-23'
                }
            ]

            for(const course of Courses) {
                await models.courses.create(course)
            }

            token = createRefreshToken({id: admin.id})

            user_id = user.id
            user_id2 = user2.id

            const res = await request(server).get('/api/course/').set('Authorization', token)

            expect(res.status).toBe(202)
            expect(res.body.success).toBe(true)
            expect(res.body.courses.length).toBe(2)
            expect(res.body.courses.some(c => c.title === Courses[0].title)).toBeTruthy()
        })

        it('should return 500 error if unexpected error occured', async () => {

            jest.spyOn(models.courses, 'findAll').mockImplementation(() => {
                throw new Error('something went wrong')
            })

            const User = {
                name: 'John Doe',
                password,
                email,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male',
                admin: true
            }

            const admin = await models.users.create(User);

            token = createRefreshToken({id: admin.id})

            const res = await request(server).get('/api/course/').set('Authorization', token)

            expect(res.status).toBe(500)
            expect(res.body.success).toBe(false)
            expect(res.body.msg).toBeDefined()
        })
    })

    describe('Delete Course', () => {

        beforeEach(() => {
            jest.restoreAllMocks()
        })

        it('should deleted the course successfully if user is admin', async () => {
            
            const User = [
                {
                    name: 'John Doe',
                    password,
                    email,
                    city: 'New York',
                    dob: '1990-01-01',
                    phone: '1234567890',
                    gender: 'male',
                    admin: false
                },
                {
                    name: 'Muhammad Fahad',
                    password,
                    email: adminEmail,
                    city: 'New York',
                    dob: '1990-01-01',
                    phone: '1234567890',
                    gender: 'male',
                    admin: true
                }
            ]

            const user = await models.users.create(User[0])
            const admin = await models.users.create(User[1])

            const Course = {
                user_id: user.id,
                title: 'Mastery',
                description: 'This is best Course',
                rating: 4,
                publisher: 'Muhammad Ali',
                last_update: '1990-01-01',
                upload_date: '1989-08-23'
            }

            const course = await models.courses.create(Course)

            token = createRefreshToken({id: admin.id})

            const res = await request(server).delete('/api/course/').set('Authorization', token).set('id', course.id)

            expect(res.status).toBe(202)
            expect(res.body.msg).toBe('Deleted Successfully')
            expect(res.body.course).toBeDefined()
        })

        it('should return 500 error if unexpected error occured', async () => {

            const User = [
                {
                    name: 'John Doe',
                    password,
                    email,
                    city: 'New York',
                    dob: '1990-01-01',
                    phone: '1234567890',
                    gender: 'male',
                    admin: false
                },
                {
                    name: 'Muhammad Fahad',
                    password,
                    email: adminEmail,
                    city: 'New York',
                    dob: '1990-01-01',
                    phone: '1234567890',
                    gender: 'male',
                    admin: true
                }
            ]

            const user = await models.users.create(User[0])
            const admin = await models.users.create(User[1])

            const Course = {
                user_id: user.id,
                title: 'Mastery',
                description: 'This is best Course',
                rating: 4,
                publisher: 'Muhammad Ali',
                last_update: '1990-01-01',
                upload_date: '1989-08-23'
            }

            await models.courses.create(Course)

            user_id = user.id

            token = createRefreshToken({id: admin.id})

            const res = await request(server).delete('/api/course/').set('Authorization', token).set('id', '')

            expect(res.status).toBe(500)
            expect(res.body.success).toBe(false)
            expect(res.body.msg).toBeDefined()
        })
    })

    describe('Get Course', () => {

        it('should return course details if user is authenticated', async () => {

            const User = {
                name: 'John Doe',
                password,
                email,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male'
            }

            const user = await models.users.create(User)

            const Course = {
                user_id: user.id,
                title: 'Mastery',
                description: 'This is best Course',
                rating: 4,
                publisher: 'Muhammad Ali',
                last_update: '1990-01-01',
                upload_date: '1989-08-23'
            }

            const course = await models.courses.create(Course)

            user_id = user.id

            token = createRefreshToken({id: user.id})

            const res = await request(server).get(`/api/course/${course.id}`).set('Authorization', token)

            expect(res.status).toBe(202)
            expect(res.body.course).toHaveProperty('title', Course.title)
        })

        it('should return 404 if user is not exists', async () => {

            const User = {
                name: 'John Doe',
                password,
                email,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male'
            }

            const user = await models.users.create(User)

            const Course = {
                user_id: user.id,
                title: 'Mastery',
                description: 'This is best Course',
                rating: 4,
                publisher: 'Muhammad Ali',
                last_update: '1990-01-01',
                upload_date: '1989-08-23'
            }

            const course = await models.courses.create(Course)

            user_id = user.id

            token = createRefreshToken({id: user.id})

            const res = await request(server).get(`/api/course/${0}`).set('Authorization', token)

            expect(res.status).toBe(404)
            expect(res.body.msg).toBe("Course does not exists!")
        })

        it('should return 500 error if unexpected error occured', async () => {
            jest.spyOn(models.courses, 'findOne').mockImplementation(() => {
                throw new Error('something went wrong')
            })

            const User = {
                name: 'John Doe',
                password,
                email,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male'
            }

            const user = await models.users.create(User)

            const Course = {
                user_id: user.id,
                title: 'Mastery',
                description: 'This is best Course',
                rating: 4,
                publisher: 'Muhammad Ali',
                last_update: '1990-01-01',
                upload_date: '1989-08-23'
            }

            const course = await models.courses.create(Course)

            user_id = user.id

            token = createRefreshToken({id: user.id})

            const res = await request(server).get(`/api/course/${course.id}`).set('Authorization', token)

            expect(res.status).toBe(500)
            expect(res.body.msg).toBeDefined()
        })
    })

    describe('Update Course', () => {

        it('should update the course if user id admin', async () => {

            const User = [
                {
                    name: 'John Doe',
                    password,
                    email,
                    city: 'New York',
                    dob: '1990-01-01',
                    phone: '1234567890',
                    gender: 'male',
                    admin: false
                },
                {
                    name: 'Muhammad Fahad',
                    password,
                    email: adminEmail,
                    city: 'New York',
                    dob: '1990-01-01',
                    phone: '1234567890',
                    gender: 'male',
                    admin: true
                }
            ]

            const user = await models.users.create(User[0])
            const admin = await models.users.create(User[1])

            const Course = {
                user_id: user.id,
                title: 'Mastery',
                description: 'This is best Course',
                rating: 4,
                publisher: 'Muhammad Ali',
                last_update: '1990-01-01',
                upload_date: '1989-08-23'
            }

            const updatedCourse = {
                title: 'Java Mastery',
                description: 'This is Java Course',
                rating: 5,
                publisher: 'Moosh Hamedani',
                last_update: '1990-01-01',
                upload_date: '1989-08-23'
            }

            const course = await models.courses.create(Course)

            user_id = user.id

            token = createRefreshToken({id: admin.id})

            const res = await request(server).put(`/api/course/${course.id}`).set('Authorization', token).set('user_id', user.id).send(updatedCourse)

            expect(res.status).toBe(202)
            expect(res.body.msg).toBe('Updated Successfully')

            const getCourse = await models.courses.findOne({
                where: {
                    id: course.id
                }
            })

            expect(getCourse.title).toBe(updatedCourse.title)
        })

        it('should return 402 error if invalid user_id is passed', async () => {
            const User = [
                {
                    name: 'John Doe',
                    password,
                    email,
                    city: 'New York',
                    dob: '1990-01-01',
                    phone: '1234567890',
                    gender: 'male',
                    admin: false
                },
                {
                    name: 'Muhammad Fahad',
                    password,
                    email: adminEmail,
                    city: 'New York',
                    dob: '1990-01-01',
                    phone: '1234567890',
                    gender: 'male',
                    admin: true
                }
            ]

            const user = await models.users.create(User[0])
            const admin = await models.users.create(User[1])

            const Course = {
                user_id: user.id,
                title: 'Mastery',
                description: 'This is best Course',
                rating: 4,
                publisher: 'Muhammad Ali',
                last_update: '1990-01-01',
                upload_date: '1989-08-23'
            }

            const updatedCourse = {
                title: 'Java Mastery',
                description: 'This is Java Course',
                rating: 5,
                publisher: 'Moosh Hamedani',
                last_update: '1990-01-01',
                upload_date: '1989-08-23'
            }

            const course = await models.courses.create(Course)

            user_id = user.id

            token = createRefreshToken({id: admin.id})

            const res = await request(server).put(`/api/course/${course.id}`).set('Authorization', token).set('user_id', '').send(updatedCourse)

            expect(res.status).toBe(402)
            expect(res.body.msg).toBe("Required a valid user id!")
        })

        it('should return 404 error if user is not exists', async () => {
    
            const adminUser = {
                name: 'Muhammad Fahad',
                password,
                email: adminEmail,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male',
                admin: true
            }

            const User = {
                name: 'Muhammad Fahad',
                password,
                email,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male',
                admin: true
            }

            const admin = await models.users.create(adminUser);
            const user = await models.users.create(User);

            token = createRefreshToken({id: admin.id})

            const Course = {
                user_id: user.id,
                title: 'Mastery',
                description: 'This is best Course',
                rating: 4,
                publisher: 'Muhammad Ali',
                last_update: '1990-01-01',
                upload_date: '1989-08-23'
            }

            const updatedCourse = {
                title: 'Mastery 1',
                description: 'This is best Course 1',
                rating: 5,
                publisher: 'Muhammad Al Fahad',
                last_update: '1990-01-01',
                upload_date: '1989-08-23'
            }

            const course = await models.courses.create(Course)

            user_id = user.id

            const res = await request(server).post(`/api/course/${course.id}`).set('Authorization', token).set('user_id', '1').send(updatedCourse)

            expect(res.status).toBe(404)
        })

        it('should return 404 error if course is not exists', async () => {
            const User = [
                {
                    name: 'John Doe',
                    password,
                    email,
                    city: 'New York',
                    dob: '1990-01-01',
                    phone: '1234567890',
                    gender: 'male',
                    admin: false
                },
                {
                    name: 'Muhammad Fahad',
                    password,
                    email: adminEmail,
                    city: 'New York',
                    dob: '1990-01-01',
                    phone: '1234567890',
                    gender: 'male',
                    admin: true
                }
            ]

            const user = await models.users.create(User[0])
            const admin = await models.users.create(User[1])

            const updatedCourse = {
                title: 'Java Mastery',
                description: 'This is Java Course',
                rating: 5,
                publisher: 'Moosh Hamedani',
                last_update: '1990-01-01',
                upload_date: '1989-08-23'
            }

            user_id = user.id

            token = createRefreshToken({id: admin.id})

            const res = await request(server).put(`/api/course/${0}`).set('Authorization', token).set('user_id', user.id).send(updatedCourse)

            expect(res.status).toBe(404)
            expect(res.body.msg).toBe('Course does not exists!')
        })

        it('should return 500 error if unexpected error occured', async () => {

            jest.spyOn(models.courses, 'update').mockImplementation(() => {
                throw new Error('something went wrong')
            })
            
            const User = [
                {
                    name: 'John Doe',
                    password,
                    email,
                    city: 'New York',
                    dob: '1990-01-01',
                    phone: '1234567890',
                    gender: 'male',
                    admin: false
                },
                {
                    name: 'Muhammad Fahad',
                    password,
                    email: adminEmail,
                    city: 'New York',
                    dob: '1990-01-01',
                    phone: '1234567890',
                    gender: 'male',
                    admin: true
                }
            ]

            const user = await models.users.create(User[0])
            const admin = await models.users.create(User[1])

            const Course = {
                user_id: user.id,
                title: 'Mastery',
                description: 'This is best Course',
                rating: 4,
                publisher: 'Muhammad Ali',
                last_update: '1990-01-01',
                upload_date: '1989-08-23'
            }

            const updatedCourse = {
                title: 'Java Mastery',
                description: 'This is Java Course',
                rating: 5,
                publisher: 'Moosh Hamedani',
                last_update: '1990-01-01',
                upload_date: '1989-08-23'
            }

            const course = await models.courses.create(Course)

            user_id = user.id

            token = createRefreshToken({id: admin.id})

            const res = await request(server).put(`/api/course/${course.id}`).set('Authorization', token).set('user_id', user.id).send(updatedCourse)

            expect(res.status).toBe(500)
            expect(res.body.success).toBe(false)
            expect(res.body.msg).toBeDefined()
        })
    })
})