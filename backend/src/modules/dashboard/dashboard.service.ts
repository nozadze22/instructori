import { Injectable } from '@nestjs/common';
import type { AuthUser } from '../auth/dto/auth-types';

@Injectable()
export class DashboardService {
  getOverview(user: AuthUser) {
    return {
      user: {
        userId: user.userId,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        accessStatus: user.accessStatus,
        accessSource: user.accessSource,
      },
      stats: {
        sessionsCompleted: 0,
        hoursTrained: 0,
        upcomingLessons: 0,
      },
      message: 'წვდომა აქტიურია. შეგიძლია დაიწყო ტრენინგი.',
    };
  }
}
