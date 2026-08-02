import { apiRequest, getApiUrl } from "@/lib/api";

export type Profile = {
  id: string;
  userId: string;
  bio: string | null;
  phone: string | null;
  avatarUrl: string | null;
  city: string | null;
  country: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProfileInput = {
  fullName?: string;
  bio?: string;
  phone?: string;
  avatarUrl?: string;
  city?: string;
  country?: string;
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
