const bcrypt = require('bcrypt');
const controller = require('../../controllers/login.controller');
const models = require('../../models');
const createRefreshToken = require('../../../config/token');

const { Sequelize, DataTypes } = require('sequelize')
const User = require('../../models/user')

describe('Connect to User Data', () => {
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

    it('connect to database for user model', async () => {
        const UserModel = User(sequelize, DataTypes);

        await sequelize.sync({ force: false})

        const UniqueEmail = 'al.fahad7240@gmail.com'

        const userEmail = await UserModel.findOne({
            where: {
                email: UniqueEmail
            }
        })

        if(userEmail) {
            expect(UniqueEmail).toBe('al.fahad7240@gmail.com')
        }
        else{

            const user = await UserModel.create({
                name: 'Muhammad Al Fahad',
                password: '12345678',
                email: UniqueEmail,
                city: 'Multan, PK',
                dob: new Date('1990-01-01'),
                phone: '1234567890',
                gender: 'Male',
                admin: false
            })

            expect(user.id).toBeDefined();
            expect(user.name).toBe('Muhammad Al Fahad');
            expect(user.password).toBe('12345678');
            expect(user.email).toBe(UniqueEmail);
            expect(user.city).toBe('Multan, PK');
            expect(user.dob).toBe('1990-01-01');
            expect(user.phone).toBe('1234567890');
            expect(user.gender).toBe('Male');
            expect(user.admin).toBe(false);
            expect(user.created_at).toBeDefined();
            expect(user.updated_at).toBeDefined();
        }
    })
})

jest.mock('bcrypt');
jest.mock('../../models');
jest.mock('../../../config/token');

describe('Login API', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should login an existing user successfully', async () => {

    const req = {
      body: {
        email: 'al.fahad7240@gmail.com',
        password: '12345678'
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };

    const user = {
      id: 1,
      name: req.body.name,
      password: 'encryptedPassword',
      email: req.body.email,
      city: req.body.city,
      dob: req.body.dob,
      phone: req.body.phone,
      gender: req.body.gender,
    };

    models.users.findOne.mockResolvedValue(user);

    bcrypt.compare.mockResolvedValue('encryptedPassword');

    models.users.create.mockResolvedValue(user);

    createRefreshToken.mockReturnValue('refreshToken');

    await controller.loginUser(req, res);

    expect(models.users.findOne).toHaveBeenCalledWith({
      where: {
        email: req.body.email,
      },
    });
    expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, 'encryptedPassword');
    expect(createRefreshToken).toHaveBeenCalledWith({ id: user.id });
    expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refreshToken', { httpOnly: true });
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      msg: 'Login Successfully!',
      refresh_token: 'refreshToken',
      user: user,
    });
  });

  it('should return an error message if user is not exists', async () => {
    const req = {
        body: {
          email: 'john.doe@example.com',
          password: 'password123'
        },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      models.users.findOne.mockResolvedValue(null);

      await controller.loginUser(req, res);

      expect(models.users.findOne).toHaveBeenCalledWith({
        where: {
          email: req.body.email,
        },
      });
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ success: false, msg: "User does not exists. please signup to the system!"});
  })

  it('should return an error message if password did not match with hash password', async () => {
    const req = {
        body: {
          email: 'john.doe@example.com',
          password: 'password123'
        },
      };
  
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const user = {
        id: 1,
        name: req.body.name,
        password: 'encryptedPassword',
        email: req.body.email,
        city: req.body.city,
        dob: req.body.dob,
        phone: req.body.phone,
        gender: req.body.gender,
      };

      models.users.findOne.mockResolvedValue(user);

      bcrypt.compare.mockResolvedValue(false);

      await controller.loginUser(req, res);

      expect(models.users.findOne).toHaveBeenCalledWith({
        where: {
          email: req.body.email,
        },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, 'encryptedPassword');
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ success: false, msg: "Wrong Password, please try again!"});
  })

  it('should handle server error', async () => {

    const req = {
      body: {
        email: 'john.doe@example.com',
        password: 'password123'
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const mockError = new Error('something went wrong')

    models.users.findOne.mockRejectedValue(mockError);

    await controller.loginUser(req, res);

    expect(models.users.findOne).toHaveBeenCalledWith({
      where: {
        email: req.body.email,
      },
    });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, msg: mockError.message });
  });

});