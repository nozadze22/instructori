import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  Param,
  Patch,
  Post,
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { AccessGuard } from '../auth/auth_guard/access.guard';
import { JwtAuthGuard } from '../auth/auth_guard/auth_guard';
import { CurrentUser } from '../auth/auth_guard/current_user_decorator';
import { RolesGuard } from '../auth/auth_guard/guard';
import { Roles } from '../auth/auth_guard/roles.decorator';
import type { AuthUser } from '../auth/dto/auth-types';
import {
  CreateRouteDto,
  CreateStepDto,
  NavigationTickDto,
  ReorderStepsDto,
  RouteTtsDto,
  UpdateRouteDto,
  UpdateStepDto,
} from './dto/route.dto';
import { RoutesService } from './routes.service';
import { TtsService } from './tts.service';

@Controller('routes')
@UseGuards(JwtAuthGuard, AccessGuard)
export class RoutesController {
  constructor(
    private readonly routesService: RoutesService,
    private readonly ttsService: TtsService,
  ) {}

  @Post()
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateRouteDto) {
    return this.routesService.create(user, dto);
  }

  @Get()
  findAll(@CurrentUser() user: AuthUser) {
    return this.routesService.findAll(user);
  }

  @Get('cities')
  findCities() {
    return this.routesService.findCities();
  }

  @Post('sync-exam-catalog')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  syncExamCatalog(@CurrentUser() user: AuthUser) {
    return this.routesService.syncExamCatalog(user);
  }

  @Post('tts')
  @Header('Content-Type', 'audio/mpeg')
  @Header('Cache-Control', 'private, max-age=3600')
  async speak(@Body() dto: RouteTtsDto) {
    const audio = await this.ttsService.synthesize(dto.text);
    return new StreamableFile(audio, {
      type: 'audio/mpeg',
      disposition: 'inline',
    });
  }

  @Get('saved')
  findSaved(@CurrentUser() user: AuthUser) {
    return this.routesService.findSaved(user);
  }

  @Get(':id')
  findOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.routesService.findOne(user, id);
  }

  @Post(':id/save')
  save(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.routesService.save(user, id);
  }

  @Delete(':id/save')
  unsave(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.routesService.unsave(user, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateRouteDto,
  ) {
    return this.routesService.update(user, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.routesService.remove(user, id);
  }

  @Post(':id/steps')
  addStep(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: CreateStepDto,
  ) {
    return this.routesService.addStep(user, id, dto);
  }

  @Post(':id/navigation/tick')
  navigationTick(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: NavigationTickDto,
  ) {
    return this.routesService.evaluateNavigationTick(user, id, dto);
  }

  @Patch(':id/steps/reorder')
  reorderSteps(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: ReorderStepsDto,
  ) {
    return this.routesService.reorderSteps(user, id, dto);
  }

  @Patch(':id/steps/:stepId')
  updateStep(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('stepId') stepId: string,
    @Body() dto: UpdateStepDto,
  ) {
    return this.routesService.updateStep(user, id, stepId, dto);
  }

  @Delete(':id/steps/:stepId')
  removeStep(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Param('stepId') stepId: string,
  ) {
    return this.routesService.removeStep(user, id, stepId);
  }
}
