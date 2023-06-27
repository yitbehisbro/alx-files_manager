const request = require('supertest');
const app = require('../app');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

describe('AuthController', () => {
  let user;
  let token;

  beforeAll(async () => {
    user = await dbClient.users.insertOne({
      email: 'test@test.com',
      password: 'test',
    });
  });

  afterAll(async () => {
    await dbClient.users.deleteOne({ _id: user.insertedId });
  });

  describe('GET /connect', () => {
    it('should sign in the user and return a token', async () => {
      const res = await request(app)
        .get('/connect')
        .auth('test@test.com', 'test');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      token = res.body.token;
    });

    it('should return an error if the credentials are invalid', async () => {
      const res = await request(app)
        .get('/connect')
        .auth('invalid@test.com', 'invalid');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ error: 'Unauthorized' });
    });
  });

  describe('GET /disconnect', () => {
    it('should sign out the user and delete the token', async () => {
      const res = await request(app)
        .get('/disconnect')
        .set('X-Token', token);
      expect(res.statusCode).toEqual(204);
      const redisToken = await redisClient.get(`auth_${token}`);
      expect(redisToken).toBeNull();
    });

    it('should return an error if the token is invalid', async () => {
      const res = await request(app)
        .get('/disconnect')
        .set('X-Token', 'invalid');
      expect(res.statusCode).toEqual(401);
      expect(res.body).toEqual({ error: 'Unauthorized' });
    });
  });
});
