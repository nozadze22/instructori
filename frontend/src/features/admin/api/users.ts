import { apiRequest } from "@/lib/api";
import type {
  AccessSource,
  AccessStatus,
  Role,
} from "@/features/auth/login/api/login";

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  accessStatus: AccessStatus;
  accessSource: AccessSource | null;
  accessGrantedAt: string | null;
  createdAt: string;
};

export type ListUsersResponse = {
  users: AdminUser[];
};

export type UpdateUserAccessResponse = {
  user: AdminUser;
};

export async function listUsers(): Promise<ListUsersResponse> {
  return apiRequest<ListUsersResponse>("/admin/users", {
    method: "GET",
  });
}

export async function updateUserAccess(
  userId: string,
  data: {
    accessStatus: AccessStatus;
    accessSource?: AccessSource;
  },
): Promise<UpdateUserAccessResponse> {
  return apiRequest<UpdateUserAccessResponse>(
    `/admin/users/${userId}/access`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}
