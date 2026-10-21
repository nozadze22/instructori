import { apiRequest } from "@/lib/api";

export type InstructorDirectoryItem = {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  instructorCategories: string[];
  bio: string | null;
  phone: string | null;
  avatarUrl: string | null;
  city: string | null;
  workingHours: string | null;
  studentCount: number;
};

export type InstructorMessage = {
  id: string;
  message: string;
  status: "UNREAD" | "READ";
  createdAt: string;
  readAt: string | null;
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

export function markInstructorMessageRead(id: string) {
  return apiRequest<InstructorMessage>(`/instructors/messages/${id}/read`, {
    method: "PATCH",
  });
}
