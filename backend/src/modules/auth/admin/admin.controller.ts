import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { TurnstileService } from '../../../lib/turnstile/turnstile.service';
import { setAuthCookies } from '../auth_guard/auth-cookie';
import { JwtAuthGuard } from '../auth_guard/auth_guard';
import { RolesGuard } from '../auth_guard/guard';
import { Roles } from '../auth_guard/roles.decorator';
import { CurrentUser } from '../auth_guard/current_user_decorator';
import type { AuthUser } from '../dto/auth-types';
import {
  AdminBroadcastEmailDto,
  AdminCreateDto,
  AdminLoginDto,
  BroadcastSystemMessageDto,
  UpdateUserAccessDto,
} from './admin.dto';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly turnstile: TurnstileService,
  ) {}

  @Get('setup-status')
  setupStatus() {
    return this.adminService.getSetupStatus();
  }

  @Post('setup')
  async setup(
    @Body() dto: AdminCreateDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.turnstile.verify(dto.turnstileToken, req.ip);
    const result = await this.adminService.adminSetup(dto);
    setAuthCookies(res, result);
    return { user: result.user };
  }

  @Post('login')
  async login(
    @Body() dto: AdminLoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.turnstile.verify(dto.turnstileToken, req.ip);
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

  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  stats() {
    return this.adminService.getStats();
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

  @Post('system-messages')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  broadcastSystemMessage(
    @CurrentUser() admin: AuthUser,
    @Body() dto: BroadcastSystemMessageDto,
  ) {
    return this.adminService.broadcastSystemMessage(admin, dto);
  }

  @Get('email-recipients')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  listEmailRecipients() {
    return this.adminService.listEmailRecipients();
  }

  @Post('emails/broadcast')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  broadcastEmail(
    @CurrentUser() _admin: AuthUser,
    @Body() dto: AdminBroadcastEmailDto,
  ) {
    return this.adminService.broadcastAdminEmail(dto);
  }
}
