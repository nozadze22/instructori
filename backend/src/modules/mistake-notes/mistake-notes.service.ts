import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateMistakeNoteDto,
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
  constructor(private readonly prisma: PrismaService) {}

  async create(instructorId: string, dto: CreateMistakeNoteDto) {
    const route = await this.requireRoute(dto.routeId);
    const city = this.resolveCity(dto.city, route.city);
    const mistakes = this.normalizeMistakes(dto.mistakes);

    return this.prisma.mistakeNote.create({
      data: {
        instructorId,
        studentName: dto.studentName.trim(),
        routeId: dto.routeId,
        city,
        mistakes,
        ...(dto.practicedAt ? { practicedAt: new Date(dto.practicedAt) } : {}),
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
          ? { mistakes: this.normalizeMistakes(dto.mistakes) }
          : {}),
        ...(dto.practicedAt !== undefined
          ? { practicedAt: new Date(dto.practicedAt) }
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
    if (routeCity && routeCity !== requestedCity) {
      throw new BadRequestException(
        `City must match the route city (${routeCity})`,
      );
    }
    return requestedCity;
  }

  private normalizeMistakes(mistakes: string[]) {
    const cleaned = mistakes.map((item) => item.trim()).filter(Boolean);
    if (cleaned.length === 0) {
      throw new BadRequestException('At least one mistake is required');
    }
    return cleaned;
  }
}
