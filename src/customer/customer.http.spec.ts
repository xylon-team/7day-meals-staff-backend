import { Server } from 'node:http';
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
  const customer = { findUnique: jest.fn() };
  const profileService = new CustomerService({
    customer,
  } as unknown as PrismaService);
  const service = { findAll: jest.fn(), findOne: jest.fn() };
  const admin = { findUnique: jest.fn() };

  beforeEach(async () => {
    jest.resetAllMocks();
    admin.findUnique.mockResolvedValue({ admin_id: 1 });
    // Use the real profile service so HTTP tests cover validation and lookup together.
    service.findOne.mockImplementation((id: number) =>
      profileService.findOne(id),
    );
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
    await request(app.getHttpServer() as Server)
      .get('/customer')
      .auth(jwt.sign({ sub: 1 }), { type: 'bearer' })
      .expect(200)
      .expect(records);
    expect(service.findAll).toHaveBeenCalledTimes(1);
  });

  it.each(['missing', 'invalid', 'expired', 'unknown admin'])(
    'rejects %s authentication before reading customer data',
    async (authentication) => {
      const call = request(app.getHttpServer() as Server).get('/customer');
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

  // ============= Customer Profile HTTP Behavior =============
  it('returns the requested profile for an authenticated admin', async () => {
    const profile = {
      customer_id: 12,
      address_line_2: null,
      credential: { email: 'user@example.com' },
    };
    customer.findUnique.mockResolvedValue(profile);
    await request(app.getHttpServer() as Server)
      .get('/customer/12')
      .auth(jwt.sign({ sub: 1 }), { type: 'bearer' })
      .expect(200)
      .expect(profile);
    expect(service.findOne).toHaveBeenCalledWith(12);
    expect(customer.findUnique).toHaveBeenCalledWith({
      where: { customer_id: 12 },
      include: { credential: { select: { email: true } } },
    });
  });

  it.each(['abc', '1.5', '0', '-1', '2147483648', '1e2'])(
    'returns 400 for invalid customer ID %s without querying Prisma',
    async (id) => {
      await request(app.getHttpServer() as Server)
        .get(`/customer/${id}`)
        .auth(jwt.sign({ sub: 1 }), { type: 'bearer' })
        .expect(400);
      expect(customer.findUnique).not.toHaveBeenCalled();
    },
  );

  it('returns 404 for an unknown customer', async () => {
    customer.findUnique.mockResolvedValue(null);
    await request(app.getHttpServer() as Server)
      .get('/customer/999')
      .auth(jwt.sign({ sub: 1 }), { type: 'bearer' })
      .expect(404);
  });

  it.each(['missing', 'invalid', 'expired', 'unknown admin'])(
    'rejects %s authentication before reading a profile',
    async (authentication) => {
      const call = request(app.getHttpServer() as Server).get('/customer/12');
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
      expect(service.findOne).not.toHaveBeenCalled();
      expect(customer.findUnique).not.toHaveBeenCalled();
    },
  );
});
