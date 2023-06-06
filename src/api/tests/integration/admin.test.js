const request = require('supertest');
const models = require('../../models');
const createRefreshToken = require('../../../config/token')

const { Sequelize } = require('sequelize')

let sequelize;
let server;
let email;
let password;
let token;

jest.mock('bcrypt')

beforeAll( async () => {
    sequelize = new Sequelize({
        username: "muhammad-al-fahad",
        password: "12345678",
        database: "mern_test",
        host: "localhost",
        dialect: "postgres",
        logging: false
    })

    await sequelize.authenticate();
})

afterAll( async () => {
    await sequelize.close()
})

describe('admin middleware', () => {

    beforeEach(async () => {
        server = require('../../../index');
        email = 'abc@example.com'
        password = 'password123'
        token = 'invalidToken'
    })

    afterEach( async () => {
        await models.users.destroy({
            where: {
                email
            }
        })
        server.close();
    })

    describe('isAdmin', () => {
        it('should allow access for admin users', async () => {

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

            await models.users.create(adminUser);

            const user = await models.users.findOne({
                where: {
                    email: adminUser.email
                }
            })

            const token = createRefreshToken({id: user.id})

            const res = await request(server).get('/api/user/').set('Authorization', token)

            expect(res.status).toBe(202)
            expect(res.body.success).toBe(true)
            expect(res.body.user).toBeDefined()
        })

        it('should return 401 error if user is not admin', async () => {

            const adminUser = {
                name: 'John Doe',
                password,
                email,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male',
                admin: false
            }

            await models.users.create(adminUser);

            const user = await models.users.findOne({
                where: {
                    email: adminUser.email
                }
            })

            const token = createRefreshToken({id: user.id})

            const res = await request(server).get('/api/user/').set('Authorization', token)

            expect(res.status).toBe(401)
            expect(res.body.success).toBe(false)
            expect(res.body.user).not.toBeDefined()
        })

        it('should return 401 error if user is not admin', async () => {

            const adminUser = {
                name: 'John Doe',
                password,
                email,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male',
                admin: false
            }

            const user = await models.users.create(adminUser);

            token = createRefreshToken({id: user.id})

            const res = await request(server).get('/api/user/').set('Authorization', token)

            expect(res.status).toBe(401)
            expect(res.body.success).toBe(false)
            expect(res.body.user).not.toBeDefined()
        })

        it('should return a 500 error if an unexpected error occurs', async () => {
            const adminUser = {
                name: 'John Doe',
                password,
                email,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male',
                admin: false
            }

            await models.users.create(adminUser);

            const user = await models.users.findOne({
                where: {
                    email: adminUser.email
                }
            })

            const token = createRefreshToken({id: user.email})

            const response = await request(server).get('/api/user/').set('Authorization', token)
        

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.msg).toBeDefined();
        });
    })
})