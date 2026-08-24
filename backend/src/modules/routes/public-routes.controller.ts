import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { OptionalJwtAuthGuard } from '../auth/auth_guard/optional-jwt-auth.guard';
import { CurrentUser } from '../auth/auth_guard/current_user_decorator';
import type { AuthUser } from '../auth/dto/auth-types';
import { RoutesService } from './routes.service';
import { PublicRoutesQueryDto } from './dto/route.dto';

@Controller('public/routes')
export class PublicRoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  catalog(
    @Query() query: PublicRoutesQueryDto,
    @CurrentUser() user?: AuthUser,
  ) {
    return this.routesService.findPublicCatalog(query, user?.userId);
  }

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(@Param('id') id: string, @CurrentUser() user?: AuthUser) {
    return this.routesService.findPublicRoute(id, user?.userId);
  }
}
