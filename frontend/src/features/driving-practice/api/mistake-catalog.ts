import { apiRequest } from "@/lib/api";

export type MistakeCategory = {
  id: string;
  code: string;
  label: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
};

export type MistakeSeverityLevel = {
  id: string;
  code: string;
  label: string;
  sortOrder: number;
  isActive: boolean;
};

export async function listMistakeCategories() {
  return apiRequest<MistakeCategory[]>("/mistake-catalog/categories");
}

export async function listMistakeSeverities() {
  return apiRequest<MistakeSeverityLevel[]>("/mistake-catalog/severities");
}
