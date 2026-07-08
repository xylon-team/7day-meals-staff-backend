import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

// StaffStatus is an enum to ensure type safety and restrict the status field
// to only valid values ('active' or 'inactive'). This prevents invalid status
// values from being submitted and makes the code more maintainable by having
// a single source of truth for valid staff statuses.
enum StaffStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export class CreateStaffDto {
  @IsString()
  @IsNotEmpty()
  fname: string;

  @IsString()
  @IsNotEmpty()
  lname: string;

  @IsString()
  @IsNotEmpty()
  phone_number: string;

  @IsEnum(StaffStatus)
  @IsNotEmpty()
  status: StaffStatus;
}
