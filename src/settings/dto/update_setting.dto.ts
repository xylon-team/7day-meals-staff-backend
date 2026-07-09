import { PartialType } from '@nestjs/mapped-types';
import { CreateSettingDto } from './create_setting.dto';

export class UpdateSettingDto extends PartialType(CreateSettingDto) {}
