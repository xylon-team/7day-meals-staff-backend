import { Test, TestingModule } from '@nestjs/testing';
import { StaffController } from './staff.controller';
import { StaffService } from './staff.service';

describe('StaffController', () => {
  let controller: StaffController;

  const mockStaffService = {
    assignRoles: jest.fn(),
    getRoles: jest.fn(),
    removeRole: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StaffController],
      providers: [
        {
          provide: StaffService,
          useValue: mockStaffService,
        },
      ],
    }).compile();

    controller = module.get<StaffController>(StaffController);
  });

  //TEST 1
  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  //TEST 2
  //ASSIGN ROLES
  describe('assignRoles', () => {
    // Happy path: assign roles using role_ids format
    it('should assign roles to a staff member with role_ids', async () => {
      const result = { count: 2 };
      mockStaffService.assignRoles.mockResolvedValue(result);

      expect(await controller.assignRoles('1', { role_ids: [1, 2] })).toBe(result);
      expect(mockStaffService.assignRoles).toHaveBeenCalledWith(1, [1, 2]);
    });

    //TEST 3
    // Happy path: assign roles using roles array format
    it('should assign roles to a staff member with roles array', async () => {
      const result = { count: 2 };
      mockStaffService.assignRoles.mockResolvedValue(result);

      expect(await controller.assignRoles('1', { roles: [1, 2] })).toBe(result);
      expect(mockStaffService.assignRoles).toHaveBeenCalledWith(1, [1, 2]);
    });

    //TEST 4
    // Happy path: assign roles when body is an array
    it('should assign roles when body is an array', async () => {
      const result = { count: 2 };
      mockStaffService.assignRoles.mockResolvedValue(result);

      expect(await controller.assignRoles('1', [1, 2])).toBe(result);
      expect(mockStaffService.assignRoles).toHaveBeenCalledWith(1, [1, 2]);
    });

    //TEST 5
    // Edge case: empty body should result in empty array
    it('should handle empty body by passing empty array', async () => {
      const result = { count: 0 };
      mockStaffService.assignRoles.mockResolvedValue(result);

      expect(await controller.assignRoles('1', {})).toBe(result);
      expect(mockStaffService.assignRoles).toHaveBeenCalledWith(1, []);
    });
  });

  //GET ROLES
  describe('getRoles', () => {
    //TEST 6
    // Happy path: get roles for a staff member
    it('should return roles for a staff member', async () => {
      const result = [{ role_id: 1, role_name: 'Admin' }];
      mockStaffService.getRoles.mockResolvedValue(result);

      expect(await controller.getRoles('1')).toBe(result);
      expect(mockStaffService.getRoles).toHaveBeenCalledWith(1);
    });
  });

  describe('removeRole', () => {
    //TEST 7
    // Happy path: remove a role from a staff member
    it('should remove a role from a staff member', async () => {
      const result = { staff_id: 1, role_id: 2 };
      mockStaffService.removeRole.mockResolvedValue(result);

      expect(await controller.removeRole('1', '2')).toBe(result);
      expect(mockStaffService.removeRole).toHaveBeenCalledWith(1, 2);
    });
  });
});
