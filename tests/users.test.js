const request = require('supertest');
const app = require('../app');
const dbClient = require('../utils/db');

describe('UsersController', () => {
  let user;
  let token;

  afterAll(async () => {
    await dbClient.users.deleteOne({ _id: user.id });
  });

  describe('POST /users', () => {
    it('should create a new user and return the user data', async () => {
      const res = await request(app)
        .post('/users')
        .send({ email: 'test@test.com', password: 'test' });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('email');
      user = res.body;
    });

    it('should return an error if the email already exists', async () => {
      const res = await request(app)
        .post('/users')
        .send({ email: 'test@test.com', password: 'test' });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: 'Already exist' });
    });

    it('should return an error if the email is missing', async () => {
      const res = await request(app)
        .post('/users')
        .send({ password: 'test' });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: 'Missing email' });
    });

    it('should return an error if the password is missing', async () => {
      const res = await request(app)
        .post('/users')
        .send({ email: 'test@test.com' });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: 'Missing password' });
    });
  });

  describe('GET /users/me', () => {
    beforeAll(async () => {
      const res = await request(app)
        .get('/connect')
        .auth('test@test.com', 'test');
      token = res.body.token;
    });

    it('should return the user data for the authenticated user', async () => {
      const res = await request(app)
        .get('/users/me')
        .set('X-Token', token);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual(user);
    });

    it('should return an error if the token is invalid', async () => {
      const res = await request(app)
        .get('/users/me')
        .set('X-Token', 'invalid');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ error: 'Unauthorized' });
    });
  });
});
