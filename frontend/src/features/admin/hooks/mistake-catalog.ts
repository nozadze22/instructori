import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createMistakeCategory,
  createMistakeSeverity,
  deleteMistakeCategory,
  deleteMistakeSeverity,
  listAdminMistakeCategories,
  listAdminMistakeSeverities,
  updateMistakeCategory,
  updateMistakeSeverity,
} from "@/features/admin/api/mistake-catalog";
import { humanizeApiError } from "@/lib/api-errors";

export function useAdminMistakeCategories() {
  return useQuery({
    queryKey: ["admin", "mistake-catalog", "categories"],
    queryFn: () => listAdminMistakeCategories(),
  });
}

export function useAdminMistakeSeverities() {
  return useQuery({
    queryKey: ["admin", "mistake-catalog", "severities"],
    queryFn: () => listAdminMistakeSeverities(),
  });
}

function invalidateCatalog(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({
    queryKey: ["admin", "mistake-catalog"],
  });
  void queryClient.invalidateQueries({ queryKey: ["mistake-catalog"] });
}

export function useCreateMistakeCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMistakeCategory,
    onSuccess: () => {
      invalidateCatalog(queryClient);
      toast.success("კატეგორია დაემატა");
    },
    onError: (error) => toast.error(humanizeApiError(error)),
  });
}

export function useUpdateMistakeCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: Parameters<typeof updateMistakeCategory>[1] & { id: string }) =>
      updateMistakeCategory(id, data),
    onSuccess: () => {
      invalidateCatalog(queryClient);
      toast.success("განახლდა");
    },
    onError: (error) => toast.error(humanizeApiError(error)),
  });
}

export function useDeleteMistakeCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMistakeCategory,
    onSuccess: () => {
      invalidateCatalog(queryClient);
      toast.success("წაიშალა");
    },
    onError: (error) => toast.error(humanizeApiError(error)),
  });
}

export function useCreateMistakeSeverity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMistakeSeverity,
    onSuccess: () => {
      invalidateCatalog(queryClient);
      toast.success("სიმძიმე დაემატა");
    },
    onError: (error) => toast.error(humanizeApiError(error)),
  });
}

export function useUpdateMistakeSeverity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...data
    }: Parameters<typeof updateMistakeSeverity>[1] & { id: string }) =>
      updateMistakeSeverity(id, data),
    onSuccess: () => {
      invalidateCatalog(queryClient);
      toast.success("განახლდა");
    },
    onError: (error) => toast.error(humanizeApiError(error)),
  });
}

export function useDeleteMistakeSeverity() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMistakeSeverity,
    onSuccess: () => {
      invalidateCatalog(queryClient);
      toast.success("წაიშალა");
    },
    onError: (error) => toast.error(humanizeApiError(error)),
  });
}
