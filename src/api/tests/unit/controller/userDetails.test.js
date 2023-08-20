const bcrypt = require('bcrypt');
const controller = require('../../../controllers/userDetails.controller');
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


describe('Get All Users', () => {

    it('should return all users available in the system', async () => {
        const req = {}

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
    
        const users = [
            {
                id: 1,
                name: 'Muhammad Al Fahad',
                password: 'encryptedPassword',
                email: 'al.fahad7240@gmail.com',
                city: 'Multan, PK',
                dob: '1998-05-21',
                phone: '032333668477',
                gender: 'Male',
            },
            {
                id: 2,
                name: 'John Doe',
                password: 'encryptedPassword123',
                email: 'john.doe@gmail.com',
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'Male',
            }  
        ];

        models.users.findAll = jest.fn().mockResolvedValue(users)

        await controller.getAllUsers(req, res)

        expect(models.users.findAll).toHaveBeenCalledWith()

        expect(res.status).toHaveBeenCalledWith(202)

        expect(res.json).toHaveBeenCalledWith({success: true, users})
    })

    it('should handle server error', async () => {
        const req = {}

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const usersError = new Error('something went wrong')

        models.users.findAll = jest.fn().mockRejectedValue(usersError)

        await controller.getAllUsers(req, res)

        expect(models.users.findAll).toHaveBeenCalledWith()

        expect(res.status).toHaveBeenCalledWith(500)

        expect(res.json).toHaveBeenCalledWith({success: false, msg: usersError.message})
    })
})

describe('Update User Profile', () => {
    it('should update user data if user is authorized', async () => {
        const req = {
            body: {
                name: 'John Doe',
                password: 'password123',
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'Male'
            },
            user: {
                id: 1
            }
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        bcrypt.hash = jest.fn().mockResolvedValue('encryptedPassword')

        models.users.update = jest.fn().mockResolvedValue([1])

        await controller.updateProfile(req, res)

        expect(bcrypt.hash).toHaveBeenCalledWith(req.body.password, 12)

        expect(models.users.update).toHaveBeenCalledWith({
            name: req.body.name,
            password: 'encryptedPassword',
            city: req.body.city,
            dob: req.body.dob,
            phone: req.body.phone,
            gender: req.body.gender,
          }, {
            where: {
                id: req.user.id
            }
          });
        
        expect(res.status).toHaveBeenCalledWith(202)
        expect(res.json).toHaveBeenCalledWith({success: true, msg: 'Profile Updated!', user: [1]})
    })

    it('should handle server error', async () => {
        const req = {
            body: {
                name: 'John Doe',
                password: 'password123',
                city: 'New York',
                dob: '1990-01-01',
                phone: '1234567890',
                gender: 'Male'
            },
            user: {
                id: 1
            }
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockError = new Error('something went wrong')

        bcrypt.hash = jest.fn().mockResolvedValue('encryptedPassword')

        models.users.update = jest.fn().mockRejectedValue(mockError)

        await controller.updateProfile(req, res)

        expect(bcrypt.hash).toHaveBeenCalledWith(req.body.password, 12)

        expect(models.users.update).toHaveBeenCalledWith({
            name: req.body.name,
            password: 'encryptedPassword',
            city: req.body.city,
            dob: req.body.dob,
            phone: req.body.phone,
            gender: req.body.gender,
          }, {
            where: {
                id: req.user.id
            }
          });
        
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: mockError.message})
    })
})

describe('Update User Role', () => {
    it('should update user role if user is exists', async () => {
        const req = {
            body: {
                admin: true
            },
            params: {
                id: 2
            }
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

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

        models.users.findOne = jest.fn().mockResolvedValue(user)
        models.users.update = jest.fn().mockResolvedValue([1])

        await controller.isAdmin(req, res)

        expect(models.users.findOne).toHaveBeenCalledWith({
            where: {
                id: req.params.id
            }
        })

        expect(models.users.update).toHaveBeenCalledWith({
            admin: req.body.admin
          }, {
            where: {
                id: user.id
            }
          });
        
        expect(res.status).toHaveBeenCalledWith(202)
        expect(res.json).toHaveBeenCalledWith({success: true, msg: 'Role Updated!', user: [1]})
    })

    it('should return an error message if invalid id is passing to system', async () => {
        const req = {
            body: {
                admin: true
            },
            params: {
                id: null
            }
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        await controller.isAdmin(req, res)
        
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: "Inavlid user id!"})
    })

    it('should return an error message if user is not exists', async () => {
        const req = {
            body: {
                admin: true
            },
            params: {
                id: 2
            }
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        models.users.findOne = jest.fn().mockResolvedValue(null)

        await controller.isAdmin(req, res)

        expect(models.users.findOne).toHaveBeenCalledWith({
            where: {
                id: req.params.id
            }
        })
        
        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: "User does not exists!"})
    })


    it('should handle server error', async () => {
        const req = {
            body: {
                admin: true
            },
            params: {
                id: 2
            }
        }

        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

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

        const mockError = new Error('something went wrong')

        models.users.findOne = jest.fn().mockResolvedValue(user)
        models.users.update = jest.fn().mockRejectedValue(mockError)

        await controller.isAdmin(req, res)

        expect(models.users.findOne).toHaveBeenCalledWith({
            where: {
                id: req.params.id
            }
        })

        expect(models.users.update).toHaveBeenCalledWith({
            admin: req.body.admin
          }, {
            where: {
                id: user.id
            }
          });
        
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: mockError.message})
    })
})

