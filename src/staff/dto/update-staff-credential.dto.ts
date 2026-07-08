import { PartialType } from '@nestjs/mapped-types';
import { CreateStaffCredentialDto } from './create-staff-credential.dto';

export class UpdateStaffCredentialDto extends PartialType(CreateStaffCredentialDto) {}
