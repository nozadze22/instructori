import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toastApiError } from "@/lib/toast-api";

import {
  getInstructor,
  getInstructorMessages,
  getInstructors,
  markInstructorMessageRead,
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

export function useSendInstructorMessage(id: string) {
  return useMutation({
    mutationKey: ["instructors", id, "message"],
    mutationFn: (message: string) => sendInstructorMessage(id, message),
    onSuccess: () => {
      toast.success("შეტყობინება გაიგზავნა");
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

export function useMarkInstructorMessageRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["instructor-messages", "read"],
    mutationFn: (id: string) => markInstructorMessageRead(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["instructor-messages"] });
    },
    onError: (error: Error) => {
      toastApiError(error, "სტატუსი ვერ განახლდა.");
    },
  });
}
