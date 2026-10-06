import * as nodemailer from 'nodemailer';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { StaffAuthService } from './staff-auth.service';

jest.mock('nodemailer', () => ({
  createTransport: jest.fn(() => ({ sendMail: jest.fn() })),
}));

describe('StaffAuthService password recovery', () => {
  const genericResponse = {
    message: 'If a staff account exists for this email, an OTP will be sent.',
  };
  let service: StaffAuthService;
  let prisma: {
    staff_credential: { findFirst: jest.Mock };
    password_reset_otp: { create: jest.Mock };
  };
  let mockSendMail: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    prisma = {
      staff_credential: { findFirst: jest.fn() },
      password_reset_otp: { create: jest.fn() },
    };
    service = new StaffAuthService(
      prisma as unknown as PrismaService,
      {} as JwtService,
    );
    mockSendMail = (nodemailer.createTransport as jest.Mock).mock.results[0]
      .value.sendMail;
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the generic response without creating or sending an OTP for an unknown email', async () => {
    prisma.staff_credential.findFirst.mockResolvedValue(null);

    await expect(service.sendOtpEmail('unknown@example.test')).resolves.toEqual(
      genericResponse,
    );
    expect(prisma.password_reset_otp.create).not.toHaveBeenCalled();
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it('returns the same generic response and sends an OTP for a known email', async () => {
    prisma.staff_credential.findFirst.mockResolvedValue({ staff_id: 42 });
    prisma.password_reset_otp.create.mockResolvedValue({});
    mockSendMail.mockResolvedValue({});

    await expect(service.sendOtpEmail('staff@example.test')).resolves.toEqual(
      genericResponse,
    );
    expect(prisma.password_reset_otp.create).toHaveBeenCalledTimes(1);
    expect(mockSendMail).toHaveBeenCalledTimes(1);
  });

  it('keeps the same response when sending mail fails', async () => {
    prisma.staff_credential.findFirst.mockResolvedValue({ staff_id: 42 });
    prisma.password_reset_otp.create.mockResolvedValue({});
    mockSendMail.mockRejectedValue(new Error('SMTP unavailable'));

    await expect(service.sendOtpEmail('staff@example.test')).resolves.toEqual(
      genericResponse,
    );
  });

  it('keeps the same response when the credential lookup fails', async () => {
    prisma.staff_credential.findFirst.mockRejectedValue(new Error('DB unavailable'));

    await expect(service.sendOtpEmail('unknown@example.test')).resolves.toEqual(
      genericResponse,
    );
  });
});
