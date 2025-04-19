const request = require('supertest');
const app = require('../index');
const db = require('../db');

jest.mock('../db', () => ({
  query: jest.fn(),
  promise: jest.fn().mockReturnThis(),
}));

describe('API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/register - success', async () => {
    db.query.mockImplementation((sql, params, callback) => {
      callback(null, { affectedRows: 1 });
    });

    const res = await request(app)
      .post('/api/register')
      .send({ username: 'test', email: 'test@test.com', password: 'password' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message');
  });

  test('GET /api/disciplines - success', async () => {
    const mockData = [
      { id: 1, name: 'Football', description: 'Team sport' }
    ];
    
    db.query
      .mockImplementationOnce((sql, callback) => {
        callback(null, [{ count: 1 }]);
      })
      .mockImplementationOnce((sql, params, callback) => {
        callback(null, mockData);
      });

    const res = await request(app)
      .get('/api/disciplines?page=1&limit=10');

    expect(res.statusCode).toEqual(200);
    expect(res.body.data).toEqual(mockData);
  });

  test('POST /api/login - invalid credentials', async () => {
    db.query.mockImplementation((sql, params, callback) => {
      callback(null, []);
    });

    const res = await request(app)
      .post('/api/login')
      .send({ username: 'wrong', password: 'wrong' });

    expect(res.statusCode).toEqual(400);
  });
});