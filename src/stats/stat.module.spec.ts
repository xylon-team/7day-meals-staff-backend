import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { AdminOrStaffAuthGuard } from '../staff-auth/guards/admin-or-staff-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { StatModule } from './stat.module';

describe('StatModule dependency injection', () => {
  it('resolves the combined Admin or Staff guard without connecting to the database', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [() => ({ JWT_SECRET: 'test-only-secret' })],
        }),
        StatModule,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();

    expect(moduleRef.get(AdminOrStaffAuthGuard)).toBeInstanceOf(AdminOrStaffAuthGuard);
    await moduleRef.close();
  });
});
