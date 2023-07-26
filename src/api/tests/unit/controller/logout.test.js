const jwt = require('jsonwebtoken');
const UserController = require('../../../controllers/logout.controller');

describe('Logout API', () => {
  it('should logout the user successfully', async () => {
    const req = {
      header: jest.fn().mockReturnValue('valid_token')
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      clearCookie: jest.fn(),
    };

    const user = {
      id: 1,
      name: 'John Doe',
      password: 'encryptedPassword',
      email: 'john.doe@gmail.com',
      city: 'New York',
      dob: '1990-01-01',
      phone: '1234567890',
      gender: 'Male',
    }

    jwt.verify = jest.fn().mockResolvedValue(user);

    await UserController.logoutUser(req, res);

    expect(jwt.verify).toHaveBeenCalledWith('valid_token', process.env.JWT_SECRET);
    expect(res.clearCookie).toHaveBeenCalledWith('refresh_token', { path: '/', httpOnly: true });
    expect(res.status).toHaveBeenCalledWith(202);
    expect(res.json).toHaveBeenCalledWith({ success: true, msg: 'Logout Successfully' });
  });

  it('should return an error if token is missing', async () => {
    const req = {
      header: jest.fn().mockReturnValue(''),
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const user = {
      id: 1,
      name: 'John Doe',
      password: 'encryptedPassword',
      email: 'john.doe@gmail.com',
      city: 'New York',
      dob: '1990-01-01',
      phone: '1234567890',
      gender: 'Male',
    }

    jwt.verify = jest.fn().mockResolvedValue(user);

    await UserController.logoutUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, msg: 'Please Login' });
  });

  it('should return an error if token is invalid', async () => {
    const req = {
      header: jest.fn().mockReturnValue('Invalid_token'),
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    const user = {
      id: 1,
      name: 'John Doe',
      password: 'encryptedPassword',
      email: 'john.doe@gmail.com',
      city: 'New York',
      dob: '1990-01-01',
      phone: '1234567890',
      gender: 'Male',
    }

    jwt.verify = jest.fn().mockReturnValue(null);

    await UserController.logoutUser(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, msg: 'Unauthorized' });
  });

  it('should return an error if an exception occurs', async () => {

    const req = {
      header: jest.fn().mockReturnValue('valid Token'),
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    const user = {
      id: 1,
      name: 'John Doe',
      password: 'encryptedPassword',
      email: 'john.doe@gmail.com',
      city: 'New York',
      dob: '1990-01-01',
      phone: '1234567890',
      gender: 'Male',
    }

    jwt.verify = jest.fn().mockResolvedValue(user);

    await UserController.logoutUser(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ success: false, msg: 'res.clearCookie is not a function' });
  });
});
