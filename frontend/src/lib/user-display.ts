type UserLike = {
  fullName?: string | null;
  email?: string | null;
};

export function userDisplayName(user: UserLike) {
  return user.fullName?.trim() || user.email || "მომხმარებელი";
}

export function userInitials(user: UserLike) {
  const source = user.fullName?.trim() || user.email?.split("@")[0] || "";
  if (!source) return "U";

  return source
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
