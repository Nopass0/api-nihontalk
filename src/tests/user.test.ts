import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import request from 'supertest';
import app from '../app';
import { setupTestDatabase, teardownTestDatabase } from './setup';

describe('User API', () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        login: 'testuser',
        password: 'password123',
        name: 'Test User',
        birthdate: '1990-01-01',
        email: 'test@example.com',
      });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.token).toBeDefined();
  });

  it('should login user', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        login: 'testuser',
        password: 'password123',
      });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });
});