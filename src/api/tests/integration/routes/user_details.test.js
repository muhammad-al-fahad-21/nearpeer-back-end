const request = require('supertest');
const models = require('../../../models');
const createRefreshToken = require('../../../../config/token')
const jwt = require('jsonwebtoken')

const { Sequelize } = require('sequelize')

let sequelize;
let server;
let token;
let email;
let password;
let adminEmail;

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

describe('User Details', () => {

    beforeEach(async () => {
        server = require('../../../../index');
        email = 'abc@example.com'
        adminEmail = 'cde@example.com'
        password = 'password123'
        token = 'invalidToken'
    })

    afterEach( async () => {
        await models.users.destroy({
            where: {
                email: [email, adminEmail]
            }
        });
        await jest.restoreAllMocks();
        await server.close();
    })

    describe('Get All Users', () => {

        it('should return all users if user is admin', async () => {

            const adminUser = {
                name: 'John Doe',
                password,
                email,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male',
                admin: true
            }
    
            const user = await models.users.create(adminUser);

            token = createRefreshToken({id: user.id})

            const res = await request(server).get('/api/user/').set('Authorization', token)

            expect(res.status).toBe(202)
            expect(res.body).toHaveProperty('success', true)
            expect(res.body).toHaveProperty('user')
        })

        it('should return a 500 error if unexpected error occurs', async () => {

            jest.spyOn(jwt, 'verify').mockImplementation((token, secret, callback) => {
                throw new Error('something went wrong')
            })

            const res = await request(server).get('/api/user/').set('Authorization', token)

            expect(res.status).toBe(500)
            expect(res.body.msg).toBeDefined()
        })
    })

    describe('Update Profile', () => {
        
        it('should update user profile if user is authenticated', async () => {

            const User = {
                name: 'John Doe',
                password,
                email,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male'
            }

            const updateUser = {
                name: 'Muhammad Al Fahad',
                password,
                city: 'Multan, PK',
                dob: '2002-08-11',
                phone: '0099887766',
                gender: 'Male'
            }

            const user = await models.users.create(User);

            token = createRefreshToken({id: user.id})

            const res = await request(server).put('/api/user/profile').set('Authorization', token).send(updateUser)

            const getUser = await models.users.findOne({
                where: {
                    id: user.id
                }
            })

            expect(res.status).toBe(202)
            expect(getUser.name).toBe(updateUser.name)
        })

        it('should return a 500 error if unexpected error occurs', async () => {
            jest.spyOn(jwt, 'verify').mockImplementation((token, secret, callback) => {
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

            const updateUser = {
                name: 'Muhammad Al Fahad',
                password,
                city: 'Multan, PK',
                dob: '2002-08-11',
                phone: '0099887766',
                gender: 'Male'
            }

            const user = await models.users.create(User);

            token = createRefreshToken({id: user.id})

            const res = await request(server).put('/api/user/profile').set('Authorization', token).send(updateUser)

            expect(res.status).toBe(500)
            expect(res.body.msg).toBeDefined()
        })
    })

    describe('Get Profile', () => {
        
        it('should get user profile if user is authenticated', async () => {

            const User = {
                name: 'John Doe',
                password,
                email,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male'
            }

            const user = await models.users.create(User);

            token = createRefreshToken({id: user.id})

            const res = await request(server).get('/api/user/profile').set('Authorization', token)

            expect(res.status).toBe(202)
            expect(res.body.user).toHaveProperty('name', User.name)
        })

        it('should return a 400 error if user is not exists', async () => {

            token = createRefreshToken({id: 1})

            const res = await request(server).get('/api/user/profile').set('Authorization', token)

            expect(res.status).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.msg).toBe("Invalid Authentication!")
        })

        it('should return a 500 error if unexpected error is occured', async () => {

            jest.spyOn(jwt, 'verify').mockImplementation((token, secret, callback) => {
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

            const user = await models.users.create(User);

            token = createRefreshToken({id: user.id})

            const res = await request(server).get('/api/user/profile').set('Authorization', token)

            expect(res.status).toBe(500)
            expect(res.body.success).toBe(false)
            expect(res.body.msg).toBeDefined()
        })
    })

    describe('Update Role', () => {

        it('should update role of specific user', async () => {

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

            const admin = await models.users.create(adminUser);

            token = createRefreshToken({id: admin.id});

            const res = await request(server).put(`/api/user/isAdmin/${user.id}`).set('Authorization', token).send({admin: true})

            expect(res.status).toBe(202)
            expect(res.body.success).toBe(true)
            expect(res.body.msg).toBeDefined()
        })

        it('should return 400 error if id is not passed', async () => {

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

            token = createRefreshToken({id: admin.id});

            const res = await request(server).put(`/api/user/isAdmin/${-1}`).set('Authorization', token).send({admin: true})

            expect(res.status).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.msg).toBe("Inavlid user id!")
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

            token = createRefreshToken({id: admin.id});

            const res = await request(server).put(`/api/user/isAdmin/1`).set('Authorization', token).send({admin: true})

            expect(res.status).toBe(404)
            expect(res.body.success).toBe(false)
            expect(res.body.msg).toBe("User does not exists!")
        })

        it('should return 500 error if unexpected error occured', async () => {
            jest.spyOn(jwt, 'verify').mockImplementation(() => {
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

            const admin = await models.users.create(adminUser);

            token = createRefreshToken({id: admin.id});

            const res = await request(server).put(`/api/user/isAdmin/${user.id}`).set('Authorization', token).send({admin: true})

            expect(res.status).toBe(500)
            expect(res.body.success).toBe(false)
            expect(res.body.msg).toBeDefined()
        })
    })

    describe('Get User', () => {

        it('should return specific user information if it is admin', async () => {

            const User = {
                name: 'John Doe',
                password,
                email,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male'
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

            const admin = await models.users.create(adminUser);

            token = createRefreshToken({id: admin.id});

            const res = await request(server).get('/api/user/info').set('Authorization', token).set('id', user.id)

            expect(res.status).toBe(202)
            expect(res.body.user).toHaveProperty('name', User.name)
        })

        it('should return a 400 error if user is not exists', async () => {

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

            token = createRefreshToken({id: admin.id});

            const res = await request(server).get('/api/user/info').set('Authorization', token).set('id', 1)

            expect(res.status).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.msg).toBe("User does not exists!")
        })

        it('should return a 400 error if user is not exists', async () => {

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

            token = createRefreshToken({id: admin.id});

            const res = await request(server).get('/api/user/info').set('Authorization', token).set('id', '')

            expect(res.status).toBe(500)
            expect(res.body.success).toBe(false)
            expect(res.body.msg).toBeDefined()
        })
    })

    describe('Delete User', () => {
        
        it('should delete user if user is exist and deleted user is admin', async () => {

            const User = {
                name: 'John Doe',
                password,
                email,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male'
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

            const admin = await models.users.create(adminUser);

            token = createRefreshToken({id: admin.id});

            const res = await request(server).delete('/api/user/').set('Authorization', token).set('id', user.id)

            expect(res.status).toBe(202)
            expect(res.body.msg).toBe('Deleted Successfully')
            expect(res.body.user).toBeDefined()
        })

        it('should return a 500 error if unexpected error occurs', async () => {
            const User = {
                name: 'John Doe',
                password,
                email,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male'
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

            const admin = await models.users.create(adminUser);

            token = createRefreshToken({id: admin.id});

            const res = await request(server).delete('/api/user/').set('Authorization', token).set('id', 'user.id')

            expect(res.status).toBe(500)
            expect(res.body.msg).toBeDefined()
            expect(res.body.success).toBe(false)
        })
    })
})