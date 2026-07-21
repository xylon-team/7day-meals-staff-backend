import { Test, TestingModule } from '@nestjs/testing';
import { StaffService } from './staff.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { StaffStatus } from './dto/enums/staff_status.enum';   

describe('StaffService', () => {
  let service: StaffService;

  const mockPrismaService = {
    staff: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    staff_credential: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    staff_role: {
      createMany: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StaffService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<StaffService>(StaffService);
  });

  //TEST 1
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    //TEST 2
    // Happy path: successfully creates a new staff member
    it('should create a staff member', async () => {
      const createStaffDto: CreateStaffDto = {
        fname: 'John',
        lname: 'Doe',
        phone_number: '1234567890',
        status: StaffStatus.ACTIVE,
      };
      const expectedResult = { staff_id: 1, ...createStaffDto };
      mockPrismaService.staff.create.mockResolvedValue(expectedResult);

      const result = await service.create(createStaffDto);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.staff.create).toHaveBeenCalledWith({
        data: createStaffDto,
      });
    });

    //TEST 3
    // Edge case: throws ConflictException when duplicate staff information is provided
    it('should throw ConflictException when staff already exists', async () => {
      const createStaffDto: CreateStaffDto = {
        fname: 'John',
        lname: 'Doe',
        phone_number: '1234567890',
        status: StaffStatus.ACTIVE,
      };
      mockPrismaService.staff.create.mockRejectedValue({ code: 'P2002' });

      await expect(service.create(createStaffDto)).rejects.toThrow(
        new ConflictException('Staff with this information already exists'),
      );
    });
  });

  //ASSIGN ROLES
  describe('assignRoles', () => {
    //TEST 4
    // Happy path: successfully assigns roles to a staff member
    it('should assign roles to a staff member', async () => {
      const staffId = 1;
      const roleIds = [1, 2, 3];
      const expectedResult = { count: 3 };
      
      mockPrismaService.staff_role.createMany.mockResolvedValue(expectedResult);

      const result = await service.assignRoles(staffId, roleIds);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.staff_role.createMany).toHaveBeenCalledWith({
        data: [
          { staff_id: 1, role_id: 1 },
          { staff_id: 1, role_id: 2 },
          { staff_id: 1, role_id: 3 },
        ],
        skipDuplicates: true,
      });
    });

    //TEST 5
    // Edge case: handles empty roleIds array
    it('should handle empty roleIds array', async () => {
      const staffId = 1;
      const roleIds: number[] = [];
      const expectedResult = { count: 0 };
      
      mockPrismaService.staff_role.createMany.mockResolvedValue(expectedResult);

      const result = await service.assignRoles(staffId, roleIds);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.staff_role.createMany).toHaveBeenCalledWith({
        data: [],
        skipDuplicates: true,
      });
    });

    //TEST 6
    // Error case: throws BadRequestException when roleIds is undefined
    it('should throw BadRequestException when roleIds is undefined', async () => {
      const staffId = 1;
      const roleIds = undefined;

      await expect(service.assignRoles(staffId, roleIds as any)).rejects.toThrow(
        new BadRequestException('Invalid roles data provided. Please provide an array of role IDs.')
      );
    });

    //TEST 7
    // Error case: throws BadRequestException when roleIds is null
    it('should throw BadRequestException when roleIds is null', async () => {
      const staffId = 1;
      const roleIds = null;

      await expect(service.assignRoles(staffId, roleIds as any)).rejects.toThrow(
        new BadRequestException('Invalid roles data provided. Please provide an array of role IDs.')
      );
    });

    //TEST 8
    // Error case: throws BadRequestException when roleIds is not an array (object)
    it('should throw BadRequestException when roleIds is an object', async () => {
      const staffId = 1;
      const roleIds = {};

      await expect(service.assignRoles(staffId, roleIds as any)).rejects.toThrow(
        new BadRequestException('Invalid roles data provided. Please provide an array of role IDs.')
      );
    });
  });

  //GET ROLES
  describe('getRoles', () => {
    //TEST 9
    // Happy path: successfully gets roles for a staff member
    it('should get roles for a staff member', async () => {
      const staffId = 1;
      const mockStaffRoles = [
        { 
          role: { 
            role_id: 1, 
            role_name: 'Admin',
            role_permissions: [
              { permission: { permission_id: 1, permission_name: 'read' } }
            ]
          } 
        },
        { 
          role: { 
            role_id: 2, 
            role_name: 'Manager',
            role_permissions: []
          } 
        },
      ];
      
      mockPrismaService.staff_role.findMany.mockResolvedValue(mockStaffRoles);

      const result = await service.getRoles(staffId);

      expect(result).toEqual([
        { role_id: 1, role_name: 'Admin', role_permissions: [{ permission: { permission_id: 1, permission_name: 'read' } }] },
        { role_id: 2, role_name: 'Manager', role_permissions: [] },
      ]);
      expect(mockPrismaService.staff_role.findMany).toHaveBeenCalledWith({
        where: { staff_id: staffId },
        include: {
          role: {
            include: {
              role_permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });
    });
  });

  //REMOVE ROLE
  describe('removeRole', () => {
    //TEST 10
    // Happy path: successfully removes a role from a staff member
    it('should remove a role from a staff member', async () => {
      const staffId = 1;
      const roleId = 2;
      const expectedResult = { staff_id: staffId, role_id: roleId };
      
      mockPrismaService.staff_role.delete.mockResolvedValue(expectedResult);

      const result = await service.removeRole(staffId, roleId);

      expect(result).toEqual(expectedResult);
      expect(mockPrismaService.staff_role.delete).toHaveBeenCalledWith({
        where: {
          staff_id_role_id: {
            staff_id: staffId,
            role_id: roleId,
          },
        },
      });
    });

    //TEST 11
    // Error case: throws NotFoundException when role assignment doesn't exist
    it('should throw NotFoundException when role assignment not found', async () => {
      const staffId = 1;
      const roleId = 999;
      
      mockPrismaService.staff_role.delete.mockRejectedValue({ code: 'P2025' });

      await expect(service.removeRole(staffId, roleId)).rejects.toThrow(
        new NotFoundException(`Role ${roleId} for staff ${staffId} not found`)
      );
    });
  });
});

