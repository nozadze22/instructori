import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AccessGuard } from '../auth/auth_guard/access.guard';
import { JwtAuthGuard } from '../auth/auth_guard/auth_guard';
import { CurrentUser } from '../auth/auth_guard/current_user_decorator';
import type { AuthUser } from '../auth/dto/auth-types';
import {
  CreateDrivingMistakeDto,
  CreateDrivingSessionDto,
  UpdateDrivingMistakeDto,
} from './dto/driving-session.dto';
import { DrivingSessionsService } from './driving-sessions.service';

@Controller('driving-sessions')
@UseGuards(JwtAuthGuard, AccessGuard)
export class DrivingSessionsController {
  constructor(private readonly drivingSessionsService: DrivingSessionsService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateDrivingSessionDto) {
    return this.drivingSessionsService.create(user.userId, user.role, dto);
  }

  @Get()
  findMine(
    @CurrentUser() user: AuthUser,
    @Query('studentName') studentName?: string,
    @Query('activeOnly') activeOnly?: string,
  ) {
    return this.drivingSessionsService.findForInstructor(user.userId, {
      studentName,
      activeOnly: activeOnly === '1' || activeOnly === 'true',
    });
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.drivingSessionsService.findOne(user.userId, user.role, id);
  }

  @Post(':id/mistakes')
  addMistake(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateDrivingMistakeDto,
  ) {
    return this.drivingSessionsService.addMistake(user.userId, id, dto);
  }

  @Get(':id/mistakes')
  listMistakes(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.drivingSessionsService.listMistakes(
      user.userId,
      user.role,
      id,
    );
  }

  @Patch(':id/mistakes/:mistakeId')
  updateMistake(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('mistakeId') mistakeId: string,
    @Body() dto: UpdateDrivingMistakeDto,
  ) {
    return this.drivingSessionsService.updateMistake(
      user.userId,
      id,
      mistakeId,
      dto,
    );
  }

  @Patch(':id/finish')
  finish(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.drivingSessionsService.finish(user.userId, id);
  }
}

@Controller('students')
@UseGuards(JwtAuthGuard, AccessGuard)
export class StudentDrivingSessionsController {
  constructor(private readonly drivingSessionsService: DrivingSessionsService) {}

  @Get(':studentUserId/driving-sessions')
  findForStudent(@Param('studentUserId') studentUserId: string) {
    return this.drivingSessionsService.findForStudent(studentUserId);
  }
}
