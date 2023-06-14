const request = require('supertest');
const models = require('../../../models');
const createRefreshToken = require('../../../../config/token')
const jwt = require('jsonwebtoken')

const { Sequelize } = require('sequelize')

let sequelize;
let server;
let email;
let password;
let token;

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

describe('auth middleware', () => {

    beforeEach(async () => {
        server = require('../../../../index');
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
        await server.close();
    })

    describe('isAuth', () => {
        it('should allow access for authenticated users', async () => {

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

            const res = await request(server).get('/api/user/profile').set('Authorization', token)

            expect(res.status).toBe(202)
            expect(res.body.success).toBe(true)
            expect(res.body.user).toBeDefined()
        })

        it('should return 400 erorr if token is not provided', async () => {
            token = ''

            const res = await request(server).get('/api/user/profile').set('Authorization', token)

            expect(res.status).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.msg).toBe('Please Login')
        })

        it('should return 400 error if invalid token is passed', async () => {

            const res = await request(server).get('/api/user/profile').set('Authorization', token)

            expect(res.status).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.msg).toBe('400, Invalid Authentication')
        })

        it('should return a 500 error if an unexpected error occurs', async () => {

            jest.spyOn(jwt, 'verify').mockImplementation((token, secret, callback) => {
              throw new Error('something went wrong');
            });

            const res = await request(server).get('/api/user/profile').set('Authorization', token);

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.msg).toBeDefined();
        });
    })
})