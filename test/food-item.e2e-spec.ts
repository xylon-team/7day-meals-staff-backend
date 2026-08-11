import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaClient } from '@prisma/client';
import { createTestApp } from './helpers/test-app';
import { loginStaff } from './helpers/auth';
import { createNoPermStaff, cleanupStaff } from './helpers/no-perm-staff';

describe('FoodItem (e2e)', () => {
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
      await request(app.getHttpServer()).get('/food-items').expect(401);
    });

    it('returns 401 with an invalid token', async () => {
      await request(app.getHttpServer())
        .get('/food-items')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);
    });

    it('returns 403 with insufficient permissions', async () => {
      const { staffId, email, password } = await createNoPermStaff(prisma, 'fooditem');
      try {
        const noPermToken = await loginStaff(app, email, password);
        await request(app.getHttpServer())
          .get('/food-items')
          .set('Authorization', `Bearer ${noPermToken}`)
          .expect(403);
      } finally {
        await cleanupStaff(prisma, staffId);
      }
    });
  });

  describe('GET /food-items', () => {
    it('returns 200 and an array', async () => {
      const res = await request(app.getHttpServer())
        .get('/food-items')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('filters by item_name (case-insensitive contains)', async () => {
      const fi = await prisma.food_item.create({
        data: { item_name: 'E2E Filter Test Unique 9281', ingredient_list: 'beef, cheese, lettuce', price: 15.5, is_available: true },
      });
      try {
        const res = await request(app.getHttpServer())
          .get('/food-items').query({ item_name: 'E2E Filter Test Unique 9281' })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(res.body.some((f: { food_item_id: number }) => f.food_item_id === fi.food_item_id)).toBe(true);
      } finally {
        await prisma.food_item.delete({ where: { food_item_id: fi.food_item_id } });
      }
    });

    it('item_name with no match returns empty or excludes the item', async () => {
      const fi = await prisma.food_item.create({
        data: { item_name: 'E2E NoMatch 5599', ingredient_list: 'test', price: 10, is_available: true },
      });
      try {
        const res = await request(app.getHttpServer())
          .get('/food-items').query({ item_name: 'ZZZZNOTHINGZZZZ' })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(res.body.some((f: { food_item_id: number }) => f.food_item_id === fi.food_item_id)).toBe(false);
      } finally {
        await prisma.food_item.delete({ where: { food_item_id: fi.food_item_id } });
      }
    });

    it('filters by is_available=true and is_available=false', async () => {
      const fi = await prisma.food_item.create({
        data: { item_name: 'E2E Avail Test 4612', ingredient_list: 'test', price: 12, is_available: false },
      });
      try {
        const resFalse = await request(app.getHttpServer())
          .get('/food-items').query({ is_available: 'false' })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(resFalse.body.some((f: { food_item_id: number }) => f.food_item_id === fi.food_item_id)).toBe(true);

        const resTrue = await request(app.getHttpServer())
          .get('/food-items').query({ is_available: 'true' })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(resTrue.body.some((f: { food_item_id: number }) => f.food_item_id === fi.food_item_id)).toBe(false);
      } finally {
        await prisma.food_item.delete({ where: { food_item_id: fi.food_item_id } });
      }
    });

    it('is_available with invalid value applies no filter (returns all)', async () => {
      const fiAvail = await prisma.food_item.create({
        data: { item_name: 'E2E InvalidAvail True 3344', ingredient_list: 'test', price: 10, is_available: true },
      });
      const fiUnavail = await prisma.food_item.create({
        data: { item_name: 'E2E InvalidAvail False 3344', ingredient_list: 'test', price: 10, is_available: false },
      });
      try {
        const res = await request(app.getHttpServer())
          .get('/food-items').query({ is_available: 'maybe' })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(res.body.some((f: { food_item_id: number }) => f.food_item_id === fiAvail.food_item_id)).toBe(true);
        expect(res.body.some((f: { food_item_id: number }) => f.food_item_id === fiUnavail.food_item_id)).toBe(true);
      } finally {
        await prisma.food_item.deleteMany({ where: { food_item_id: { in: [fiAvail.food_item_id, fiUnavail.food_item_id] } } });
      }
    });

    it('filters by min_price and max_price (in and out of range)', async () => {
      const fi = await prisma.food_item.create({
        data: { item_name: 'E2E Price Test 7351', ingredient_list: 'test', price: 42, is_available: true },
      });
      try {
        const resIn = await request(app.getHttpServer())
          .get('/food-items').query({ min_price: '40', max_price: '45' })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(resIn.body.some((f: { food_item_id: number }) => f.food_item_id === fi.food_item_id)).toBe(true);

        const resOut = await request(app.getHttpServer())
          .get('/food-items').query({ min_price: '50', max_price: '60' })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(resOut.body.some((f: { food_item_id: number }) => f.food_item_id === fi.food_item_id)).toBe(false);
      } finally {
        await prisma.food_item.delete({ where: { food_item_id: fi.food_item_id } });
      }
    });

    it('filters by min_price only (no max_price)', async () => {
      const fi = await prisma.food_item.create({
        data: { item_name: 'E2E MinOnly 8821', ingredient_list: 'test', price: 55, is_available: true },
      });
      try {
        const res = await request(app.getHttpServer())
          .get('/food-items').query({ min_price: '50' })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(res.body.some((f: { food_item_id: number }) => f.food_item_id === fi.food_item_id)).toBe(true);

        const resBelow = await request(app.getHttpServer())
          .get('/food-items').query({ min_price: '60' })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(resBelow.body.some((f: { food_item_id: number }) => f.food_item_id === fi.food_item_id)).toBe(false);
      } finally {
        await prisma.food_item.delete({ where: { food_item_id: fi.food_item_id } });
      }
    });

    it('filters by max_price only (no min_price)', async () => {
      const fi = await prisma.food_item.create({
        data: { item_name: 'E2E MaxOnly 2208', ingredient_list: 'test', price: 30, is_available: true },
      });
      try {
        const res = await request(app.getHttpServer())
          .get('/food-items').query({ max_price: '35' })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(res.body.some((f: { food_item_id: number }) => f.food_item_id === fi.food_item_id)).toBe(true);

        const resAbove = await request(app.getHttpServer())
          .get('/food-items').query({ max_price: '25' })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(resAbove.body.some((f: { food_item_id: number }) => f.food_item_id === fi.food_item_id)).toBe(false);
      } finally {
        await prisma.food_item.delete({ where: { food_item_id: fi.food_item_id } });
      }
    });

    it('filters by ingredient_list (single value, contains)', async () => {
      const fi = await prisma.food_item.create({
        data: { item_name: 'E2E Ing Test 1837', ingredient_list: 'kangaroo, onion, garlic', price: 9, is_available: true },
      });
      try {
        const res = await request(app.getHttpServer())
          .get('/food-items').query({ ingredient_list: 'kangaroo' })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(res.body.some((f: { food_item_id: number }) => f.food_item_id === fi.food_item_id)).toBe(true);
      } finally {
        await prisma.food_item.delete({ where: { food_item_id: fi.food_item_id } });
      }
    });

    it('filters by ingredient_list (array, OR search)', async () => {
      const fi = await prisma.food_item.create({
        data: { item_name: 'E2E IngArray 4456', ingredient_list: 'spinach, cheese', price: 9, is_available: true },
      });
      try {
        const res = await request(app.getHttpServer())
          .get('/food-items').query({ ingredient_list: ['tomato', 'spinach'] })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(res.body.some((f: { food_item_id: number }) => f.food_item_id === fi.food_item_id)).toBe(true);

        const resNoMatch = await request(app.getHttpServer())
          .get('/food-items').query({ ingredient_list: ['tomato', 'rice'] })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(resNoMatch.body.some((f: { food_item_id: number }) => f.food_item_id === fi.food_item_id)).toBe(false);
      } finally {
        await prisma.food_item.delete({ where: { food_item_id: fi.food_item_id } });
      }
    });

    it('ingredient_list with no match excludes the item', async () => {
      const fi = await prisma.food_item.create({
        data: { item_name: 'E2E IngNoMatch 7766', ingredient_list: 'pasta, sauce', price: 9, is_available: true },
      });
      try {
        const res = await request(app.getHttpServer())
          .get('/food-items').query({ ingredient_list: 'zzznotfoundzzz' })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(res.body.some((f: { food_item_id: number }) => f.food_item_id === fi.food_item_id)).toBe(false);
      } finally {
        await prisma.food_item.delete({ where: { food_item_id: fi.food_item_id } });
      }
    });

    it('applies multiple filters combined', async () => {
      const fi = await prisma.food_item.create({
        data: { item_name: 'E2E Combined 9912', ingredient_list: 'chicken, rice', price: 25, is_available: true },
      });
      try {
        const res = await request(app.getHttpServer())
          .get('/food-items').query({ item_name: 'E2E Combined 9912', is_available: 'true', min_price: '20', max_price: '30' })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(res.body.some((f: { food_item_id: number }) => f.food_item_id === fi.food_item_id)).toBe(true);

        const resExcluded = await request(app.getHttpServer())
          .get('/food-items').query({ item_name: 'E2E Combined 9912', is_available: 'false' })
          .set('Authorization', `Bearer ${token}`).expect(200);
        expect(resExcluded.body.some((f: { food_item_id: number }) => f.food_item_id === fi.food_item_id)).toBe(false);
      } finally {
        await prisma.food_item.delete({ where: { food_item_id: fi.food_item_id } });
      }
    });
  });

  describe('PATCH /food-items/:id', () => {
    it('updates item_name and is_available', async () => {
      const fi = await prisma.food_item.create({
        data: { item_name: 'E2E Patch Test 5523', ingredient_list: 'test', price: 10, is_available: true },
      });
      try {
        const res = await request(app.getHttpServer())
          .patch(`/food-items/${fi.food_item_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ item_name: 'E2E Patched Name 5523', is_available: false }).expect(200);
        expect(res.body.food_item_id).toBe(fi.food_item_id);
        expect(res.body.item_name).toBe('E2E Patched Name 5523');
        expect(res.body.is_available).toBe(false);
      } finally {
        await prisma.food_item.delete({ where: { food_item_id: fi.food_item_id } });
      }
    });

    it('updates price', async () => {
      const fi = await prisma.food_item.create({
        data: { item_name: 'E2E PatchPrice 1122', ingredient_list: 'test', price: 10, is_available: true },
      });
      try {
        const res = await request(app.getHttpServer())
          .patch(`/food-items/${fi.food_item_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ price: 99.99 }).expect(200);
        expect(Number(res.body.price)).toBeCloseTo(99.99);
      } finally {
        await prisma.food_item.delete({ where: { food_item_id: fi.food_item_id } });
      }
    });

    it('updates ingredient_list', async () => {
      const fi = await prisma.food_item.create({
        data: { item_name: 'E2E PatchIng 3344', ingredient_list: 'before', price: 10, is_available: true },
      });
      try {
        const res = await request(app.getHttpServer())
          .patch(`/food-items/${fi.food_item_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ ingredient_list: 'after, updated' }).expect(200);
        expect(res.body.ingredient_list).toBe('after, updated');
      } finally {
        await prisma.food_item.delete({ where: { food_item_id: fi.food_item_id } });
      }
    });

    it('updates image_path', async () => {
      const fi = await prisma.food_item.create({
        data: { item_name: 'E2E PatchImg 5566', ingredient_list: 'test', price: 10, is_available: true },
      });
      try {
        const res = await request(app.getHttpServer())
          .patch(`/food-items/${fi.food_item_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ image_path: '/images/new.png' }).expect(200);
        expect(res.body.image_path).toBe('/images/new.png');
      } finally {
        await prisma.food_item.delete({ where: { food_item_id: fi.food_item_id } });
      }
    });

    it('updates all fields at once', async () => {
      const fi = await prisma.food_item.create({
        data: { item_name: 'E2E PatchAll 7788', ingredient_list: 'old', price: 5, is_available: true },
      });
      try {
        const res = await request(app.getHttpServer())
          .patch(`/food-items/${fi.food_item_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ item_name: 'E2E Patched All 7788', ingredient_list: 'new', image_path: '/img.png', price: 50, is_available: false }).expect(200);
        expect(res.body.item_name).toBe('E2E Patched All 7788');
        expect(res.body.ingredient_list).toBe('new');
        expect(res.body.image_path).toBe('/img.png');
        expect(Number(res.body.price)).toBe(50);
        expect(res.body.is_available).toBe(false);
      } finally {
        await prisma.food_item.delete({ where: { food_item_id: fi.food_item_id } });
      }
    });

    it('empty body returns 200 with unchanged row', async () => {
      const fi = await prisma.food_item.create({
        data: { item_name: 'E2E EmptyBody 9900', ingredient_list: 'unchanged', price: 15, is_available: true },
      });
      try {
        const res = await request(app.getHttpServer())
          .patch(`/food-items/${fi.food_item_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({}).expect(200);
        expect(res.body.food_item_id).toBe(fi.food_item_id);
        expect(res.body.item_name).toBe('E2E EmptyBody 9900');
        expect(res.body.ingredient_list).toBe('unchanged');
        expect(Number(res.body.price)).toBe(15);
        expect(res.body.is_available).toBe(true);
      } finally {
        await prisma.food_item.delete({ where: { food_item_id: fi.food_item_id } });
      }
    });

    it('returns 404 for a non-existent id', async () => {
      await request(app.getHttpServer())
        .patch('/food-items/999999999')
        .set('Authorization', `Bearer ${token}`)
        .send({ item_name: 'Nope' }).expect(404);
    });

    it('returns 400 for invalid price (negative)', async () => {
      const fi = await prisma.food_item.create({
        data: { item_name: 'E2E NegPrice 1212', ingredient_list: 'test', price: 10, is_available: true },
      });
      try {
        await request(app.getHttpServer())
          .patch(`/food-items/${fi.food_item_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ price: -5 }).expect(400);
      } finally {
        await prisma.food_item.delete({ where: { food_item_id: fi.food_item_id } });
      }
    });

    it('returns 400 for invalid is_available (non-boolean)', async () => {
      const fi = await prisma.food_item.create({
        data: { item_name: 'E2E BadAvail 3434', ingredient_list: 'test', price: 10, is_available: true },
      });
      try {
        await request(app.getHttpServer())
          .patch(`/food-items/${fi.food_item_id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ is_available: 'maybe' }).expect(400);
      } finally {
        await prisma.food_item.delete({ where: { food_item_id: fi.food_item_id } });
      }
    });

    it('returns 400 for non-numeric id', async () => {
      await request(app.getHttpServer())
        .patch('/food-items/abc')
        .set('Authorization', `Bearer ${token}`)
        .send({ item_name: 'Nope' }).expect(400);
    });
  });
});
