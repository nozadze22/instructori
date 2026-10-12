import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { MistakeCatalogService } from '../mistake-catalog/mistake-catalog.service';
import {
  CreateMistakeNoteDto,
  MistakeNoteItemDto,
  UpdateMistakeNoteDto,
} from './dto/mistake-note.dto';

const noteInclude = {
  route: {
    select: {
      id: true,
      title: true,
      city: true,
      sourceKey: true,
    },
  },
} as const;

@Injectable()
export class MistakeNotesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mistakeCatalog: MistakeCatalogService,
  ) {}

  async create(instructorId: string, dto: CreateMistakeNoteDto) {
    const route = await this.requireRoute(dto.routeId);
    const city = this.resolveCity(dto.city, route.city);
    const mistakes = await this.normalizeMistakes(dto.mistakes);
    const practicedAt = this.parsePracticedAt(dto.practicedAt);

    return this.prisma.mistakeNote.create({
      data: {
        instructorId,
        studentName: dto.studentName.trim(),
        routeId: dto.routeId,
        city,
        mistakes: mistakes as Prisma.InputJsonValue,
        ...(practicedAt ? { practicedAt } : {}),
      },
      include: noteInclude,
    });
  }

  findAll(
    instructorId: string,
    filters: { studentName?: string; city?: string; routeId?: string },
  ) {
    return this.prisma.mistakeNote.findMany({
      where: {
        instructorId,
        ...(filters.studentName
          ? {
              studentName: {
                contains: filters.studentName.trim(),
                mode: 'insensitive',
              },
            }
          : {}),
        ...(filters.city ? { city: filters.city } : {}),
        ...(filters.routeId ? { routeId: filters.routeId } : {}),
      },
      orderBy: { practicedAt: 'desc' },
      include: noteInclude,
    });
  }

  async findOne(instructorId: string, id: string) {
    const note = await this.prisma.mistakeNote.findUnique({
      where: { id },
      include: noteInclude,
    });
    if (!note) {
      throw new NotFoundException('Mistake note not found');
    }
    if (note.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this mistake note');
    }
    return note;
  }

  async update(instructorId: string, id: string, dto: UpdateMistakeNoteDto) {
    const existing = await this.findOne(instructorId, id);

    const routeId = dto.routeId ?? existing.routeId;
    const route =
      dto.routeId || dto.city ? await this.requireRoute(routeId) : null;

    const city =
      dto.city !== undefined
        ? this.resolveCity(dto.city, route?.city ?? null)
        : dto.routeId && route
          ? this.resolveCity(existing.city, route.city)
          : undefined;

    return this.prisma.mistakeNote.update({
      where: { id },
      data: {
        ...(dto.studentName !== undefined
          ? { studentName: dto.studentName.trim() }
          : {}),
        ...(dto.routeId !== undefined ? { routeId } : {}),
        ...(city !== undefined ? { city } : {}),
        ...(dto.mistakes !== undefined
          ? {
              mistakes: (await this.normalizeMistakes(
                dto.mistakes,
              )) as Prisma.InputJsonValue,
            }
          : {}),
        ...(dto.practicedAt !== undefined
          ? { practicedAt: this.parsePracticedAt(dto.practicedAt) ?? undefined }
          : {}),
      },
      include: noteInclude,
    });
  }

  async remove(instructorId: string, id: string) {
    await this.findOne(instructorId, id);
    await this.prisma.mistakeNote.delete({ where: { id } });
    return { ok: true };
  }

  private async requireRoute(routeId: string) {
    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      select: { id: true, city: true, title: true },
    });
    if (!route) {
      throw new NotFoundException('Route not found');
    }
    return route;
  }

  private resolveCity(requestedCity: string, routeCity: string | null) {
    if (routeCity?.trim()) {
      return routeCity.trim();
    }
    return requestedCity.trim();
  }

  private parsePracticedAt(value?: string) {
    if (!value?.trim()) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('Invalid practice date');
    }
    return date;
  }

  private async normalizeMistakes(mistakes: unknown) {
    if (!Array.isArray(mistakes) || mistakes.length === 0) {
      throw new BadRequestException('At least one mistake is required');
    }

    const normalized: Array<{
      categoryId: string;
      severityId: string | null;
      note: string | null;
    }> = [];

    for (const raw of mistakes) {
      if (typeof raw === 'string') {
        const note = raw.trim();
        if (!note) continue;
        const otherId = await this.mistakeCatalog.requireActiveCategoryId(
          await this.defaultOtherCategoryId(),
        );
        normalized.push({
          categoryId: otherId,
          severityId: null,
          note,
        });
        continue;
      }

      const item = raw as MistakeNoteItemDto;
      const categoryKey =
        typeof item?.categoryId === 'string' ? item.categoryId.trim() : '';
      if (!categoryKey) {
        throw new BadRequestException('Each mistake must have a category');
      }

      const categoryId =
        await this.mistakeCatalog.requireActiveCategoryId(categoryKey);
      const severityId =
        typeof item.severityId === 'string' && item.severityId.trim()
          ? await this.mistakeCatalog.resolveActiveSeverityId(
              item.severityId.trim(),
            )
          : null;
      const note =
        typeof item.note === 'string' ? item.note.trim() || null : null;
      normalized.push({ categoryId, severityId, note });
    }

    if (normalized.length === 0) {
      throw new BadRequestException('At least one mistake is required');
    }

    return normalized;
  }

  private async defaultOtherCategoryId() {
    const other = await this.prisma.mistakeCategory.findFirst({
      where: { code: 'OTHER', isActive: true },
      select: { id: true },
    });
    if (other) return other.id;
    const any = await this.prisma.mistakeCategory.findFirst({
      where: { isActive: true },
      select: { id: true },
    });
    if (!any) {
      throw new BadRequestException('Mistake catalog is not configured');
    }
    return any.id;
  }
}
