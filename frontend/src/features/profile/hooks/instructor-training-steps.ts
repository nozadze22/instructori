import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toastApiError } from "@/lib/toast-api";

import {
  createProfileTrainingStep,
  deleteProfileTrainingStep,
  getProfileTrainingSteps,
  updateProfileTrainingStep,
  type TrainingStepInput,
} from "@/features/profile/api/instructor-training-steps";

const queryKey = ["profile", "training-steps"];

export function useProfileTrainingSteps(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey,
    queryFn: getProfileTrainingSteps,
    enabled: options?.enabled ?? true,
  });
}

function refresh(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey });
  void queryClient.invalidateQueries({ queryKey: ["instructors"] });
}

export function useCreateProfileTrainingStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: TrainingStepInput) => createProfileTrainingStep(input),
    onSuccess: () => {
      refresh(queryClient);
      toast.success("სწავლების ეტაპი დაემატა");
    },
    onError: (error) => toastApiError(error, "ეტაპის დამატება ვერ მოხერხდა."),
  });
}

export function useUpdateProfileTrainingStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: Partial<TrainingStepInput>;
    }) => updateProfileTrainingStep(id, input),
    onSuccess: () => {
      refresh(queryClient);
      toast.success("სწავლების ეტაპი განახლდა");
    },
    onError: (error) => toastApiError(error, "ეტაპის განახლება ვერ მოხერხდა."),
  });
}

export function useDeleteProfileTrainingStep() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProfileTrainingStep(id),
    onSuccess: () => {
      refresh(queryClient);
      toast.success("სწავლების ეტაპი წაიშალა");
    },
    onError: (error) => toastApiError(error, "ეტაპის წაშლა ვერ მოხერხდა."),
  });
}
