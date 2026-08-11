import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createTestApp } from './helpers/test-app';
import { loginStaff } from './helpers/auth';
import { createNoPermStaff, cleanupStaff } from './helpers/no-perm-staff';

describe('MealPlan (e2e)', () => {
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
      await request(app.getHttpServer()).get('/meal-plan').expect(401);
    });

    it('returns 401 with an invalid token', async () => {
      await request(app.getHttpServer())
        .get('/meal-plan')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);
    });

    it('returns 403 with insufficient permissions', async () => {
      const { staffId, email, password } = await createNoPermStaff(prisma, 'mealplan');
      try {
        const noPermToken = await loginStaff(app, email, password);
        await request(app.getHttpServer())
          .get('/meal-plan')
          .set('Authorization', `Bearer ${noPermToken}`)
          .expect(403);
      } finally {
        await cleanupStaff(prisma, staffId);
      }
    });
  });

  describe('POST /meal-plan', () => {
    it('creates a meal plan with food items', async () => {
      const fi1 = await prisma.food_item.create({
        data: { item_name: 'E2E MP Create FI1 4412', ingredient_list: 'test', price: 5 },
      });
      const fi2 = await prisma.food_item.create({
        data: { item_name: 'E2E MP Create FI2 4412', ingredient_list: 'test', price: 5 },
      });
      let mealPlanId: number | undefined;
      try {
        const res = await request(app.getHttpServer())
          .post('/meal-plan')
          .set('Authorization', `Bearer ${token}`)
          .send({
            mealPlan: { item_name: 'E2E Create MP 4412', category: 'test', description: 'e2e create', dietary_preference: 'none', price: 30 },
            foodItems: [
              { meal_id: 0, food_item_id: fi1.food_item_id, day: 'Monday', meal_type: 'breakfast' },
              { meal_id: 0, food_item_id: fi2.food_item_id, day: 'Tuesday', meal_type: 'lunch' },
            ],
          }).expect(201);
        mealPlanId = res.body.meal_id;
        expect(res.body.meal_id).toBeDefined();
        expect(res.body.item_name).toBe('E2E Create MP 4412');
        expect(res.body.food_items).toHaveLength(2);
      } finally {
        if (mealPlanId) {
          await prisma.meal_plan_food_item.deleteMany({ where: { meal_id: mealPlanId } });
          await prisma.meal_plan.delete({ where: { meal_id: mealPlanId } });
        }
        await prisma.food_item.deleteMany({ where: { food_item_id: { in: [fi1.food_item_id, fi2.food_item_id] } } });
      }
    });

    it('creates a meal plan without foodItems (optional)', async () => {
      let mealPlanId: number | undefined;
      try {
        const res = await request(app.getHttpServer())
          .post('/meal-plan')
          .set('Authorization', `Bearer ${token}`)
          .send({
            mealPlan: { item_name: 'E2E NoFI 5566', category: 'test', description: 'no food items', dietary_preference: 'none', price: 15 },
          }).expect(201);
        mealPlanId = res.body.meal_id;
        expect(res.body.meal_id).toBeDefined();
        expect(res.body.food_items).toHaveLength(0);
      } finally {
        if (mealPlanId) {
          await prisma.meal_plan_food_item.deleteMany({ where: { meal_id: mealPlanId } });
          await prisma.meal_plan.delete({ where: { meal_id: mealPlanId } });
        }
      }
    });

    it('creates a meal plan with empty foodItems array', async () => {
      let mealPlanId: number | undefined;
      try {
        const res = await request(app.getHttpServer())
          .post('/meal-plan')
          .set('Authorization', `Bearer ${token}`)
          .send({
            mealPlan: { item_name: 'E2E EmptyFI 7788', category: 'test', description: 'empty food items', dietary_preference: 'none', price: 15 },
            foodItems: [],
          }).expect(201);
        mealPlanId = res.body.meal_id;
        expect(res.body.meal_id).toBeDefined();
        expect(res.body.food_items).toHaveLength(0);
      } finally {
        if (mealPlanId) {
          await prisma.meal_plan_food_item.deleteMany({ where: { meal_id: mealPlanId } });
          await prisma.meal_plan.delete({ where: { meal_id: mealPlanId } });
        }
      }
    });

    it('is_available defaults to true when omitted', async () => {
      let mealPlanId: number | undefined;
      try {
        const res = await request(app.getHttpServer())
          .post('/meal-plan')
          .set('Authorization', `Bearer ${token}`)
          .send({
            mealPlan: { item_name: 'E2E DefaultAvail 9900', category: 'test', description: 'default avail', dietary_preference: 'none', price: 15 },
          }).expect(201);
        mealPlanId = res.body.meal_id;
        expect(res.body.is_available).toBe(true);
      } finally {
        if (mealPlanId) {
          await prisma.meal_plan_food_item.deleteMany({ where: { meal_id: mealPlanId } });
          await prisma.meal_plan.delete({ where: { meal_id: mealPlanId } });
        }
      }
    });

    it('rejects food items that do not exist (400)', async () => {
      let mealPlanId: number | undefined;
      try {
        const res = await request(app.getHttpServer())
          .post('/meal-plan')
          .set('Authorization', `Bearer ${token}`)
          .send({
            mealPlan: { item_name: 'E2E Bad MP 4412', category: 'test', description: 'e2e bad', dietary_preference: 'none', price: 20 },
            foodItems: [
              { meal_id: 0, food_item_id: 999999999, day: 'Monday', meal_type: 'breakfast' },
            ],
          }).expect(400);
        expect(res.body.message).toContain('999999999');
        mealPlanId = undefined;
      } finally {
        if (mealPlanId) {
          await prisma.meal_plan_food_item.deleteMany({ where: { meal_id: mealPlanId } });
          await prisma.meal_plan.delete({ where: { meal_id: mealPlanId } });
        }
      }
    });

    it('rejects duplicate food item entry (409)', async () => {
      const fi = await prisma.food_item.create({
        data: { item_name: 'E2E Dup FI 1212', ingredient_list: 'test', price: 5 },
      });
      let mealPlanId: number | undefined;
      try {
        const res = await request(app.getHttpServer())
          .post('/meal-plan')
          .set('Authorization', `Bearer ${token}`)
          .send({
            mealPlan: { item_name: 'E2E Dup MP 1212', category: 'test', description: 'dup test', dietary_preference: 'none', price: 20 },
            foodItems: [
              { meal_id: 0, food_item_id: fi.food_item_id, day: 'Monday', meal_type: 'breakfast' },
              { meal_id: 0, food_item_id: fi.food_item_id, day: 'Monday', meal_type: 'breakfast' },
            ],
          }).expect(409);
        expect(res.body.message).toContain('Duplicate');
        mealPlanId = undefined;
      } finally {
        if (mealPlanId) {
          await prisma.meal_plan_food_item.deleteMany({ where: { meal_id: mealPlanId } });
          await prisma.meal_plan.delete({ where: { meal_id: mealPlanId } });
        }
        await prisma.food_item.delete({ where: { food_item_id: fi.food_item_id } });
      }
    });

    it('returns 400 for missing required mealPlan fields', async () => {
      await request(app.getHttpServer())
        .post('/meal-plan')
        .set('Authorization', `Bearer ${token}`)
        .send({ mealPlan: { category: 'test' } }).expect(400);
    });

    it('returns 400 for invalid price (negative)', async () => {
      await request(app.getHttpServer())
        .post('/meal-plan')
        .set('Authorization', `Bearer ${token}`)
        .send({
          mealPlan: { item_name: 'E2E NegPrice 3434', category: 'test', description: 'neg', dietary_preference: 'none', price: -10 },
        }).expect(400);
    });

    it('returns 400 for missing required foodItem fields', async () => {
      const fi = await prisma.food_item.create({
        data: { item_name: 'E2E MissingFI 5656', ingredient_list: 'test', price: 5 },
      });
      let mealPlanId: number | undefined;
      try {
        await request(app.getHttpServer())
          .post('/meal-plan')
          .set('Authorization', `Bearer ${token}`)
          .send({
            mealPlan: { item_name: 'E2E MissingFI MP 5656', category: 'test', description: 'missing fi fields', dietary_preference: 'none', price: 20 },
            foodItems: [
              { meal_id: 0, food_item_id: fi.food_item_id, meal_type: 'breakfast' },
            ],
          }).expect(400);
        mealPlanId = undefined;
      } finally {
        if (mealPlanId) {
          await prisma.meal_plan_food_item.deleteMany({ where: { meal_id: mealPlanId } });
          await prisma.meal_plan.delete({ where: { meal_id: mealPlanId } });
        }
        await prisma.food_item.delete({ where: { food_item_id: fi.food_item_id } });
      }
    });
  });

  describe('GET /meal-plan', () => {
    it('returns 200 and an array', async () => {
      const res = await request(app.getHttpServer())
        .get('/meal-plan')
        .set('Authorization', `Bearer ${token}`).expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('GET all includes food_items with nested food_item', async () => {
      const fi = await prisma.food_item.create({
        data: { item_name: 'E2E Nested FI 1234', ingredient_list: 'test', price: 5 },
      });
      const mp = await prisma.meal_plan.create({
        data: { item_name: 'E2E Nested MP 1234', category: 'test', description: 'nested', dietary_preference: 'none', price: 10 },
      });
      await prisma.meal_plan_food_item.create({
        data: { meal_id: mp.meal_id, food_item_id: fi.food_item_id, day: 'Monday', meal_type: 'breakfast' },
      });
      try {
        const res = await request(app.getHttpServer())
          .get('/meal-plan')
          .set('Authorization', `Bearer ${token}`).expect(200);
        const found = res.body.find((m: { meal_id: number }) => m.meal_id === mp.meal_id);
        expect(found).toBeDefined();
        expect(found.food_items).toHaveLength(1);
        expect(found.food_items[0].food_item).toBeDefined();
        expect(found.food_items[0].food_item.food_item_id).toBe(fi.food_item_id);
      } finally {
        await prisma.meal_plan_food_item.deleteMany({ where: { meal_id: mp.meal_id } });
        await prisma.meal_plan.delete({ where: { meal_id: mp.meal_id } });
        await prisma.food_item.delete({ where: { food_item_id: fi.food_item_id } });
      }
    });

    it('returns a meal plan by id with nested food_item', async () => {
      const fi = await prisma.food_item.create({
        data: { item_name: 'E2E GetById FI 5678', ingredient_list: 'test', price: 5 },
      });
      const mp = await prisma.meal_plan.create({
        data: { item_name: 'E2E GetById MP 5678', category: 'test', description: 'get by id', dietary_preference: 'none', price: 12 },
      });
      await prisma.meal_plan_food_item.create({
        data: { meal_id: mp.meal_id, food_item_id: fi.food_item_id, day: 'Friday', meal_type: 'dinner' },
      });
      try {
        const res = await request(app.getHttpServer())
          .get(`/meal-plan/${mp.meal_id}`)
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(res.body.meal_id).toBe(mp.meal_id);
        expect(res.body.item_name).toBe('E2E GetById MP 5678');
        expect(Array.isArray(res.body.food_items)).toBe(true);
        expect(res.body.food_items).toHaveLength(1);
        expect(res.body.food_items[0].food_item).toBeDefined();
        expect(res.body.food_items[0].food_item.food_item_id).toBe(fi.food_item_id);
      } finally {
        await prisma.meal_plan_food_item.deleteMany({ where: { meal_id: mp.meal_id } });
        await prisma.meal_plan.delete({ where: { meal_id: mp.meal_id } });
        await prisma.food_item.delete({ where: { food_item_id: fi.food_item_id } });
      }
    });

    it('returns 404 for a non-existent id', async () => {
      await request(app.getHttpServer())
        .get('/meal-plan/999999999')
        .set('Authorization', `Bearer ${token}`).expect(404);
    });

    it('returns 400 for non-numeric id', async () => {
      await request(app.getHttpServer())
        .get('/meal-plan/abc')
        .set('Authorization', `Bearer ${token}`).expect(400);
    });
  });

  describe('PATCH /meal-plan/:id', () => {
    it('updates meal plan fields and replaces food items', async () => {
      const fi1 = await prisma.food_item.create({
        data: { item_name: 'E2E MP Patch FI1 7745', ingredient_list: 'test', price: 5 },
      });
      const fi2 = await prisma.food_item.create({
        data: { item_name: 'E2E MP Patch FI2 7745', ingredient_list: 'test', price: 5 },
      });
      const mp = await prisma.meal_plan.create({
        data: { item_name: 'E2E Patch MP 7745', category: 'test', description: 'before', dietary_preference: 'none', price: 10 },
      });
      try {
        const res = await request(app.getHttpServer())
          .patch(`/meal-plan/${mp.meal_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            mealPlan: { item_name: 'E2E Patched MP 7745', description: 'after', is_available: false },
            foodItems: [
              { meal_id: 0, food_item_id: fi1.food_item_id, day: 'Wednesday', meal_type: 'dinner' },
              { meal_id: 0, food_item_id: fi2.food_item_id, day: 'Thursday', meal_type: 'snack' },
            ],
          }).expect(200);
        expect(res.body.item_name).toBe('E2E Patched MP 7745');
        expect(res.body.description).toBe('after');
        expect(res.body.is_available).toBe(false);
        expect(res.body.food_items).toHaveLength(2);
      } finally {
        await prisma.meal_plan_food_item.deleteMany({ where: { meal_id: mp.meal_id } });
        await prisma.meal_plan.delete({ where: { meal_id: mp.meal_id } });
        await prisma.food_item.deleteMany({ where: { food_item_id: { in: [fi1.food_item_id, fi2.food_item_id] } } });
      }
    });

    it('updates fields without foodItems (preserves existing associations)', async () => {
      const fi = await prisma.food_item.create({
        data: { item_name: 'E2E PreserveFI 8899', ingredient_list: 'test', price: 5 },
      });
      const mp = await prisma.meal_plan.create({
        data: { item_name: 'E2E Preserve MP 8899', category: 'test', description: 'before', dietary_preference: 'none', price: 10 },
      });
      await prisma.meal_plan_food_item.create({
        data: { meal_id: mp.meal_id, food_item_id: fi.food_item_id, day: 'Monday', meal_type: 'lunch' },
      });
      try {
        const res = await request(app.getHttpServer())
          .patch(`/meal-plan/${mp.meal_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            mealPlan: { item_name: 'E2E Preserved MP 8899', description: 'after' },
          }).expect(200);
        expect(res.body.item_name).toBe('E2E Preserved MP 8899');
        expect(res.body.description).toBe('after');
        expect(res.body.food_items).toHaveLength(1);
        expect(res.body.food_items[0].food_item_id).toBe(fi.food_item_id);
      } finally {
        await prisma.meal_plan_food_item.deleteMany({ where: { meal_id: mp.meal_id } });
        await prisma.meal_plan.delete({ where: { meal_id: mp.meal_id } });
        await prisma.food_item.delete({ where: { food_item_id: fi.food_item_id } });
      }
    });

    it('updates with empty foodItems array (deletes all associations)', async () => {
      const fi = await prisma.food_item.create({
        data: { item_name: 'E2E DeleteFI 3322', ingredient_list: 'test', price: 5 },
      });
      const mp = await prisma.meal_plan.create({
        data: { item_name: 'E2E DeleteAssoc MP 3322', category: 'test', description: 'delete all', dietary_preference: 'none', price: 10 },
      });
      await prisma.meal_plan_food_item.create({
        data: { meal_id: mp.meal_id, food_item_id: fi.food_item_id, day: 'Monday', meal_type: 'lunch' },
      });
      try {
        const res = await request(app.getHttpServer())
          .patch(`/meal-plan/${mp.meal_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            mealPlan: { description: 'no more food items' },
            foodItems: [],
          }).expect(200);
        expect(res.body.description).toBe('no more food items');
        expect(res.body.food_items).toHaveLength(0);
      } finally {
        await prisma.meal_plan_food_item.deleteMany({ where: { meal_id: mp.meal_id } });
        await prisma.meal_plan.delete({ where: { meal_id: mp.meal_id } });
        await prisma.food_item.delete({ where: { food_item_id: fi.food_item_id } });
      }
    });

    it('returns 400 for non-existent food_item_id in update', async () => {
      const mp = await prisma.meal_plan.create({
        data: { item_name: 'E2E BadUpdateFI 5544', category: 'test', description: 'bad fi', dietary_preference: 'none', price: 10 },
      });
      try {
        await request(app.getHttpServer())
          .patch(`/meal-plan/${mp.meal_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            mealPlan: { description: 'updated' },
            foodItems: [
              { meal_id: 0, food_item_id: 999999999, day: 'Monday', meal_type: 'breakfast' },
            ],
          }).expect(400);
      } finally {
        await prisma.meal_plan_food_item.deleteMany({ where: { meal_id: mp.meal_id } });
        await prisma.meal_plan.delete({ where: { meal_id: mp.meal_id } });
      }
    });

    it('returns 409 for duplicate food item entry in update', async () => {
      const fi = await prisma.food_item.create({
        data: { item_name: 'E2E DupUpdateFI 6677', ingredient_list: 'test', price: 5 },
      });
      const mp = await prisma.meal_plan.create({
        data: { item_name: 'E2E DupUpdate MP 6677', category: 'test', description: 'dup update', dietary_preference: 'none', price: 10 },
      });
      try {
        await request(app.getHttpServer())
          .patch(`/meal-plan/${mp.meal_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            mealPlan: { description: 'dup test' },
            foodItems: [
              { meal_id: 0, food_item_id: fi.food_item_id, day: 'Monday', meal_type: 'breakfast' },
              { meal_id: 0, food_item_id: fi.food_item_id, day: 'Monday', meal_type: 'breakfast' },
            ],
          }).expect(409);
      } finally {
        await prisma.meal_plan_food_item.deleteMany({ where: { meal_id: mp.meal_id } });
        await prisma.meal_plan.delete({ where: { meal_id: mp.meal_id } });
        await prisma.food_item.delete({ where: { food_item_id: fi.food_item_id } });
      }
    });

    it('returns 404 for a non-existent id', async () => {
      await request(app.getHttpServer())
        .patch('/meal-plan/999999999')
        .set('Authorization', `Bearer ${token}`)
        .send({ mealPlan: { item_name: 'Nope' } }).expect(404);
    });

    it('returns 400 for non-numeric id', async () => {
      await request(app.getHttpServer())
        .patch('/meal-plan/abc')
        .set('Authorization', `Bearer ${token}`)
        .send({ mealPlan: { item_name: 'Nope' } }).expect(400);
    });
  });
});
