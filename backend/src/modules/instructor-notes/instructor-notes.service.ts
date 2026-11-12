import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateInstructorNoteDto,
  UpdateInstructorNoteDto,
} from './dto/instructor-note.dto';

@Injectable()
export class InstructorNotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(instructorId: string, dto: CreateInstructorNoteDto) {
    const student = await this.resolveStudent(
      instructorId,
      dto.studentUserId,
      dto.studentName,
    );

    return this.prisma.instructorNote.create({
      data: {
        instructorId,
        studentName: student.studentName,
        studentUserId: student.studentUserId,
        body: dto.body.trim(),
        nextSessionAt: this.parseOptionalDate(dto.nextSessionAt),
      },
    });
  }

  async findAll(
    instructorId: string,
    filters: {
      studentName?: string;
      studentUserId?: string;
      q?: string;
      sort?: 'newest' | 'oldest';
      page?: number;
      pageSize?: number;
      upcomingOnly?: boolean;
    },
  ) {
    const page = Math.max(1, Number(filters.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(filters.pageSize) || 20));
    const skip = (page - 1) * pageSize;
    const q = filters.q?.trim();

    const where: Prisma.InstructorNoteWhereInput = {
      instructorId,
      ...(filters.studentUserId
        ? { studentUserId: filters.studentUserId }
        : {}),
      ...(filters.studentName
        ? {
            studentName: {
              contains: filters.studentName.trim(),
              mode: 'insensitive',
            },
          }
        : {}),
      ...(filters.upcomingOnly
        ? { nextSessionAt: { gte: new Date() } }
        : {}),
      ...(q
        ? {
            OR: [
              { body: { contains: q, mode: 'insensitive' } },
              { studentName: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.InstructorNoteOrderByWithRelationInput =
      filters.sort === 'oldest'
        ? { createdAt: 'asc' }
        : { createdAt: 'desc' };

    const [items, total] = await Promise.all([
      this.prisma.instructorNote.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      this.prisma.instructorNote.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async findStudentsOverview(
    instructorId: string,
    filters: {
      q?: string;
      sort?: 'recent' | 'most-notes' | 'name-asc' | 'name-desc';
      page?: number;
      pageSize?: number;
    },
  ) {
    const page = Math.max(1, Number(filters.page) || 1);
    const pageSize = Math.min(50, Math.max(1, Number(filters.pageSize) || 20));
    const skip = (page - 1) * pageSize;
    const q = filters.q?.trim();
    const sort = filters.sort ?? 'recent';

    const where: Prisma.UserWhereInput = {
      linkedInstructorId: instructorId,
      role: 'USER',
      ...(q
        ? {
            OR: [
              { fullName: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const orderBy: Prisma.UserOrderByWithRelationInput[] =
      sort === 'name-desc'
        ? [{ fullName: 'desc' }]
        : sort === 'most-notes'
          ? [
              { instructorNotesAbout: { _count: 'desc' } },
              { fullName: 'asc' },
            ]
          : sort === 'name-asc'
            ? [{ fullName: 'asc' }]
            : [{ fullName: 'asc' }];

    // "recent" needs latest note time — fetch candidates then paginate in memory for correctness on moderate lists,
    // but prefer DB order for name/most-notes. For recent we use a two-step with note aggregate.
    if (sort === 'recent') {
      const matched = await this.prisma.user.findMany({
        where,
        select: { id: true },
      });
      const ids = matched.map((row) => row.id);
      if (ids.length === 0) {
        return { items: [], total: 0, page, pageSize, totalPages: 1 };
      }

      const latestByStudent = await this.prisma.instructorNote.groupBy({
        by: ['studentUserId'],
        where: {
          instructorId,
          studentUserId: { in: ids },
        },
        _max: { createdAt: true },
        _count: { _all: true },
      });

      const latestMap = new Map(
        latestByStudent
          .filter((row) => row.studentUserId)
          .map((row) => [
            row.studentUserId as string,
            {
              latestAt: row._max.createdAt?.getTime() ?? 0,
              noteCount: row._count._all,
            },
          ]),
      );

      const ranked = ids
        .map((id) => ({
          id,
          latestAt: latestMap.get(id)?.latestAt ?? 0,
          noteCount: latestMap.get(id)?.noteCount ?? 0,
        }))
        .sort(
          (a, b) =>
            b.latestAt - a.latestAt ||
            b.noteCount - a.noteCount ||
            a.id.localeCompare(b.id),
        );

      const total = ranked.length;
      const pageIds = ranked.slice(skip, skip + pageSize).map((row) => row.id);
      const students = await this.prisma.user.findMany({
        where: { id: { in: pageIds } },
        select: {
          id: true,
          fullName: true,
          email: true,
          createdAt: true,
          profile: {
            select: { avatarUrl: true, phone: true, city: true },
          },
          instructorNotesAbout: {
            where: { instructorId },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { body: true, createdAt: true },
          },
        },
      });
      const studentMap = new Map(students.map((s) => [s.id, s]));
      const items = pageIds
        .map((id) => studentMap.get(id))
        .filter(Boolean)
        .map((student) => {
          const stats = latestMap.get(student!.id);
          const latest = student!.instructorNotesAbout[0] ?? null;
          return {
            id: student!.id,
            fullName: student!.fullName,
            email: student!.email,
            createdAt: student!.createdAt,
            phone: student!.profile?.phone ?? null,
            city: student!.profile?.city ?? null,
            avatarUrl: student!.profile?.avatarUrl ?? null,
            noteCount: stats?.noteCount ?? 0,
            latestNoteAt: latest?.createdAt ?? null,
            latestNoteBody: latest?.body ?? null,
          };
        });

      return {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      };
    }

    const [total, students] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
        select: {
          id: true,
          fullName: true,
          email: true,
          createdAt: true,
          profile: {
            select: { avatarUrl: true, phone: true, city: true },
          },
          _count: {
            select: {
              instructorNotesAbout: true,
            },
          },
          instructorNotesAbout: {
            where: { instructorId },
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { body: true, createdAt: true },
          },
        },
      }),
    ]);

    return {
      items: students.map((student) => {
        const latest = student.instructorNotesAbout[0] ?? null;
        return {
          id: student.id,
          fullName: student.fullName,
          email: student.email,
          createdAt: student.createdAt,
          phone: student.profile?.phone ?? null,
          city: student.profile?.city ?? null,
          avatarUrl: student.profile?.avatarUrl ?? null,
          noteCount: student._count.instructorNotesAbout,
          latestNoteAt: latest?.createdAt ?? null,
          latestNoteBody: latest?.body ?? null,
        };
      }),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    };
  }

  async findOne(instructorId: string, id: string) {
    const note = await this.prisma.instructorNote.findUnique({
      where: { id },
    });
    if (!note) {
      throw new NotFoundException('Note not found');
    }
    if (note.instructorId !== instructorId) {
      throw new ForbiddenException('You do not own this note');
    }
    return note;
  }

  async update(instructorId: string, id: string, dto: UpdateInstructorNoteDto) {
    await this.findOne(instructorId, id);

    const student =
      dto.studentUserId !== undefined || dto.studentName !== undefined
        ? await this.resolveStudent(
            instructorId,
            dto.studentUserId === null ? undefined : dto.studentUserId,
            dto.studentName,
            dto.studentUserId === null,
          )
        : null;

    return this.prisma.instructorNote.update({
      where: { id },
      data: {
        ...(student
          ? {
              studentName: student.studentName,
              studentUserId: student.studentUserId,
            }
          : {}),
        ...(dto.body !== undefined ? { body: dto.body.trim() } : {}),
        ...(dto.nextSessionAt !== undefined
          ? { nextSessionAt: this.parseOptionalDate(dto.nextSessionAt) }
          : {}),
      },
    });
  }

  async remove(instructorId: string, id: string) {
    await this.findOne(instructorId, id);
    await this.prisma.instructorNote.delete({ where: { id } });
    return { ok: true };
  }

  private parseOptionalDate(value?: string | null) {
    if (value === null || value === '') return null;
    if (value === undefined) return undefined;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    return date;
  }

  private async resolveStudent(
    instructorId: string,
    studentUserId: string | undefined,
    studentName: string | undefined,
    clearStudentUser = false,
  ) {
    if (clearStudentUser) {
      return {
        studentUserId: null as string | null,
        studentName: (studentName ?? '').trim() || 'სტუდენტი',
      };
    }

    if (studentUserId) {
      const student = await this.prisma.user.findFirst({
        where: {
          id: studentUserId,
          role: 'USER',
          linkedInstructorId: instructorId,
        },
        select: { id: true, fullName: true },
      });
      if (!student) {
        throw new NotFoundException('Student is not in your group');
      }
      return {
        studentUserId: student.id,
        studentName: student.fullName,
      };
    }

    const name = (studentName ?? '').trim();
    if (!name) {
      throw new NotFoundException('Student name is required');
    }
    return {
      studentUserId: null as string | null,
      studentName: name,
    };
  }
}
