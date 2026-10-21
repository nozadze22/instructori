import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AccessGuard } from '../auth/auth_guard/access.guard';
import { JwtAuthGuard } from '../auth/auth_guard/auth_guard';
import { CurrentUser } from '../auth/auth_guard/current_user_decorator';
import { RolesGuard } from '../auth/auth_guard/guard';
import { Roles } from '../auth/auth_guard/roles.decorator';
import type { AuthUser } from '../auth/dto/auth-types';
import { CreateInstructorMessageDto } from './dto/instructor.dto';
import { InstructorsService } from './instructors.service';

@Controller('instructors')
@UseGuards(JwtAuthGuard, AccessGuard)
export class InstructorsController {
  constructor(private readonly instructorsService: InstructorsService) {}

  @Get()
  listActive() {
    return this.instructorsService.listActive();
  }

  @Get('messages')
  @UseGuards(RolesGuard)
  @Roles('INSTRUCTOR')
  listMessages(@CurrentUser() user: AuthUser) {
    return this.instructorsService.listMessages(user);
  }

  @Patch('messages/:id/read')
  @UseGuards(RolesGuard)
  @Roles('INSTRUCTOR')
  markRead(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.instructorsService.markRead(user, id);
  }

  @Get(':id')
  getActive(@Param('id') id: string) {
    return this.instructorsService.getActive(id);
  }

  @Post(':id/messages')
  @UseGuards(RolesGuard)
  @Roles('USER')
  sendMessage(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateInstructorMessageDto,
  ) {
    return this.instructorsService.sendMessage(user, id, dto);
  }
}
