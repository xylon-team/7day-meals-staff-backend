import { PartialType } from '@nestjs/mapped-types';
import { CreateStaffWithCredentialDto } from './create-staff-with-cred-dto';

export class UpdateStaffWithCredentialDto extends PartialType(CreateStaffWithCredentialDto) {}
