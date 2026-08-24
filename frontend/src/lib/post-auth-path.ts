import { appHomeForUser } from "@/lib/auth-paths";

export function defaultPathForUser(user: {
  role: string;
  accessStatus: string;
}): string {
  return appHomeForUser(user);
}

export function safeNextPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value === "admin") return "/admin";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return null;
}

export {
  appHomeForUser,
  canAccessInstructorDashboard,
  isAdminUser,
  isRegisteredInstructor,
} from "@/lib/auth-paths";
