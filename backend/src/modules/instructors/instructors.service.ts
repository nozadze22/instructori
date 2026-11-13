import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { AuthUser } from '../auth/dto/auth-types';
import { ChatClientService } from '../chat-client/chat-client.service';
import { NotificationClientService } from '../notification-client/notification-client.service';
import { CreateInstructorMessageDto } from './dto/instructor.dto';

const instructorSelect = {
  id: true,
  fullName: true,
  email: true,
  createdAt: true,
  instructorCategories: true,
  profile: {
    select: {
      bio: true,
      phone: true,
      avatarUrl: true,
      city: true,
      workingHours: true,
      hourlyRate: true,
      packageDeal: true,
    },
  },
  _count: {
    select: {
      students: true,
    },
  },
  instructorVehicles: {
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      tag: true,
      images: {
        select: {
          id: true,
          imageUrl: true,
          sortOrder: true,
        },
        orderBy: [{ sortOrder: 'asc' as const }, { createdAt: 'asc' as const }],
      },
      sortOrder: true,
    },
    orderBy: [{ sortOrder: 'asc' as const }, { createdAt: 'asc' as const }],
  },
  trainingSteps: {
    select: {
      id: true,
      title: true,
      description: true,
      sortOrder: true,
    },
    orderBy: [{ sortOrder: 'asc' as const }, { createdAt: 'asc' as const }],
  },
  instructorCertificates: {
    select: {
      id: true,
      title: true,
      description: true,
      imageUrl: true,
      sortOrder: true,
    },
    orderBy: [{ sortOrder: 'asc' as const }, { createdAt: 'asc' as const }],
  },
};

