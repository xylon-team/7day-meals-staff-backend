import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { PrismaService } from '../prisma/prisma.service';
import { AdminJwtStrategy } from '../admin-auth/strategies/admin-jwt.strategy';

describe('Customer HTTP endpoints', () => {
  let app: INestApplication;
  const secret = 'customer-endpoint-test-secret';
  const jwt = new JwtService({ secret });
  const service = { findAll: jest.fn() };
  const admin = { findUnique: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    admin.findUnique.mockResolvedValue({ admin_id: 1 });
    const module = await Test.createTestingModule({
      controllers: [CustomerController],
      providers: [
        AdminJwtStrategy,
        { provide: CustomerService, useValue: service },
        { provide: PrismaService, useValue: { admin } },
        { provide: ConfigService, useValue: { get: () => secret } },
      ],
    }).compile();
    app = module.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  // ============= Customer Directory Authorization =============
  it('returns the directory for an authenticated admin', async () => {
    const records = [
      { customer_id: 1, credential: { email: 'user@example.com' } },
    ];
    service.findAll.mockResolvedValue(records);
    await request(app.getHttpServer())
      .get('/customer')
      .auth(jwt.sign({ sub: 1 }), { type: 'bearer' })
      .expect(200)
      .expect(records);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it.each(['missing', 'invalid', 'expired', 'unknown admin'])(
    'rejects %s authentication before reading customer data',
    async (authentication) => {
      const call = request(app.getHttpServer()).get('/customer');
      if (authentication === 'invalid')
        call.auth('invalid', { type: 'bearer' });
      if (authentication === 'expired') {
        call.auth(jwt.sign({ sub: 1 }, { expiresIn: -1 }), { type: 'bearer' });
      }
      if (authentication === 'unknown admin') {
        admin.findUnique.mockResolvedValue(null);
        call.auth(jwt.sign({ sub: 999 }), { type: 'bearer' });
      }
      await call.expect(401);
      expect(service.findAll).not.toHaveBeenCalled();
    },
  );
});
