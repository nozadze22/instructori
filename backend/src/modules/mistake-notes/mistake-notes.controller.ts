import {
  Body,
  Controller,
  Delete,
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
  CreateMistakeNoteDto,
  UpdateMistakeNoteDto,
} from './dto/mistake-note.dto';
import { MistakeNotesService } from './mistake-notes.service';

@Controller('mistake-notes')
@UseGuards(JwtAuthGuard, AccessGuard)
export class MistakeNotesController {
  constructor(private readonly mistakeNotesService: MistakeNotesService) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateMistakeNoteDto) {
    return this.mistakeNotesService.create(user.userId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query('studentName') studentName?: string,
    @Query('city') city?: string,
    @Query('routeId') routeId?: string,
  ) {
    return this.mistakeNotesService.findAll(user.userId, {
      studentName,
      city,
      routeId,
    });
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.mistakeNotesService.findOne(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateMistakeNoteDto,
  ) {
    return this.mistakeNotesService.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.mistakeNotesService.remove(user.userId, id);
  }
}
