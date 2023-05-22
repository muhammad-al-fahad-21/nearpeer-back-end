const bcrypt = require('bcrypt');
const controller = require('../../controllers/signup.controller');
const models = require('../../models');
const validateEmail = require('../../../config/validation');
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

        const UniqueEmail = 'john.doe@example.com'

        const userEmail = await UserModel.findOne({
            where: {
                email: UniqueEmail
            }
        })

        if(userEmail) {
            expect(UniqueEmail).toBe('john.doe@example.com')
        }
        else{

            const user = await UserModel.create({
                name: 'John Doe',
                password: 'password123',
                email: UniqueEmail,
                city: 'Multan, PK',
                dob: new Date('1990-01-01'),
                phone: '1234567890',
                gender: 'Male',
                admin: false
            })

            expect(user.id).toBeDefined();
            expect(user.name).toBe('John Doe');
            expect(user.password).toBe('password123');
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
jest.mock('../../../config/validation');
jest.mock('../../../config/token');

describe('Signup API', () => {

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should signup a new user successfully', async () => {

    const req = {
      body: {
        name: 'John Doe',
        password: 'password123',
        email: 'john.doe@example.com',
        city: 'New York',
        dob: '1990-01-01',
        phone: '1234567890',
        gender: 'Male',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };

    validateEmail.mockReturnValue(true);

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

    models.users.findOne.mockResolvedValue(null);

    bcrypt.hash.mockResolvedValue('encryptedPassword');

    models.users.create.mockResolvedValue(user);

    createRefreshToken.mockReturnValue('refreshToken');

    await controller.signupUser(req, res);

    expect(validateEmail).toHaveBeenCalledWith(req.body.email);
    expect(models.users.findOne).toHaveBeenCalledWith({
      where: {
        email: req.body.email,
      },
    });
    expect(bcrypt.hash).toHaveBeenCalledWith(req.body.password, 12);
    expect(models.users.create).toHaveBeenCalledWith({
      name: req.body.name,
      password: 'encryptedPassword',
      email: req.body.email,
      city: req.body.city,
      dob: req.body.dob,
      phone: req.body.phone,
      gender: req.body.gender,
    });
    expect(createRefreshToken).toHaveBeenCalledWith({ id: user.id });
    expect(res.cookie).toHaveBeenCalledWith('refresh_token', 'refreshToken', { httpOnly: true });
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      msg: 'Signup Successfully',
      refresh_token: 'refreshToken',
      user: user,
    });
  });

  it('should handle invalid email', async () => {

    const req = {
      body: {
        name: 'John Doe',
        password: 'password123',
        email: 'alfahad7@g.com',
        city: 'New York',
        dob: '1990-01-01',
        phone: '1234567890',
        gender: 'Male',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    validateEmail.mockReturnValue(false);

    await controller.signupUser(req, res);

    expect(validateEmail).toHaveBeenCalledWith(req.body.email);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ status: false, msg: 'Invalid Email!' });
  });

  it('should handle existing email', async () => {

    const req = {
      body: {
        name: 'John Doe',
        password: 'password123',
        email: 'john.doe@example.com',
        city: 'New York',
        dob: '1990-01-01',
        phone: '1234567890',
        gender: 'Male',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    validateEmail.mockReturnValue(true);

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

    await controller.signupUser(req, res);

    expect(validateEmail).toHaveBeenCalledWith(req.body.email);
    expect(models.users.findOne).toHaveBeenCalledWith({
      where: {
        email: req.body.email,
      },
    });
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ status: false, msg: 'This email is already existed in the database, use another email!' });
  });

  it('should handle server error', async () => {

    const req = {
      body: {
        name: 'John Doe',
        password: 'password123',
        email: 'john.doe@example.com',
        city: 'New York',
        dob: '1990-01-01',
        phone: '1234567890',
        gender: 'Male',
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    validateEmail.mockReturnValue(true);

    const mockError = new Error('something went wrong')

    models.users.findOne.mockRejectedValue(mockError);

    await controller.signupUser(req, res);

    expect(validateEmail).toHaveBeenCalledWith(req.body.email);
    expect(models.users.findOne).toHaveBeenCalledWith({
      where: {
        email: req.body.email,
      },
    });
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, msg: mockError.message});
  });
});