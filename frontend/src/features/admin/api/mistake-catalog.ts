import { apiRequest } from "@/lib/api";
import type {
  MistakeCategory,
  MistakeSeverityLevel,
} from "@/features/driving-practice/api/mistake-catalog";

export type AdminMistakeCategory = MistakeCategory & {
  mistakeCount: number;
  createdAt: string;
  updatedAt: string;
};

export type AdminMistakeSeverity = MistakeSeverityLevel & {
  mistakeCount: number;
  createdAt: string;
  updatedAt: string;
};

export async function listAdminMistakeCategories() {
  return apiRequest<AdminMistakeCategory[]>("/admin/mistake-catalog/categories");
}

export async function createMistakeCategory(data: {
  code: string;
  label: string;
  icon?: string;
  sortOrder?: number;
}) {
  return apiRequest<MistakeCategory>("/admin/mistake-catalog/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMistakeCategory(
  id: string,
  data: Partial<{
    label: string;
    icon: string;
    sortOrder: number;
    isActive: boolean;
  }>,
) {
  return apiRequest<MistakeCategory>(`/admin/mistake-catalog/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteMistakeCategory(id: string) {
  return apiRequest<{ ok: boolean }>(
    `/admin/mistake-catalog/categories/${id}`,
    { method: "DELETE" },
  );
}

export async function listAdminMistakeSeverities() {
  return apiRequest<AdminMistakeSeverity[]>("/admin/mistake-catalog/severities");
}

export async function createMistakeSeverity(data: {
  code: string;
  label: string;
  sortOrder?: number;
}) {
  return apiRequest<MistakeSeverityLevel>("/admin/mistake-catalog/severities", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateMistakeSeverity(
  id: string,
  data: Partial<{ label: string; sortOrder: number; isActive: boolean }>,
) {
  return apiRequest<MistakeSeverityLevel>(
    `/admin/mistake-catalog/severities/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}

export async function deleteMistakeSeverity(id: string) {
  return apiRequest<{ ok: boolean }>(
    `/admin/mistake-catalog/severities/${id}`,
    { method: "DELETE" },
  );
}
