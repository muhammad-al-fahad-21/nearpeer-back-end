const model = require('../../models')
const isAdmin = require('../../middlewares/authAdmin')

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

describe('admin middleware', () => {

    it('should return all users if it is admin', async () => {

        const req = {
            user: {
                id: 2
            }
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const next = jest.fn()

        const adminUser = {
            id: req.user.id,
            name: 'John Doe',
            password: 'encryptedPassword',
            email: 'john.doe@gmail.com',
            city: 'New York',
            dob: '1990-01-01',
            phone: '1234567890',
            gender: 'Male',
            admin: true
        }

        model.users.findOne = jest.fn().mockResolvedValue(adminUser)

        await isAdmin(req, res, next)

        expect(model.users.findOne).toHaveBeenCalledWith({
            where: {
                id: req.user.id
            }
        })

        expect(res.status).not.toHaveBeenCalledWith()
        expect(res.json).not.toHaveBeenCalledWith()
        expect(next).toHaveBeenCalledWith()
    })

    it('should return an error message if it is not admin', async () => {
        const req = {
            user: {
                id: 1
            }
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const next = jest.fn()

        const adminUser = {
            id: req.user.id,
            name: 'John Doe',
            password: 'encryptedPassword',
            email: 'john.doe@gmail.com',
            city: 'New York',
            dob: '1990-01-01',
            phone: '1234567890',
            gender: 'Male',
            admin: false
        }

        model.users.findOne = jest.fn().mockResolvedValue(adminUser)

        await isAdmin(req, res, next)

        expect(model.users.findOne).toHaveBeenCalledWith({
            where: {
                id: req.user.id
            }
        })

        expect(res.status).toHaveBeenCalledWith(401)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: "Admin resources access denied!"})
        expect(next).not.toHaveBeenCalled()
    })

    it('should handle server error', async () => {
        const req = {
            user: {
                id: 1
            }
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const next = jest.fn()

        const adminUser = new Error('something went wrong')

        model.users.findOne = jest.fn().mockRejectedValue(adminUser)

        await isAdmin(req, res, next)

        expect(model.users.findOne).toHaveBeenCalledWith({
            where: {
                id: req.user.id
            }
        })

        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: adminUser.message})
        expect(next).not.toHaveBeenCalled()
    })
})