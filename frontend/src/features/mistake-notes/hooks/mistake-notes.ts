import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createMistakeNote,
  deleteMistakeNote,
  getMistakeNote,
  getMistakeNotes,
  updateMistakeNote,
  type CreateMistakeNoteInput,
  type MistakeNoteFilters,
  type UpdateMistakeNoteInput,
} from "@/features/mistake-notes/api/mistake-notes";

export function useMistakeNotes(filters: MistakeNoteFilters = {}) {
  return useQuery({
    queryKey: ["mistake-notes", filters],
    queryFn: () => getMistakeNotes(filters),
  });
}

export function useMistakeNote(id: string) {
  return useQuery({
    queryKey: ["mistake-notes", id],
    queryFn: () => getMistakeNote(id),
    enabled: Boolean(id),
  });
}

export function useCreateMistakeNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["mistake-notes", "create"],
    mutationFn: (data: CreateMistakeNoteInput) => createMistakeNote(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["mistake-notes"] });
      toast.success("შეცდომების ჩანაწერი შეიქმნა");
    },
    onError: (error: Error) => {
      toast.error(error.message || "ჩანაწერი ვერ შეიქმნა");
    },
  });
}

export function useUpdateMistakeNote(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["mistake-notes", "update", id],
    mutationFn: (data: UpdateMistakeNoteInput) => updateMistakeNote(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(["mistake-notes", id], data);
      void queryClient.invalidateQueries({ queryKey: ["mistake-notes"] });
      toast.success("ჩანაწერი განახლდა");
    },
    onError: (error: Error) => {
      toast.error(error.message || "ჩანაწერი ვერ განახლდა");
    },
  });
}

export function useDeleteMistakeNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["mistake-notes", "delete"],
    mutationFn: (id: string) => deleteMistakeNote(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["mistake-notes"] });
      toast.success("ჩანაწერი წაიშალა");
    },
    onError: (error: Error) => {
      toast.error(error.message || "ჩანაწერი ვერ წაიშალა");
    },
  });
}
