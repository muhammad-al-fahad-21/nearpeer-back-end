const isAuthenticated = require('../../middlewares/auth');
const jwt = require('jsonwebtoken')

const { Sequelize } = require('sequelize')

let sequelize;

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

describe('auth middleware', () => {

    it('should return user if valid token is passed', () => {

        const req = {
            header: jest.fn().mockReturnValue('valid_token')
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const next = jest.fn()

        const user = {
            id: 2,
            name: 'John Doe',
            password: 'encryptedPassword',
            email: 'john.doe@gmail.com',
            city: 'New York',
            dob: '1990-01-01',
            phone: '1234567890',
            gender: 'Male',
        }

        jwt.verify = jest.fn((token, secret, callback) => {
            callback(null, user)
        })

        isAuthenticated(req, res, next)

        expect(req.user).toEqual(user)
        expect(next).toHaveBeenCalled()
    })

    it('should return a 400 error if there is no token', () => {
        const req = {
            header: jest.fn().mockReturnValue('')
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const next = jest.fn()

        isAuthenticated(req, res, next)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: 'Please Login'})
        expect(next).not.toHaveBeenCalled()

    })

    it('should return a 400 error if the token is invalid', () => {
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

        isAuthenticated(req, res, next)

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: '400, Invalid Authentication'})
        expect(next).not.toHaveBeenCalled()
    })

    it('should handle server error', () => {
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

        isAuthenticated(req, res, next)

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: mockError.message})
        expect(next).not.toHaveBeenCalled()
    })
})