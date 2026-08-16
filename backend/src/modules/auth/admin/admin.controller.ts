import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { setAuthCookies } from '../auth_guard/auth-cookie';
import { JwtAuthGuard } from '../auth_guard/auth_guard';
import { RolesGuard } from '../auth_guard/guard';
import { Roles } from '../auth_guard/roles.decorator';
import {
  AdminCreateDto,
  AdminLoginDto,
  UpdateUserAccessDto,
} from './admin.dto';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('setup-status')
  setupStatus() {
    return this.adminService.getSetupStatus();
  }

  @Post('setup')
  async setup(
    @Body() dto: AdminCreateDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.adminService.adminSetup(dto);
    setAuthCookies(res, result);
    return { user: result.user };
  }

  @Post('login')
  async login(
    @Body() dto: AdminLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.adminService.adminLogin(dto);
    setAuthCookies(res, result);
    return { user: result.user };
  }

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  create(@Body() dto: AdminCreateDto) {
    return this.adminService.adminCreate(dto);
  }

  @Get('users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  listUsers() {
    return this.adminService.listUsers();
  }

  @Patch('users/:id/access')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  updateUserAccess(
    @Param('id') id: string,
    @Body() dto: UpdateUserAccessDto,
  ) {
    return this.adminService.updateUserAccess(id, dto);
  }
}
