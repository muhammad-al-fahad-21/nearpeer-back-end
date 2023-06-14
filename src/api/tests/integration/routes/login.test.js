const request = require('supertest');
const models = require('../../../models');
const bcrypt = require('bcrypt')

const { Sequelize } = require('sequelize')

let sequelize;
let server;
let email;
let password;

jest.mock('bcrypt')

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

describe('Login User', () => {

    beforeEach(() => {
        server = require('../../../../index');
        email = 'abc@example.com'
        password = 'password123'
    })

    afterEach( async () => {
        await models.users.destroy({
            where: {
                email: [email, 'example@gmail.com']
            }
        })
        await server.close();
    })

    describe('POST /login', () => {
        it('should login a user and return a success response', async () => {

            const userData = {
                email,
                password,
            };

            await models.users.create({
                name: 'John Doe',
                password,
                email,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male',
            })
    
            bcrypt.compare.mockResolvedValue(true)

            const res = await request(server).post('/api/login/').send(userData)
    
            expect(res.status).toBe(202)
            expect(res.body.success).toBe(true);
            expect(res.body.msg).toEqual("Login Successfully!")
            expect(res.body.refresh_token).toBeDefined()
            expect(res.body.user).toBeDefined()
        })

        it('should return 404 error if provided email does not exists', async () => {
            email = "invalid_email"

            const userData = {
                email,
                password,
            };

            await models.users.create({
                name: 'John Doe',
                password,
                email: "example@gmail.com",
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male',
            })
    
            bcrypt.compare.mockResolvedValue(true)

            const res = await request(server).post('/api/login/').send(userData)
    
            expect(res.status).toBe(404)
            expect(res.body.success).toBe(false);
            expect(res.body.msg).toEqual("User does not exists. please signup to the system!")
        })

        it('should return 401 error if provided email does not exists', async () => {

            const userData = {
                email,
                password,
            };

            await models.users.create({
                name: 'John Doe',
                password,
                email,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male',
            })
    
            bcrypt.compare.mockResolvedValue(false)

            const res = await request(server).post('/api/login/').send(userData)
    
            expect(res.status).toBe(401)
            expect(res.body.success).toBe(false);
            expect(res.body.msg).toEqual("Wrong Password, please try again!")
        })

        it('should return a 500 error if an unexpected error occurs', async () => {

            const response = await request(server).post('/api/login/').send({
                password
            });
        

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.msg).toBeDefined();
        });
    })
})