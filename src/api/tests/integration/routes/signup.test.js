const request = require('supertest');
const models = require('../../../models');

const { Sequelize } = require('sequelize')

let sequelize;
let server;
let email;

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

describe('signup a new user', () => {

    beforeEach(async () => {
        server = require('../../../../index');
        email = 'gameofpass@example.com'
    })

    afterEach( async () => {
        await models.users.destroy({
            where: {
                email
            }
        })
        await server.close();
    })

    describe('POST /signup', () => {
        it('should create a new user and return a success response', async () => {
            email = 'somehow@example.com' 

            const userData = {
                name: 'John Doe',
                password: 'password123',
                email,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male',
            };
    
            const res = await request(server).post('/api/signup/').send(userData)
    
            expect(res.status).toBe(202)
            expect(res.body.success).toBe(true);
            expect(res.body.msg).toEqual("Signup Successfully")
            expect(res.body.refresh_token).toBeDefined()
            expect(res.body.user).toBeDefined()

            const user = await models.users.findOne({
                where: {
                    email: userData.email
                }
            })

            expect(user).toBeDefined()
            expect(user.name).toBe(userData.name)
            expect(user.email).toBe(userData.email)
        })

        it('should return a 400 error if invalid email is provided', async () => {
            email = 'invalid email' 

            const userData = {
                name: 'John Doe',
                password: 'password123',
                email,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male',
            };

            const res = await request(server).post('/api/signup/').send(userData)

            expect(res.status).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.msg).toBe("Invalid Email!")
        })

        it('should return a 400 error if is already exists', async () => {
            email = 'somehow@example.com'

            const existingUser = {
                name: 'John Doe',
                password: 'password123',
                email,
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'male',
            };

            await models.users.create(existingUser)

            const newUser = {
                name: 'Al Fahad',
                password: 'password',
                email,
                city: 'Multan, PK',
                dob: '1998-05-21',
                phone: '123490',
                gender: 'male',
            };

            const res = await request(server).post('/api/signup/').send(newUser)

            expect(res.status).toBe(400)
            expect(res.body.success).toBe(false)
            expect(res.body.msg).toBe("This email is already existed in the database, use another email!")
        })

        it('should return a 500 error if an unexpected error occurs', async () => {

            const response = await request(server).post('/api/signup/').send({
                email
            });
        

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
            expect(response.body.msg).toBeDefined();
        });
    })
})