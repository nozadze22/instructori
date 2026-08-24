import type { AuthUser } from "@/features/auth/login/api/login";

export function isAdminUser(user: AuthUser): boolean {
  return user.role === "ADMIN";
}

/** Instructor = registered user (not admin). Uses marshrutebi + profile, not dashboard. */
export function isRegisteredInstructor(user: AuthUser): boolean {
  return user.role === "INSTRUCTOR";
}

export function canAccessInstructorDashboard(user: AuthUser): boolean {
  return isAdminUser(user);
}

export function appHomeForUser(user: {
  role: string;
  accessStatus: string;
}): string {
  if (user.role === "ADMIN") return "/admin";
  if (user.role === "INSTRUCTOR" && user.accessStatus === "PENDING") {
    return "/pending";
  }
  return "/marshrutebi";
}
