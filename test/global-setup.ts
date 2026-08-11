import { NestFactory } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env.qa') });

const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD',
  'TEST_STAFF_EMAIL',
  'TEST_STAFF_PASSWORD',
];
const missing = required.filter((k) => !process.env[k]);
if (missing.length > 0) {
  throw new Error(
    `Missing required env vars for e2e global setup: ${missing.join(', ')}. ` +
      'Copy .env.qa.example to .env.qa and fill in QA values.',
  );
}

const REQUIRED_PERMISSIONS = [
  'meal_item_view',
  'meal_item_change',
  'orders_view',
  'orders_change',
  'meal_package_add',
  'meal_package_view',
  'meal_package_change',
];

const ROLE_NAME = 'e2e-test-role';

export default async function globalSetup() {
  const prisma = new PrismaClient();
  try {
    const testEmail = process.env.TEST_STAFF_EMAIL!;
    const existing = await prisma.staff_credential.findUnique({
      where: { email: testEmail },
    });
    if (existing) {
      console.log(`[e2e global-setup] Test staff "${testEmail}" already exists. Skipping provisioning.`);
      return;
    }

    console.log(`[e2e global-setup] Provisioning test staff "${testEmail}"...`);
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    const app = moduleRef.createNestApplication();
    await app.init();
    try {
      const server = app.getHttpServer();

      // 1. Login as admin
      const adminLogin = await request(server)
        .post('/auth/login')
        .send({
          admin_username: process.env.ADMIN_USERNAME,
          admin_password: process.env.ADMIN_PASSWORD,
        })
        .expect(201);
      const adminToken = adminLogin.body.access_token;

      // 2. Find the required permission IDs in QA
      const permsRes = await request(server)
        .get('/role/permissions')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      const allPerms: { permission_id: number; permission_type: string }[] = permsRes.body;
      const permMap = new Map(allPerms.map((p) => [p.permission_type, p.permission_id]));
      const missing = REQUIRED_PERMISSIONS.filter((p) => !permMap.has(p));
      if (missing.length > 0) {
        throw new Error(
          `Required permissions missing in QA permission table: ${missing.join(', ')}. ` +
            'Seed them in QA before running e2e tests.',
        );
      }
      const permissionIds = REQUIRED_PERMISSIONS.map((p) => permMap.get(p)!);

      // 3. Find or create the e2e role
      const rolesRes = await request(server)
        .get('/role')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      const existingRole = rolesRes.body.find((r: { role: string }) => r.role === ROLE_NAME);
      let roleId: number;
      if (existingRole) {
        roleId = existingRole.role_id;
      } else {
        const roleRes = await request(server)
          .post('/role')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ role: ROLE_NAME, description: 'Auto-provisioned role for e2e tests' })
          .expect(201);
        roleId = roleRes.body.role_id;
      }

      // 4. Assign all required permissions to the role (service uses skipDuplicates)
      await request(server)
        .post(`/role/${roleId}/permissions`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ permissionIds })
        .expect(201);

      // 5. Create the test staff account with credential
      const staffRes = await request(server)
        .post('/staff')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          fname: 'E2E',
          lname: 'Tester',
          phone_number: '0000000000',
          status: 'active',
          email: testEmail,
          staff_password: process.env.TEST_STAFF_PASSWORD,
        })
        .expect(201);
      const staffId = staffRes.body.staff_id;

      // 6. Assign the role to the staff
      await request(server)
        .post(`/staff/${staffId}/role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ role_ids: [roleId] })
        .expect(201);

      console.log(`[e2e global-setup] Done. staff_id=${staffId}, role_id=${roleId}.`);
    } finally {
      await app.close();
    }
  } finally {
    await prisma.$disconnect();
  }
}
