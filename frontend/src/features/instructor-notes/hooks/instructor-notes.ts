import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createInstructorNote,
  deleteInstructorNote,
  getInstructorNote,
  getInstructorNotes,
  getInstructorNoteStudents,
  updateInstructorNote,
  type InstructorNoteFilters,
  type InstructorNoteInput,
  type InstructorNoteStudentsFilters,
} from "@/features/instructor-notes/api/instructor-notes";
import { humanizeApiError } from "@/lib/api-errors";

export function useInstructorNotes(filters?: InstructorNoteFilters) {
  return useQuery({
    queryKey: ["instructor-notes", filters],
    queryFn: () => getInstructorNotes(filters),
  });
}

export function useInstructorNoteStudents(
  filters?: InstructorNoteStudentsFilters,
) {
  return useQuery({
    queryKey: ["instructor-notes", "students-overview", filters],
    queryFn: () => getInstructorNoteStudents(filters),
  });
}

export function useInstructorNote(noteId: string) {
  return useQuery({
    queryKey: ["instructor-notes", "detail", noteId],
    queryFn: () => getInstructorNote(noteId),
    enabled: Boolean(noteId),
  });
}

export function useCreateInstructorNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["instructor-notes", "create"],
    mutationFn: (data: InstructorNoteInput) => createInstructorNote(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["instructor-notes"] });
      toast.success("შენიშვნა შენახულია");
    },
    onError: (error) => toast.error(humanizeApiError(error)),
  });
}

export function useUpdateInstructorNote(noteId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["instructor-notes", "update", noteId],
    mutationFn: (data: Partial<InstructorNoteInput>) =>
      updateInstructorNote(noteId, data),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["instructor-notes"] });
      queryClient.setQueryData(["instructor-notes", "detail", noteId], data);
      toast.success("შენიშვნა განახლდა");
    },
    onError: (error) => toast.error(humanizeApiError(error)),
  });
}

export function useDeleteInstructorNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["instructor-notes", "delete"],
    mutationFn: (id: string) => deleteInstructorNote(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["instructor-notes"] });
      toast.success("შენიშვნა წაიშალა");
    },
    onError: (error) => toast.error(humanizeApiError(error)),
  });
}
