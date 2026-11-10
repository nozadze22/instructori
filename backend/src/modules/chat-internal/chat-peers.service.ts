import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type ChatPeerDto = {
  id: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'INSTRUCTOR' | 'USER';
  avatarUrl: string | null;
  relation: 'instructor' | 'student' | 'classmate' | 'system';
};

@Injectable()
export class ChatPeersService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserSession(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        sessionVersion: true,
        accessStatus: true,
      },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return {
      userId: user.id,
      sessionVersion: user.sessionVersion,
      accessStatus: user.accessStatus,
    };
  }

  async listAllowedPeers(
    userId: string,
    role: 'ADMIN' | 'INSTRUCTOR' | 'USER',
  ): Promise<ChatPeerDto[]> {
    if (role === 'INSTRUCTOR' || role === 'ADMIN') {
      const students = await this.prisma.user.findMany({
        where: {
          role: 'USER',
          linkedInstructorId: userId,
          accessStatus: 'ACTIVE',
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          profile: { select: { avatarUrl: true } },
        },
        orderBy: { fullName: 'asc' },
      });

      return students.map((student) => ({
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        role: student.role,
        avatarUrl: student.profile?.avatarUrl ?? null,
        relation: 'student' as const,
      }));
    }

    if (role === 'USER') {
      const me = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          linkedInstructorId: true,
          linkedInstructor: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
              accessStatus: true,
              profile: { select: { avatarUrl: true } },
            },
          },
        },
      });

      if (!me?.linkedInstructorId) {
        return [];
      }

      const peers: ChatPeerDto[] = [];

      if (
        me.linkedInstructor &&
        me.linkedInstructor.accessStatus === 'ACTIVE'
      ) {
        peers.push({
          id: me.linkedInstructor.id,
          fullName: me.linkedInstructor.fullName,
          email: me.linkedInstructor.email,
          role: me.linkedInstructor.role,
          avatarUrl: me.linkedInstructor.profile?.avatarUrl ?? null,
          relation: 'instructor',
        });
      }

      const classmates = await this.prisma.user.findMany({
        where: {
          role: 'USER',
          linkedInstructorId: me.linkedInstructorId,
          accessStatus: 'ACTIVE',
          id: { not: userId },
        },
        select: {
          id: true,
          fullName: true,
          email: true,
          role: true,
          profile: { select: { avatarUrl: true } },
        },
        orderBy: { fullName: 'asc' },
      });

      for (const mate of classmates) {
        peers.push({
          id: mate.id,
          fullName: mate.fullName,
          email: mate.email,
          role: mate.role,
          avatarUrl: mate.profile?.avatarUrl ?? null,
          relation: 'classmate',
        });
      }

      return peers;
    }

    return [];
  }
}
