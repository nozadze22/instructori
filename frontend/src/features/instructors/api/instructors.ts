import { apiRequest } from "@/lib/api";
import type { InstructorVehicle } from "@/features/profile/api/instructor-vehicles";
import type { InstructorTrainingStep } from "@/features/profile/api/instructor-training-steps";
import type { InstructorCertificate } from "@/features/profile/api/instructor-certificates";

export type InstructorDirectoryItem = {
  id: string;
  fullName: string;
  email: string | null;
  createdAt: string;
  instructorCode?: string | null;
  instructorCategories: string[];
  bio: string | null;
  phone: string | null;
  avatarUrl: string | null;
  city: string | null;
  workingHours: string | null;
  hourlyRate: number | null;
  packageDeal: string | null;
  studentCount: number;
  vehicles?: InstructorVehicle[];
  trainingSteps?: InstructorTrainingStep[];
  certificates?: InstructorCertificate[];
};

export type InstructorMessage = {
  id: string;
  message: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  readAt: string | null;
  respondedAt: string | null;
  sender: {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
    city: string | null;
  };
};

export function getInstructors() {
  return apiRequest<InstructorDirectoryItem[]>("/instructors", {
    method: "GET",
  });
}

export function getInstructor(id: string) {
  return apiRequest<InstructorDirectoryItem>(`/instructors/${id}`, {
    method: "GET",
  });
}

export type InstructorConversationStatus =
  | "NONE"
  | "PENDING"
  | "ACCEPTED"
  | "REJECTED";

export function getInstructorConversationStatus(instructorId: string) {
  return apiRequest<{ status: InstructorConversationStatus }>(
    `/instructors/${instructorId}/conversation-status`,
    { method: "GET" },
  );
}

export function sendInstructorMessage(id: string, message: string) {
  return apiRequest<InstructorMessage>(`/instructors/${id}/messages`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export function getInstructorMessages() {
  return apiRequest<InstructorMessage[]>("/instructors/messages", {
    method: "GET",
  });
}

export function acceptInstructorMessage(id: string) {
  return apiRequest<InstructorMessage>(`/instructors/messages/${id}/accept`, {
    method: "PATCH",
  });
}

export function rejectInstructorMessage(id: string) {
  return apiRequest<InstructorMessage>(`/instructors/messages/${id}/reject`, {
    method: "PATCH",
  });
}
