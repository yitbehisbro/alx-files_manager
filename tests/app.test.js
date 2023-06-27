const request = require('supertest');
const app = require('../app');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

describe('AppController', () => {
  describe('GET /status', () => {
    it('should return the status of Redis and the database', async () => {
      const res = await request(app).get('/status');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        redis: redisClient.isAlive(),
        db: dbClient.isAlive(),
      });
    });
  });

  describe('GET /stats', () => {
    it('should return the number of users and files in the database', async () => {
      const res = await request(app).get('/stats');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({
        users: await dbClient.nbUsers(),
        files: await dbClient.nbFiles(),
      });
    });
  });
});

