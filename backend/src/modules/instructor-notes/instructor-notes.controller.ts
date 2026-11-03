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
  CreateInstructorNoteDto,
  InstructorNoteQueryDto,
  InstructorNoteStudentsQueryDto,
  UpdateInstructorNoteDto,
} from './dto/instructor-note.dto';
import { InstructorNotesService } from './instructor-notes.service';

@Controller('instructor-notes')
@UseGuards(JwtAuthGuard, AccessGuard)
export class InstructorNotesController {
  constructor(
    private readonly instructorNotesService: InstructorNotesService,
  ) {}

  @Post()
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateInstructorNoteDto,
  ) {
    return this.instructorNotesService.create(user.userId, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: AuthUser,
    @Query() query: InstructorNoteQueryDto,
  ) {
    return this.instructorNotesService.findAll(user.userId, {
      studentName: query.studentName,
      studentUserId: query.studentUserId,
      q: query.q,
      sort: query.sort,
      page: query.page,
      pageSize: query.pageSize,
      upcomingOnly:
        query.upcomingOnly === '1' || query.upcomingOnly === 'true',
    });
  }

  @Get('students/overview')
  findStudentsOverview(
    @CurrentUser() user: AuthUser,
    @Query() query: InstructorNoteStudentsQueryDto,
  ) {
    return this.instructorNotesService.findStudentsOverview(user.userId, {
      q: query.q,
      sort: query.sort,
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.instructorNotesService.findOne(user.userId, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateInstructorNoteDto,
  ) {
    return this.instructorNotesService.update(user.userId, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.instructorNotesService.remove(user.userId, id);
  }
}
