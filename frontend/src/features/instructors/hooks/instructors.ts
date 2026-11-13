import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toastApiError } from "@/lib/toast-api";

import {
  getInstructor,
  getInstructorConversationStatus,
  getInstructorMessages,
  getInstructors,
  acceptInstructorMessage,
  rejectInstructorMessage,
  sendInstructorMessage,
} from "@/features/instructors/api/instructors";

export function useInstructors() {
  return useQuery({
    queryKey: ["instructors"],
    queryFn: getInstructors,
    retry: false,
  });
}

export function useInstructor(id: string) {
  return useQuery({
    queryKey: ["instructors", id],
    queryFn: () => getInstructor(id),
    enabled: Boolean(id),
    retry: false,
  });
}

export function useInstructorConversationStatus(
  instructorId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: ["instructors", instructorId, "conversation-status"],
    queryFn: () => getInstructorConversationStatus(instructorId),
    enabled: options?.enabled ?? Boolean(instructorId),
    retry: false,
    refetchInterval: (query) =>
      query.state.data?.status === "PENDING" ? 4_000 : false,
  });
}

export function useSendInstructorMessage(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["instructors", id, "message"],
    mutationFn: (message: string) => sendInstructorMessage(id, message),
    onSuccess: () => {
      toast.success(
        "მოთხოვნა გაიგზავნა — ინსტრუქტორი დათანხმების შემდეგ გაიხსნება ჩატი.",
      );
      void queryClient.invalidateQueries({
        queryKey: ["instructors", id, "conversation-status"],
      });
    },
    onError: (error: Error) => {
      toastApiError(error, "შეტყობინება ვერ გაიგზავნა.");
    },
  });
}

export function useInstructorMessages() {
  return useQuery({
    queryKey: ["instructor-messages"],
    queryFn: getInstructorMessages,
    retry: false,
  });
}

export function useAcceptInstructorMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["instructor-messages", "accept"],
    mutationFn: (id: string) => acceptInstructorMessage(id),
    onSuccess: () => {
      toast.success("მოთხოვნა დამტკიცდა — გაიხსნა ჩატი (სტუდენტად არ ითვლება).");
      void queryClient.invalidateQueries({ queryKey: ["instructor-messages"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      void queryClient.invalidateQueries({ queryKey: ["instructors"] });
      void queryClient.invalidateQueries({ queryKey: ["chat", "conversations"] });
    },
    onError: (error: Error) => {
      toastApiError(error, "მოთხოვნა ვერ დამტკიცდა.");
    },
  });
}

export function useRejectInstructorMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["instructor-messages", "reject"],
    mutationFn: (id: string) => rejectInstructorMessage(id),
    onSuccess: () => {
      toast.success("მოთხოვნა უარყოფილია.");
      void queryClient.invalidateQueries({ queryKey: ["instructor-messages"] });
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (error: Error) => {
      toastApiError(error, "მოთხოვნა ვერ უარყოფილ იქნა.");
    },
  });
}
