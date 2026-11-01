import { apiRequest } from "@/lib/api";

export type InstructorTrainingStep = {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type TrainingStepInput = {
  title: string;
  description: string;
  sortOrder?: number;
};

export function getProfileTrainingSteps() {
  return apiRequest<InstructorTrainingStep[]>("/profile/training-steps", {
    method: "GET",
  });
}

export function createProfileTrainingStep(input: TrainingStepInput) {
  return apiRequest<InstructorTrainingStep>("/profile/training-steps", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function updateProfileTrainingStep(
  id: string,
  input: Partial<TrainingStepInput>,
) {
  return apiRequest<InstructorTrainingStep>(`/profile/training-steps/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteProfileTrainingStep(id: string) {
  return apiRequest<{ ok: true }>(`/profile/training-steps/${id}`, {
    method: "DELETE",
  });
}
