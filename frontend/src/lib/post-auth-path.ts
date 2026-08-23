export function defaultPathForUser(user: {
  role: string;
  accessStatus: string;
}): string {
  if (user.role === "ADMIN") return "/admin";
  if (user.accessStatus === "ACTIVE") return "/dashboard";
  return "/pending";
}

export function safeNextPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (value === "admin") return "/admin";
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return null;
}
