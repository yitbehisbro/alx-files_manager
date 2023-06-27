const request = require('supertest');
const app = require('../app');

describe('GET /status', () => {
  it('should return a status of 200 and a response body with "OK"', async () => {
    const res = await request(app).get('/status');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('OK');
  });
});

describe('GET /stats', () => {
  it('should return a status of 200 and a response body with the number of users and files in the database', async () => {
    const res = await request(app).get('/stats');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('users');
    expect(res.body).toHaveProperty('files');
  });
});
