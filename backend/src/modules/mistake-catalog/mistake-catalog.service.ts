import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateMistakeCategoryDto,
  CreateMistakeSeverityDto,
  UpdateMistakeCategoryDto,
  UpdateMistakeSeverityDto,
} from './dto/mistake-catalog.dto';
import {
  DEFAULT_MISTAKE_CATEGORIES,
  DEFAULT_MISTAKE_SEVERITIES,
} from './mistake-catalog.defaults';

const categorySelect = {
  id: true,
  code: true,
  label: true,
  icon: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

const severitySelect = {
  id: true,
  code: true,
  label: true,
  sortOrder: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class MistakeCatalogService implements OnModuleInit {
  private readonly logger = new Logger(MistakeCatalogService.name);

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    void this.ensureDefaults().catch((error: unknown) => {
      this.logger.error(
        `Mistake catalog defaults failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    });
  }

  async ensureDefaults() {
    for (const def of DEFAULT_MISTAKE_CATEGORIES) {
      await this.prisma.mistakeCategory.upsert({
        where: { id: def.id },
        create: {
          id: def.id,
          code: def.code,
          label: def.label,
          icon: def.icon,
          sortOrder: def.sortOrder,
        },
        update: {
          label: def.label,
          icon: def.icon,
          sortOrder: def.sortOrder,
        },
      });
    }
    for (const def of DEFAULT_MISTAKE_SEVERITIES) {
      await this.prisma.mistakeSeverityLevel.upsert({
        where: { id: def.id },
        create: {
          id: def.id,
          code: def.code,
          label: def.label,
          sortOrder: def.sortOrder,
        },
        update: {
          label: def.label,
          sortOrder: def.sortOrder,
        },
      });
    }
  }

  async listActiveCategories() {
    await this.ensureDefaults();
    return this.prisma.mistakeCategory.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
      select: categorySelect,
    });
  }

  async listActiveSeverities() {
    await this.ensureDefaults();
    return this.prisma.mistakeSeverityLevel.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
      select: severitySelect,
    });
  }

  async listCategoriesForAdmin() {
    await this.ensureDefaults();
    const items = await this.prisma.mistakeCategory.findMany({
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
      select: {
        ...categorySelect,
        _count: { select: { mistakes: true } },
      },
    });
    return items.map(({ _count, ...rest }) => ({
      ...rest,
      mistakeCount: _count.mistakes,
    }));
  }

  async listSeveritiesForAdmin() {
    await this.ensureDefaults();
    const items = await this.prisma.mistakeSeverityLevel.findMany({
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
      select: {
        ...severitySelect,
        _count: { select: { mistakes: true } },
      },
    });
    return items.map(({ _count, ...rest }) => ({
      ...rest,
      mistakeCount: _count.mistakes,
    }));
  }

  async createCategory(dto: CreateMistakeCategoryDto) {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.prisma.mistakeCategory.findUnique({
      where: { code },
    });
    if (existing) {
      throw new ConflictException('Category code already exists');
    }
    return this.prisma.mistakeCategory.create({
      data: {
        code,
        label: dto.label.trim(),
        icon: dto.icon?.trim() || '📝',
        sortOrder: dto.sortOrder ?? 0,
      },
      select: categorySelect,
    });
  }

  async updateCategory(id: string, dto: UpdateMistakeCategoryDto) {
    await this.requireCategory(id);
    return this.prisma.mistakeCategory.update({
      where: { id },
      data: {
        ...(dto.label !== undefined ? { label: dto.label.trim() } : {}),
        ...(dto.icon !== undefined ? { icon: dto.icon.trim() || '📝' } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      select: categorySelect,
    });
  }

  async deleteCategory(id: string) {
    const category = await this.requireCategory(id);
    const count = await this.prisma.drivingMistake.count({
      where: { categoryId: id },
    });
    if (count > 0) {
      throw new BadRequestException(
        'Cannot delete: mistakes reference this category. Deactivate it instead.',
      );
    }
    await this.prisma.mistakeCategory.delete({ where: { id: category.id } });
    return { ok: true };
  }

  async createSeverity(dto: CreateMistakeSeverityDto) {
    const code = dto.code.trim().toUpperCase();
    const existing = await this.prisma.mistakeSeverityLevel.findUnique({
      where: { code },
    });
    if (existing) {
      throw new ConflictException('Severity code already exists');
    }
    return this.prisma.mistakeSeverityLevel.create({
      data: {
        code,
        label: dto.label.trim(),
        sortOrder: dto.sortOrder ?? 0,
      },
      select: severitySelect,
    });
  }

  async updateSeverity(id: string, dto: UpdateMistakeSeverityDto) {
    await this.requireSeverity(id);
    return this.prisma.mistakeSeverityLevel.update({
      where: { id },
      data: {
        ...(dto.label !== undefined ? { label: dto.label.trim() } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      select: severitySelect,
    });
  }

  async deleteSeverity(id: string) {
    const severity = await this.requireSeverity(id);
    const count = await this.prisma.drivingMistake.count({
      where: { severityId: id },
    });
    if (count > 0) {
      throw new BadRequestException(
        'Cannot delete: mistakes reference this severity. Deactivate it instead.',
      );
    }
    await this.prisma.mistakeSeverityLevel.delete({ where: { id: severity.id } });
    return { ok: true };
  }

  async requireActiveCategoryId(categoryId: string) {
    const category = await this.prisma.mistakeCategory.findFirst({
      where: { id: categoryId, isActive: true },
      select: { id: true },
    });
    if (!category) {
      throw new BadRequestException('Invalid or inactive mistake category');
    }
    return category.id;
  }

  async resolveActiveSeverityId(severityId?: string) {
    if (!severityId) return null;
    const severity = await this.prisma.mistakeSeverityLevel.findFirst({
      where: { id: severityId, isActive: true },
      select: { id: true },
    });
    if (!severity) {
      throw new BadRequestException('Invalid or inactive severity level');
    }
    return severity.id;
  }

  private async requireCategory(id: string) {
    const category = await this.prisma.mistakeCategory.findUnique({
      where: { id },
    });
    if (!category) {
      throw new NotFoundException('Mistake category not found');
    }
    return category;
  }

  private async requireSeverity(id: string) {
    const severity = await this.prisma.mistakeSeverityLevel.findUnique({
      where: { id },
    });
    if (!severity) {
      throw new NotFoundException('Mistake severity not found');
    }
    return severity;
  }
}
