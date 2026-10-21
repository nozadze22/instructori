import type { AuthUser } from "@/features/auth/login/api/login";
import type { InstructorDirectoryItem } from "@/features/instructors/api/instructors";
import type { Profile } from "@/features/profile/api/profile";

export function mapMeToInstructorDirectoryItem(
  me: AuthUser,
  profile?: Profile | null,
): InstructorDirectoryItem {
  return {
    id: me.userId,
    fullName: me.fullName,
    email: me.email,
    createdAt: profile?.createdAt ?? new Date().toISOString(),
    instructorCategories: profile?.instructorCategories ?? [],
    bio: profile?.bio ?? null,
    phone: profile?.phone ?? null,
    avatarUrl: profile?.avatarUrl ?? null,
    city: profile?.city ?? null,
    workingHours: profile?.workingHours ?? null,
    studentCount: 0,
  };
}
