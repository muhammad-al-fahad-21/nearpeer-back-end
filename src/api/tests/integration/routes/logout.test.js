const request = require('supertest');
const { Sequelize } = require('sequelize');
const models = require('../../../models');
const createRefreshToken = require('../../../../config/token');
const jwt = require('jsonwebtoken')

let sequelize;
let server;

beforeAll(async () => {
  sequelize = new Sequelize({
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
  });

  await sequelize.authenticate();
});

afterAll(async () => {
  await sequelize.close();
});

describe('Logout User', () => {
  beforeEach(() => {
    server = require('../../../../index');
  });

  afterEach(async () => {
    await models.users.destroy({
      where: {
        email: 'abc@example.com',
      },
    });
    await server.close()
  });

  describe('POST /logout', () => {
    it('should logout a user and return a success response', async () => {
      const user = await models.users.create({
        name: 'John Doe',
        password: 'password123',
        email: 'abc@example.com',
        city: 'New York',
        dob: '1990-01-01',
        phone: '1234567890',
        gender: 'male',
      });

      const token = createRefreshToken({ id: user.id});

      const response = await request(server).post('/api/logout/').set('Authorization', token);

      expect(response.status).toBe(202);
      expect(response.body.success).toBe(true);
      expect(response.body.msg).toBe('Logout Successfully');
    });

    it('should handle internal server errors', async () => {
        jest.spyOn(jwt, 'verify').mockImplementation((token, secret, callback) => {
            throw new Error('something went wrong')
        })
      const user = await models.users.create({
        name: 'John Doe',
        password: 'password123',
        email: 'abc@example.com',
        city: 'New York',
        dob: '1990-01-01',
        phone: '1234567890',
        gender: 'male',
      });

      const token = createRefreshToken({ id: user.id });

      const response = await request(server)
        .post('/api/logout/')
        .set('Authorization', token);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ success: false, msg: 'something went wrong'});
    });
  });
});
