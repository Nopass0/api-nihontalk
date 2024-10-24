import { describe, expect, it, beforeAll, afterAll } from 'bun:test';
import request from 'supertest';
import app from '../app';
import { setupTestDatabase, teardownTestDatabase } from './setup';

describe('Course API', () => {
  let token: string;
  let courseId: string;

  beforeAll(async () => {
    await setupTestDatabase();

    // Create test user and get token
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        login: 'testuser',
        password: 'password123',
      });

    token = loginRes.body.token;
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it('should create a course', async () => {
    const res = await request(app)
      .post('/api/admin/courses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Test Course',
        description: 'Test Description',
        level: 1,
        expReward: 100,
        tags: ['test'],
        modules: [],
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Test Course');
    courseId = res.body.id;
  });

  it('should enroll in a course', async () => {
    const res = await request(app)
      .post('/api/courses/enroll')
      .set('Authorization', `Bearer ${token}`)
      .send({
        courseId,
      });

    expect(res.status).toBe(201);
    expect(res.body.courseId).toBe(courseId);
  });
});