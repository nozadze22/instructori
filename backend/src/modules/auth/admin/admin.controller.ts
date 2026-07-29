import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { setAccessTokenCookie } from '../auth_guard/auth-cookie';
import { JwtAuthGuard } from '../auth_guard/auth_guard';
import { RolesGuard } from '../auth_guard/guard';
import { Roles } from '../auth_guard/roles.decorator';
import { AdminCreateDto, AdminLoginDto } from './admin.dto';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('login')
  async login(
    @Body() dto: AdminLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.adminService.adminLogin(dto);
    setAccessTokenCookie(res, result.accessToken);
    return { user: result.user };
  }

  @Post('create')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  async create(
    @Body() dto: AdminCreateDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.adminService.adminCreate(dto);
    setAccessTokenCookie(res, result.accessToken);
    return { user: result.user };
  }
}
