import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create_role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}
