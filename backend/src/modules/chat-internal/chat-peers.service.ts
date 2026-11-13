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

const userPeerSelect = {
  id: true,
  fullName: true,
  email: true,
  role: true,
  accessStatus: true,
  profile: { select: { avatarUrl: true } },
} as const;

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
    const peers = new Map<string, ChatPeerDto>();

    const addPeer = (peer: ChatPeerDto) => {
      peers.set(peer.id, peer);
    };

    if (role === 'INSTRUCTOR' || role === 'ADMIN') {
      const accepted = await this.prisma.instructorMessage.findMany({
        where: {
          instructorId: userId,
          status: 'ACCEPTED',
        },
        select: {
          sender: { select: userPeerSelect },
        },
        orderBy: { respondedAt: 'desc' },
      });

      const seenStudents = new Set<string>();
      for (const row of accepted) {
        const student = row.sender;
        if (seenStudents.has(student.id)) continue;
        seenStudents.add(student.id);
        if (student.role !== 'USER' || student.accessStatus !== 'ACTIVE') {
          continue;
        }
        addPeer({
          id: student.id,
          fullName: student.fullName,
          email: student.email,
          role: student.role,
          avatarUrl: student.profile?.avatarUrl ?? null,
          relation: 'student',
        });
      }
    }

    if (role === 'USER') {
      const accepted = await this.prisma.instructorMessage.findMany({
        where: {
          senderId: userId,
          status: 'ACCEPTED',
        },
        select: {
          instructor: { select: userPeerSelect },
        },
        orderBy: { respondedAt: 'desc' },
      });

      const seenInstructors = new Set<string>();
      for (const row of accepted) {
        const instructor = row.instructor;
        if (seenInstructors.has(instructor.id)) continue;
        seenInstructors.add(instructor.id);
        if (
          instructor.role !== 'INSTRUCTOR' ||
          instructor.accessStatus !== 'ACTIVE'
        ) {
          continue;
        }
        addPeer({
          id: instructor.id,
          fullName: instructor.fullName,
          email: instructor.email,
          role: instructor.role,
          avatarUrl: instructor.profile?.avatarUrl ?? null,
          relation: 'instructor',
        });
      }

      const me = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { linkedInstructorId: true },
      });

      if (me?.linkedInstructorId) {
        const classmates = await this.prisma.user.findMany({
          where: {
            role: 'USER',
            linkedInstructorId: me.linkedInstructorId,
            accessStatus: 'ACTIVE',
            id: { not: userId },
          },
          select: userPeerSelect,
          orderBy: { fullName: 'asc' },
        });

        for (const mate of classmates) {
          if (peers.has(mate.id)) continue;
          addPeer({
            id: mate.id,
            fullName: mate.fullName,
            email: mate.email,
            role: mate.role,
            avatarUrl: mate.profile?.avatarUrl ?? null,
            relation: 'classmate',
          });
        }
      }
    }

    return Array.from(peers.values()).sort((a, b) =>
      a.fullName.localeCompare(b.fullName, 'ka'),
    );
  }
}
