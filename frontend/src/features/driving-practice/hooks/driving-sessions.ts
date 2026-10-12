import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createDrivingMistake,
  createDrivingSession,
  finishDrivingSession,
  getDrivingSession,
  getDrivingSessions,
  updateDrivingMistake,
  type CreateDrivingMistakeInput,
  type CreateDrivingSessionInput,
} from "@/features/driving-practice/api/driving-sessions";
import { humanizeApiError } from "@/lib/api-errors";

export function useDrivingSessions(filters?: {
  studentName?: string;
  activeOnly?: boolean;
}) {
  return useQuery({
    queryKey: ["driving-sessions", filters],
    queryFn: () => getDrivingSessions(filters),
  });
}

export function useDrivingSession(sessionId: string) {
  return useQuery({
    queryKey: ["driving-sessions", "detail", sessionId],
    queryFn: () => getDrivingSession(sessionId),
    enabled: Boolean(sessionId),
    refetchInterval: (query) =>
      query.state.data?.endedAt ? false : 15_000,
  });
}

export function useCreateDrivingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["driving-sessions", "create"],
    mutationFn: (data: CreateDrivingSessionInput) => createDrivingSession(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["driving-sessions"] });
    },
    onError: (error) => toast.error(humanizeApiError(error)),
  });
}

export function useCreateDrivingMistake(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["driving-sessions", sessionId, "mistake-create"],
    mutationFn: (data: CreateDrivingMistakeInput) =>
      createDrivingMistake(sessionId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["driving-sessions", "detail", sessionId],
      });
    },
    onError: (error) => toast.error(humanizeApiError(error)),
  });
}

export function useUpdateDrivingMistake(sessionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["driving-sessions", sessionId, "mistake-update"],
    mutationFn: ({
      mistakeId,
      ...data
    }: {
      mistakeId: string;
      severityId?: string | null;
      note?: string;
    }) => updateDrivingMistake(sessionId, mistakeId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["driving-sessions", "detail", sessionId],
      });
    },
    onError: (error) => toast.error(humanizeApiError(error)),
  });
}

export function useFinishDrivingSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["driving-sessions", "finish"],
    mutationFn: (sessionId: string) => finishDrivingSession(sessionId),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["driving-sessions"] });
      queryClient.setQueryData(
        ["driving-sessions", "detail", data.id],
        data,
      );
    },
    onError: (error) => toast.error(humanizeApiError(error)),
  });
}
