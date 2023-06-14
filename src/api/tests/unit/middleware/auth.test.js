const isAuthenticated = require('../../../middlewares/auth');
const jwt = require('jsonwebtoken')
const model = require('../../../models')

const { Sequelize } = require('sequelize')

let sequelize;
let user;
let email

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

    beforeEach(async() => {
        email = 'john.doe@gmail.com'
        user = await model.users.create({
            name: 'John Doe',
            password: 'encryptedPassword',
            email,
            city: 'New York',
            dob: '1990-01-01',
            phone: '1234567890',
            gender: 'Male',
        })
    })

    afterEach(async () => {
        await model.users.destroy({
            where: {
                email
            }
        })
    })

    it('should return user if valid token is passed', async () => {

        const req = {
            header: jest.fn().mockReturnValue('valid_token')
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const next = jest.fn()

        jwt.verify = jest.fn((token, secret, callback) => {
            callback(null, user)
        })

        await isAuthenticated(req, res, next)

        expect(req.user).toEqual(user)
        expect(next).toHaveBeenCalled()
    })

    it('should return a 400 error if there is no token', async () => {
        const req = {
            header: jest.fn().mockReturnValue('')
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const next = jest.fn()

        await isAuthenticated(req, res, next)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: 'Please Login'})
        expect(next).not.toHaveBeenCalled()

    })

    it('should return a 400 error if the token is invalid', async () => {
        const req = {
            header: jest.fn().mockReturnValue('Invalid_token')
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const next = jest.fn()

        jwt.verify = jest.fn((token, secret, callback) => {
            callback('400, Invalid Authentication', null)
        })

        await isAuthenticated(req, res, next)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: '400, Invalid Authentication'})
        expect(next).not.toHaveBeenCalled()
    })

    it('should handle server error', async() => {
        const mockError = new Error('something went wrong')

        const req = {
            header: jest.fn().mockImplementation(() => {
                throw mockError;
            })
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const next = jest.fn()

        await isAuthenticated(req, res, next)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: mockError.message})
        expect(next).not.toHaveBeenCalled()
    })
})