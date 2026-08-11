import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createTestApp } from './helpers/test-app';
import { loginStaff } from './helpers/auth';
import { createNoPermStaff, cleanupStaff } from './helpers/no-perm-staff';

describe('Order (e2e)', () => {
  let app: INestApplication;
  let token: string;
  let prisma: PrismaClient;

  beforeAll(async () => {
    app = await createTestApp();
    token = await loginStaff(app, process.env.TEST_STAFF_EMAIL!, process.env.TEST_STAFF_PASSWORD!);
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  describe('Auth', () => {
    it('returns 401 without a token', async () => {
      await request(app.getHttpServer()).get('/order').expect(401);
    });

    it('returns 401 with an invalid token', async () => {
      await request(app.getHttpServer())
        .get('/order')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);
    });

    it('returns 403 with insufficient permissions', async () => {
      const { staffId, email, password } = await createNoPermStaff(prisma, 'order');
      try {
        const noPermToken = await loginStaff(app, email, password);
        await request(app.getHttpServer())
          .get('/order')
          .set('Authorization', `Bearer ${noPermToken}`)
          .expect(403);
      } finally {
        await cleanupStaff(prisma, staffId);
      }
    });
  });

  describe('GET /order', () => {
    it('returns 200 and an array', async () => {
      const res = await request(app.getHttpServer())
        .get('/order')
        .set('Authorization', `Bearer ${token}`).expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('filters by order_status', async () => {
      const { customer, mealPlan, order } = await seedOrder(prisma, { order_status: 'e2e_status_3812' });
      try {
        const res = await request(app.getHttpServer())
          .get('/order').query({ order_status: 'e2e_status_3812' })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(res.body.some((o: { order_id: number }) => o.order_id === order.order_id)).toBe(true);
      } finally {
        await cleanupOrder(prisma, order.order_id, mealPlan.meal_id, customer.customer_id);
      }
    });

    it('filters by customer_id', async () => {
      const { customer, mealPlan, order } = await seedOrder(prisma);
      try {
        const res = await request(app.getHttpServer())
          .get('/order').query({ customer_id: customer.customer_id })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(res.body.some((o: { order_id: number }) => o.order_id === order.order_id)).toBe(true);
      } finally {
        await cleanupOrder(prisma, order.order_id, mealPlan.meal_id, customer.customer_id);
      }
    });

    it('filters by meal_id', async () => {
      const { customer, mealPlan, order } = await seedOrder(prisma);
      try {
        const res = await request(app.getHttpServer())
          .get('/order').query({ meal_id: mealPlan.meal_id })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(res.body.some((o: { order_id: number }) => o.order_id === order.order_id)).toBe(true);
      } finally {
        await cleanupOrder(prisma, order.order_id, mealPlan.meal_id, customer.customer_id);
      }
    });

    it('filters by delivery_person_id', async () => {
      const dp = await prisma.delivery_person.create({
        data: { rider_name: 'E2E DP 5566', phone_number: '0000000000' },
      });
      const { customer, mealPlan, order } = await seedOrder(prisma, { delivery_person_id: dp.delivery_person_id });
      try {
        const res = await request(app.getHttpServer())
          .get('/order').query({ delivery_person_id: dp.delivery_person_id })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(res.body.some((o: { order_id: number }) => o.order_id === order.order_id)).toBe(true);
      } finally {
        await cleanupOrder(prisma, order.order_id, mealPlan.meal_id, customer.customer_id, dp.delivery_person_id);
      }
    });

    it('filters by delivery_status', async () => {
      const { customer, mealPlan, order } = await seedOrder(prisma, { delivery_status: 'e2e_delivering_2244' });
      try {
        const res = await request(app.getHttpServer())
          .get('/order').query({ delivery_status: 'e2e_delivering_2244' })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(res.body.some((o: { order_id: number }) => o.order_id === order.order_id)).toBe(true);
      } finally {
        await cleanupOrder(prisma, order.order_id, mealPlan.meal_id, customer.customer_id);
      }
    });

    it('filters by is_a_subscribed_meal (true and false)', async () => {
      const { customer, mealPlan, order } = await seedOrder(prisma, { is_a_subscribed_meal: true });
      try {
        const resTrue = await request(app.getHttpServer())
          .get('/order').query({ is_a_subscribed_meal: 'true' })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(resTrue.body.some((o: { order_id: number }) => o.order_id === order.order_id)).toBe(true);

        const resFalse = await request(app.getHttpServer())
          .get('/order').query({ is_a_subscribed_meal: 'false' })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(resFalse.body.some((o: { order_id: number }) => o.order_id === order.order_id)).toBe(false);
      } finally {
        await cleanupOrder(prisma, order.order_id, mealPlan.meal_id, customer.customer_id);
      }
    });

    it('filters by offer_id', async () => {
      const offer = await prisma.offer.create({
        data: { coupon_number: 'E2E-8899', expiry_date: new Date(Date.now() + 86400000), usage_limit: 100, min_order_value: 0, title: 'E2E Offer', description: 'test', amount: 10 },
      });
      const { customer, mealPlan, order } = await seedOrder(prisma, { offer_id: offer.offer_id });
      try {
        const res = await request(app.getHttpServer())
          .get('/order').query({ offer_id: offer.offer_id })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(res.body.some((o: { order_id: number }) => o.order_id === order.order_id)).toBe(true);
      } finally {
        await cleanupOrder(prisma, order.order_id, mealPlan.meal_id, customer.customer_id, undefined, offer.offer_id);
      }
    });

    it('applies multiple filters combined', async () => {
      const { customer, mealPlan, order } = await seedOrder(prisma, { order_status: 'e2e_multi_6677', delivery_status: 'e2e_multi_del' });
      try {
        const res = await request(app.getHttpServer())
          .get('/order').query({ order_status: 'e2e_multi_6677', delivery_status: 'e2e_multi_del', customer_id: customer.customer_id })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(res.body.some((o: { order_id: number }) => o.order_id === order.order_id)).toBe(true);

        const resExcluded = await request(app.getHttpServer())
          .get('/order').query({ order_status: 'e2e_multi_6677', delivery_status: 'wrong_status' })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(resExcluded.body.some((o: { order_id: number }) => o.order_id === order.order_id)).toBe(false);
      } finally {
        await cleanupOrder(prisma, order.order_id, mealPlan.meal_id, customer.customer_id);
      }
    });

    it('returns 400 for non-numeric customer_id', async () => {
      await request(app.getHttpServer())
        .get('/order').query({ customer_id: 'abc' })
        .set('Authorization', `Bearer ${token}`).expect(400);
    });
  });

  describe('PATCH /order/:id', () => {
    it('updates order_status', async () => {
      const { customer, mealPlan, order } = await seedOrder(prisma, { order_status: 'pending' });
      try {
        const res = await request(app.getHttpServer())
          .patch(`/order/${order.order_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ order_status: 'confirmed_e2e_5523' }).expect(200);
        expect(res.body.order_id).toBe(order.order_id);
        expect(res.body.order_status).toBe('confirmed_e2e_5523');
      } finally {
        await cleanupOrder(prisma, order.order_id, mealPlan.meal_id, customer.customer_id);
      }
    });

    it('updates payment_status and delivery_status', async () => {
      const { customer, mealPlan, order } = await seedOrder(prisma);
      try {
        const res = await request(app.getHttpServer())
          .patch(`/order/${order.order_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ payment_status: 'paid_e2e', delivery_status: 'delivered_e2e' }).expect(200);
        expect(res.body.payment_status).toBe('paid_e2e');
        expect(res.body.delivery_status).toBe('delivered_e2e');
      } finally {
        await cleanupOrder(prisma, order.order_id, mealPlan.meal_id, customer.customer_id);
      }
    });

    it('updates delivery_person_id', async () => {
      const dp = await prisma.delivery_person.create({
        data: { rider_name: 'E2E PatchDP 4411', phone_number: '0000000000' },
      });
      const { customer, mealPlan, order } = await seedOrder(prisma);
      try {
        const res = await request(app.getHttpServer())
          .patch(`/order/${order.order_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ delivery_person_id: dp.delivery_person_id }).expect(200);
        expect(res.body.delivery_person_id).toBe(dp.delivery_person_id);
      } finally {
        await cleanupOrder(prisma, order.order_id, mealPlan.meal_id, customer.customer_id, dp.delivery_person_id);
      }
    });

    it('updates is_a_subscribed_meal', async () => {
      const { customer, mealPlan, order } = await seedOrder(prisma, { is_a_subscribed_meal: false });
      try {
        const res = await request(app.getHttpServer())
          .patch(`/order/${order.order_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ is_a_subscribed_meal: true }).expect(200);
        expect(res.body.is_a_subscribed_meal).toBe(true);
      } finally {
        await cleanupOrder(prisma, order.order_id, mealPlan.meal_id, customer.customer_id);
      }
    });

    it('returns 400 for non-existent delivery_person_id (FK violation)', async () => {
      const { customer, mealPlan, order } = await seedOrder(prisma);
      try {
        const res = await request(app.getHttpServer())
          .patch(`/order/${order.order_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ delivery_person_id: 999999999 }).expect(400);
        expect(res.body.message).toContain('referenced records not found');
      } finally {
        await cleanupOrder(prisma, order.order_id, mealPlan.meal_id, customer.customer_id);
      }
    });

    it('returns 400 for non-existent offer_id (FK violation)', async () => {
      const { customer, mealPlan, order } = await seedOrder(prisma);
      try {
        const res = await request(app.getHttpServer())
          .patch(`/order/${order.order_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ offer_id: 999999999 }).expect(400);
        expect(res.body.message).toContain('referenced records not found');
      } finally {
        await cleanupOrder(prisma, order.order_id, mealPlan.meal_id, customer.customer_id);
      }
    });

    it('empty body returns 200 with unchanged row', async () => {
      const { customer, mealPlan, order } = await seedOrder(prisma, { order_status: 'e2e_empty_1100', payment_status: 'e2e_pay' });
      try {
        const res = await request(app.getHttpServer())
          .patch(`/order/${order.order_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({}).expect(200);
        expect(res.body.order_id).toBe(order.order_id);
        expect(res.body.order_status).toBe('e2e_empty_1100');
        expect(res.body.payment_status).toBe('e2e_pay');
      } finally {
        await cleanupOrder(prisma, order.order_id, mealPlan.meal_id, customer.customer_id);
      }
    });

    it('returns 404 for a non-existent id', async () => {
      await request(app.getHttpServer())
        .patch('/order/999999999')
        .set('Authorization', `Bearer ${token}`)
        .send({ order_status: 'nope' }).expect(404);
    });

    it('returns 400 for non-numeric id', async () => {
      await request(app.getHttpServer())
        .patch('/order/abc')
        .set('Authorization', `Bearer ${token}`)
        .send({ order_status: 'nope' }).expect(400);
    });
  });
});

async function seedOrder(
  prisma: PrismaClient,
  overrides: Partial<{
    order_status: string; payment_status: string; delivery_status: string;
    is_a_subscribed_meal: boolean; delivery_person_id: number; offer_id: number;
  }> = {},
) {
  const customer = await prisma.customer.create({
    data: { fname: 'E2E', lname: 'Test', phone_number: '0000000000' },
  });
  const mealPlan = await prisma.meal_plan.create({
    data: { item_name: 'E2E Order Prereq MP', category: 'test', description: 'test', dietary_preference: 'none', price: 10 },
  });
  const order = await prisma.customer_order.create({
    data: {
      customer_id: customer.customer_id,
      meal_id: mealPlan.meal_id,
      order_status: overrides.order_status ?? 'pending',
      payment_status: overrides.payment_status ?? 'unpaid',
      delivery_status: overrides.delivery_status ?? 'pending',
      delivery_preferred_date: new Date(),
      is_a_subscribed_meal: overrides.is_a_subscribed_meal ?? false,
      ...(overrides.delivery_person_id && { delivery_person_id: overrides.delivery_person_id }),
      ...(overrides.offer_id && { offer_id: overrides.offer_id }),
    },
  });
  return { customer, mealPlan, order };
}

async function cleanupOrder(
  prisma: PrismaClient,
  orderId: number,
  mealPlanId: number,
  customerId: number,
  deliveryPersonId?: number,
  offerId?: number,
) {
  await prisma.customer_order.deleteMany({ where: { order_id: orderId } });
  if (deliveryPersonId) await prisma.delivery_person.deleteMany({ where: { delivery_person_id: deliveryPersonId } });
  if (offerId) await prisma.offer.deleteMany({ where: { offer_id: offerId } });
  await prisma.meal_plan.deleteMany({ where: { meal_id: mealPlanId } });
  await prisma.customer.deleteMany({ where: { customer_id: customerId } });
}
