# Prisma MySQL Setup Guide

## Prerequisites
- Node.js v18+
- MySQL server running on localhost
- MySQL database created manually (see step 4)

## Versions Used
- Prisma: `5.22.0`
- @prisma/client: `5.22.0`
- MySQL: localhost:3306

> **Note:** Prisma 7.x requires driver adapters for MySQL which do not exist yet.
> Use Prisma 5.22.0 for MySQL compatibility.

---

## Steps

### 1. Install Prisma CLI and Client
```bash
npm install prisma@5.22.0 --save-dev
npm install @prisma/client@5.22.0
```

### 2. Initialize Prisma
```bash
npx prisma init
```
This generates:
- `prisma/schema.prisma` - schema definition file
- `prisma.config.ts` - Prisma configuration file
- `.env` - environment variables file (if not already present)

### 3. Configure Environment Variables
Add the following to `.env`:
```
DATABASE_URL=mysql://root:password@localhost:3306/7meals-customer
```

> **Note:** `.env` is gitignored. Never commit this file.

### 4. Create the MySQL Database Manually
In MySQL, run:
```sql
CREATE DATABASE `7meals-customer`;
```

> The database must exist before running migrations.

### 5. Update `prisma/schema.prisma`
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

// Add your models here
model User {
  id    Int     @id @default(autoincrement())
  email String  @unique
  name  String?
}
```

### 6. Generate Prisma Client
```bash
npx prisma generate
```
This generates the Prisma Client into `node_modules/@prisma/client`.

### 7. Set Up Prisma Client Singleton
Create `app/lib/prisma.ts`:
```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

// Singleton pattern: reuse existing instance or create new one
// In production: module caching ensures single instance (process doesn't restart)
// In development: global storage ensures single instance across hot-reloads
export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 8. Run Migrations
When your schema models are finalized, run:
```bash
npx prisma migrate dev --name init
```
This creates migration files in `prisma/migrations/` and applies them to the database.

### 9. Test the Connection
Run the test script:
```bash
npx tsx test/test-db-connection.ts
```
Expected output: `✅ Database connection successful!`

---

## Key Files
| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Database schema and model definitions |
| `prisma.config.ts` | Prisma CLI configuration |
| `app/lib/prisma.ts` | Prisma Client singleton for use in the app |
| `.env` | Database connection string (gitignored) |
| `test/test-db-connection.ts` | Database connection test script |

---

## Useful Commands
```bash
npx prisma generate          # Regenerate Prisma Client after schema changes
npx prisma migrate dev       # Create and apply a new migration
npx prisma migrate status    # Check migration status
npx prisma studio            # Open Prisma Studio (visual DB browser)
```