@Injectable()
export class InstructorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationClient: NotificationClientService,
    private readonly chatClient: ChatClientService,
  ) {}

  async listActive() {
    const instructors = await this.prisma.user.findMany({
      where: {
        role: 'INSTRUCTOR',
        accessStatus: 'ACTIVE',
      },
      select: instructorSelect,
      orderBy: { fullName: 'asc' },
    });

    return instructors.map((instructor) =>
      this.toInstructor(instructor, { exposeContact: false }),
    );
  }

  async getActive(id: string) {
    const instructor = await this.prisma.user.findFirst({
      where: {
        id,
        role: 'INSTRUCTOR',
        accessStatus: 'ACTIVE',
      },
      select: instructorSelect,
    });

    if (!instructor) {
      throw new NotFoundException('Instructor not found');
    }

    return this.toInstructor(instructor, { exposeContact: true });
  }

  async sendMessage(
    sender: AuthUser,
    instructorId: string,
    dto: CreateInstructorMessageDto,
  ) {
    if (sender.role !== 'USER') {
      throw new ForbiddenException('Only students can message instructors');
    }

    const instructor = await this.getActive(instructorId);
    const message = dto.message.trim();
    if (message.length < 2) {
      throw new BadRequestException('Message is too short');
    }

    const student = await this.prisma.user.findUnique({
      where: { id: sender.userId },
      select: { linkedInstructorId: true },
    });
    if (
      student?.linkedInstructorId &&
      student.linkedInstructorId !== instructor.id
    ) {
      throw new ConflictException('You are already linked to an instructor');
    }

    const existing = await this.prisma.instructorMessage.findFirst({
      where: {
        senderId: sender.userId,
        instructorId: instructor.id,
        status: { in: ['PENDING', 'ACCEPTED'] },
      },
      select: { id: true, status: true },
      orderBy: { createdAt: 'desc' },
    });
    if (existing?.status === 'ACCEPTED') {
      throw new ConflictException(
        'Conversation already approved — use chat',
      );
    }
    if (existing?.status === 'PENDING') {
      throw new ConflictException('A request is already pending');
    }

    const created = await this.prisma.instructorMessage.create({
      data: {
        senderId: sender.userId,
        instructorId: instructor.id,
        message,
        status: 'PENDING',
      },
      select: this.messageSelect,
    });

    this.notificationClient.publishInstructorMessageCreated({
      messageId: created.id,
      instructorId: instructor.id,
      studentId: sender.userId,
      studentFullName: sender.fullName,
      messagePreview: message.slice(0, 240),
    });

    return this.toMessage(created);
  }

  async getConversationStatus(sender: AuthUser, instructorId: string) {
    if (sender.role !== 'USER') {
      throw new ForbiddenException('Only students can check conversation status');
    }

    await this.getActive(instructorId);

    const row = await this.prisma.instructorMessage.findFirst({
      where: {
        senderId: sender.userId,
        instructorId,
      },
      orderBy: { createdAt: 'desc' },
      select: { status: true },
    });

    return {
      status: row?.status ?? ('NONE' as const),
    };
  }

  async listMessages(instructor: AuthUser) {
    this.assertInstructor(instructor);

    const messages = await this.prisma.instructorMessage.findMany({
      where: { instructorId: instructor.userId },
      select: this.messageSelect,
      orderBy: { createdAt: 'desc' },
    });

    return messages.map((message) => this.toMessage(message));
  }

  async acceptMessage(instructor: AuthUser, messageId: string) {
    this.assertInstructor(instructor);
    const row = await this.findPendingMessage(instructor.userId, messageId);

    const student = await this.prisma.user.findUnique({
      where: { id: row.senderId },
      select: { id: true, fullName: true, role: true, linkedInstructorId: true },
    });
    if (!student || student.role !== 'USER') {
      throw new BadRequestException('Invalid student');
    }
    if (
      student.linkedInstructorId &&
      student.linkedInstructorId !== instructor.userId
    ) {
      throw new ConflictException('Student is already linked elsewhere');
    }

    const now = new Date();
    const updated = await this.prisma.$transaction(async (tx) => {
      const message = await tx.instructorMessage.update({
        where: { id: row.id },
        data: {
          status: 'ACCEPTED',
          readAt: now,
          respondedAt: now,
        },
        select: this.messageSelect,
      });

      return message;
    });

    const instructorProfile = await this.prisma.user.findUnique({
      where: { id: instructor.userId },
      select: { fullName: true },
    });

    this.notificationClient.publishChatRequestAccepted({
      studentId: student.id,
      instructorId: instructor.userId,
      instructorFullName: instructorProfile?.fullName ?? 'ინსტრუქტორი',
    });

    this.chatClient.seedDirectMessage({
      senderId: student.id,
      recipientId: instructor.userId,
      body: row.message,
    });

    return this.toMessage(updated);
  }

  async rejectMessage(instructor: AuthUser, messageId: string) {
    this.assertInstructor(instructor);
    const row = await this.findPendingMessage(instructor.userId, messageId);
    const now = new Date();

    const updated = await this.prisma.instructorMessage.update({
      where: { id: row.id },
      data: {
        status: 'REJECTED',
        readAt: now,
        respondedAt: now,
      },
      select: this.messageSelect,
    });

    return this.toMessage(updated);
  }

  private async findPendingMessage(instructorId: string, messageId: string) {
    const row = await this.prisma.instructorMessage.findFirst({
      where: {
        id: messageId,
        instructorId,
        status: 'PENDING',
      },
      select: { id: true, senderId: true, message: true },
    });
    if (!row) {
      throw new NotFoundException('Pending request not found');
    }
    return row;
  }

  private assertInstructor(user: AuthUser) {
    if (user.role !== 'INSTRUCTOR') {
      throw new ForbiddenException('Only instructors can view these messages');
    }
  }

  private readonly messageSelect = {
    id: true,
    message: true,
    status: true,
    createdAt: true,
    readAt: true,
    respondedAt: true,
    sender: {
      select: {
        id: true,
        fullName: true,
        email: true,
        profile: {
          select: {
            phone: true,
            avatarUrl: true,
            city: true,
          },
        },
      },
    },
  } as const;

  private toInstructor(
    instructor: {
    id: string;
    fullName: string;
    email: string;
    createdAt: Date;
    instructorCategories: string[];
    profile: {
      bio: string | null;
      phone: string | null;
      avatarUrl: string | null;
      city: string | null;
      workingHours: string | null;
      hourlyRate: number | null;
      packageDeal: string | null;
    } | null;
    _count: { students: number };
    instructorVehicles: {
      id: string;
      title: string;
      description: string | null;
      imageUrl: string;
      tag: string | null;
      sortOrder: number;
      images: { id: string; imageUrl: string; sortOrder: number }[];
    }[];
    trainingSteps: {
      id: string;
      title: string;
      description: string;
      sortOrder: number;
    }[];
    instructorCertificates: {
      id: string;
      title: string;
      description: string | null;
      imageUrl: string;
      sortOrder: number;
    }[];
  },
    options: { exposeContact: boolean },
  ) {
    return {
      id: instructor.id,
      fullName: instructor.fullName,
      email: null,
      createdAt: instructor.createdAt,
      instructorCategories: instructor.instructorCategories,
      bio: instructor.profile?.bio ?? null,
      phone: options.exposeContact
        ? (instructor.profile?.phone ?? null)
        : null,
      avatarUrl: instructor.profile?.avatarUrl ?? null,
      city: instructor.profile?.city ?? null,
      workingHours: instructor.profile?.workingHours ?? null,
      hourlyRate: instructor.profile?.hourlyRate ?? null,
      packageDeal: instructor.profile?.packageDeal ?? null,
      studentCount: instructor._count.students,
      vehicles: instructor.instructorVehicles.map((vehicle) => ({
        id: vehicle.id,
        title: vehicle.title,
        description: vehicle.description,
        imageUrl: vehicle.imageUrl,
        tag: vehicle.tag,
        sortOrder: vehicle.sortOrder,
        images: vehicle.images,
      })),
      trainingSteps: instructor.trainingSteps,
      certificates: instructor.instructorCertificates,
    };
  }

  private toMessage(message: {
    id: string;
    message: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    createdAt: Date;
    readAt: Date | null;
    respondedAt: Date | null;
    sender: {
      id: string;
      fullName: string;
      email: string;
      profile: {
        phone: string | null;
        avatarUrl: string | null;
        city: string | null;
      } | null;
    };
  }) {
    return {
      id: message.id,
      message: message.message,
      status: message.status,
      createdAt: message.createdAt,
      readAt: message.readAt,
      respondedAt: message.respondedAt,
      sender: {
        id: message.sender.id,
        fullName: message.sender.fullName,
        email: message.sender.email,
        phone: message.sender.profile?.phone ?? null,
        avatarUrl: message.sender.profile?.avatarUrl ?? null,
        city: message.sender.profile?.city ?? null,
      },
    };
  }
}