describe('Get Specific User Information', () => {

    it('should return user information if user is exists', async () => {
        const req = {
            header: jest.fn().mockReturnValue('2')
        }
    
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
    
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
    
        models.users.findOne = jest.fn().mockResolvedValue(user)
    
        await controller.getUser(req, res)
    
        expect(req.header('id')).toBe('2')
    
        expect(models.users.findOne).toHaveBeenCalledWith({
            where: {
                id: '2'
            }
        })
        
        expect(res.status).toHaveBeenCalledWith(202)
        expect(res.json).toHaveBeenCalledWith({success: true, user: user})
    })

    it('should return an error message if user is not exists', async () => {
        const req = {
            header: jest.fn().mockReturnValue('2')
        }
    
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
    
        models.users.findOne = jest.fn().mockResolvedValue(null)
    
        await controller.getUser(req, res)
    
        expect(req.header('id')).toBe('2')
    
        expect(models.users.findOne).toHaveBeenCalledWith({
            where: {
                id: '2'
            }
        })
        
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: 'User does not exists!'})
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
    
        models.users.findOne = jest.fn().mockRejectedValue(mockError)
    
        await controller.getUser(req, res)
    
        expect(req.header('id')).toBe('2')
    
        expect(models.users.findOne).toHaveBeenCalledWith({
            where: {
                id: '2'
            }
        })
        
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: mockError.message})
    })
})

describe('Get Authorized User Profile', () => {

    it('should return user data if user is exists', async () => {
        const req = {
            user: {
                id: 2
            }
        }
    
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
    
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
    
        models.users.findOne = jest.fn().mockResolvedValue(user)
    
        await controller.getProfile(req, res)
    
        expect(models.users.findOne).toHaveBeenCalledWith({
            where: {
                id: req.user.id
            }
        })
        
        expect(res.status).toHaveBeenCalledWith(202)
        expect(res.json).toHaveBeenCalledWith({success: true, user: user})
    })

    it('should return an error message if user is not authorized', async () => {
        const req = {
            user: {
                id: 2
            }
        }
    
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
    
        models.users.findOne = jest.fn().mockResolvedValue(null)
    
        await controller.getProfile(req, res)
    
        expect(models.users.findOne).toHaveBeenCalledWith({
            where: {
                id: req.user.id
            }
        })
        
        expect(res.status).toHaveBeenCalledWith(404)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: 'Not Found!'})
    })

    it('should handle server error', async () => {
        const req = {
            user: {
                id: 2
            }
        }
    
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }

        const mockError = new Error('something went wrong')
    
        models.users.findOne = jest.fn().mockRejectedValue(mockError)
    
        await controller.getProfile(req, res)
    
        expect(models.users.findOne).toHaveBeenCalledWith({
            where: {
                id: req.user.id
            }
        })
        
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: mockError.message})
    })
})

describe(' Delete User Information by Admin', () => {

    it('should delete user if user is exists', async () => {
        const req = {
            header: jest.fn().mockReturnValue('2')
        }
    
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        }
    
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
    
        models.users.destroy = jest.fn().mockResolvedValue(user)
    
        await controller.deleteUser(req, res)
    
        expect(req.header('id')).toBe('2')
    
        expect(models.users.destroy).toHaveBeenCalledWith({
            where: {
                id: '2'
            }
        })
        
        expect(res.status).toHaveBeenCalledWith(202)
        expect(res.json).toHaveBeenCalledWith({success: true, msg: 'Deleted Successfully', user: user})
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
    
        models.users.destroy = jest.fn().mockRejectedValue(mockError)
    
        await controller.deleteUser(req, res)
    
        expect(req.header('id')).toBe('2')
    
        expect(models.users.destroy).toHaveBeenCalledWith({
            where: {
                id: '2'
            }
        })
        
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({success: false, msg: mockError.message})
    })
})