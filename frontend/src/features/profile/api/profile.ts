import { apiRequest, getApiUrl } from "@/lib/api";

export type Profile = {
  id: string;
  userId: string;
  bio: string | null;
  phone: string | null;
  avatarUrl: string | null;
  city: string | null;
  country?: string | null;
  transmissionModes?: string | null;
  workingHours: string | null;
  hourlyRate: number | null;
  packageDeal: string | null;
  instructorCategories: string[];
  instructorCode?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProfileInput = {
  fullName?: string;
  bio?: string;
  phone?: string;
  city?: string;
  workingHours?: string;
  hourlyRate?: number | null;
  packageDeal?: string | null;
  instructorCategories?: string[];
};

export type InstructorGroup = {
  instructor: {
    id: string;
    fullName: string;
    email: string;
    instructorCode: string | null;
  } | null;
};

export type InstructorStudent = {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  phone: string | null;
  city: string | null;
  avatarUrl: string | null;
  practiceCount: number;
};

function toError(error: unknown, fallback: string): Error {
  if (error instanceof Error) {
    return error;
  }
  return new Error(fallback);
}

export async function getProfile(): Promise<Profile | null> {
  try {
    const response = await fetch(getApiUrl("/profile"), {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    // პროფილი ჯერ არ არსებობს — ეს ნორმალურია
    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const text = (await response.text()).trim();
      throw new Error(text || "პროფილის წამოღება ვერ მოხერხდა");
    }

    return (await response.json()) as Profile;
  } catch (error) {
    console.error("[getProfile]", error);
    throw toError(error, "პროფილის წამოღება ვერ მოხერხდა");
  }
}

export async function getInstructorStudents(): Promise<InstructorStudent[]> {
  return apiRequest<InstructorStudent[]>("/profile/students", {
    method: "GET",
  });
}

export async function createInstructorCode(options?: {
  rotate?: boolean;
}): Promise<{
  instructorCode: string;
}> {
  return apiRequest<{ instructorCode: string }>("/profile/instructor-code", {
    method: "POST",
    body: JSON.stringify({ rotate: options?.rotate === true }),
  });
}

export async function createProfile(data: ProfileInput): Promise<Profile> {
  try {
    return await apiRequest<Profile>("/profile", {
      method: "POST",
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("[createProfile]", error);
    throw toError(error, "პროფილი ვერ შეიქმნა");
  }
}

export async function updateProfile(data: ProfileInput): Promise<Profile> {
  try {
    return await apiRequest<Profile>("/profile", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error("[updateProfile]", error);
    throw toError(error, "პროფილი ვერ განახლდა");
  }
}

export async function getInstructorGroup(): Promise<InstructorGroup> {
  return apiRequest<InstructorGroup>("/profile/instructor-group", {
    method: "GET",
  });
}

export async function joinInstructorGroup(
  instructorCode: string,
): Promise<InstructorGroup> {
  return apiRequest<InstructorGroup>("/profile/instructor-group", {
    method: "POST",
    body: JSON.stringify({ instructorCode }),
  });
}

export async function uploadProfileAvatar(file: File): Promise<Profile> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(getApiUrl("/profile/avatar"), {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    const text = (await response.text()).trim();
    throw new Error(text || "სურათი ვერ აიტვირთა");
  }

  return (await response.json()) as Profile;
}

export async function removeProfileAvatar(): Promise<Profile> {
  return apiRequest<Profile>("/profile/avatar", {
    method: "DELETE",
  });
}
