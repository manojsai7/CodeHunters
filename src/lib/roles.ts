export type UserRole = "owner" | "admin" | "student";

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  owner: 3,
  admin: 2,
  student: 1,
};

export function hasAccess(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

export function isAdmin(role: string): boolean {
  return role === "admin" || role === "owner";
}

export function isOwner(role: string): boolean {
  return role === "owner";
}
