import * as dotenv from 'dotenv';
import * as path from 'path';

// Load QA env before each spec file boots the Nest app so that
// ConfigModule.forRoot() sees QA values in process.env.
const result = dotenv.config({ path: path.resolve(__dirname, '..', '.env.qa') });

if (result.error) {
  throw new Error(
    'Could not load .env.qa for e2e tests. Copy .env.qa.example to .env.qa and fill in QA values.\n' +
      result.error.message,
  );
}

const required = [
  'DATABASE_URL',
  'JWT_SECRET',
  'ADMIN_USERNAME',
  'ADMIN_PASSWORD',
  'TEST_STAFF_EMAIL',
  'TEST_STAFF_PASSWORD',
];

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(
    `Missing required env vars in .env.qa: ${missing.join(', ')}. ` +
      'Check .env.qa.example for the full list.',
  );
}
