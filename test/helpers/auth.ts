import { INestApplication } from '@nestjs/common';
import request from 'supertest';

// Logs in the test staff account via POST /staff-auth/login and returns the JWT.
export async function loginStaff(
  app: INestApplication,
  email: string,
  password: string,
): Promise<string> {
  const res = await request(app.getHttpServer())
    .post('/staff-auth/login')
    .send({ email, staff_password: password })
    .expect(201);
  return res.body.access_token as string;
}
