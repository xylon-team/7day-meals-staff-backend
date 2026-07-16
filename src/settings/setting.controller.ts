import { Controller, Get, Post, Body, Patch } from '@nestjs/common';
import { SettingService } from './setting.service';
import { AdminJwtAuthGuard } from 'src/admin-auth/guards/admin-jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
import { CreateSettingDto } from './dto/create_setting.dto';
import { UpdateSettingDto } from './dto/update_setting.dto';

@Controller('settings')
@UseGuards(AdminJwtAuthGuard)
export class SettingController {
  constructor(private readonly settingService: SettingService) {}

  //CREATE
  @Post()
  create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingService.create(createSettingDto);
  }

  //READ
  @Get()
  read() {
    return this.settingService.readSetting();
  }

  //UPDATE
  @Patch()
  update(@Body() updateSettingDto: UpdateSettingDto) {
    return this.settingService.update(updateSettingDto);
  }
}
