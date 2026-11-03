import { getApiUrl } from "@/lib/api";

export type InstructorVehicle = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  tag: string | null;
  sortOrder: number;
  images: { id: string; imageUrl: string; sortOrder: number }[];
};

export type CreateInstructorVehicleInput = {
  title: string;
  description?: string;
  tag?: string;
  files: File[];
};

export type UpdateInstructorVehicleInput = {
  title?: string;
  description?: string;
  tag?: string;
};

async function parseError(response: Response, fallback: string) {
  const text = (await response.text()).trim();
  let message: string | undefined;

  if (text) {
    try {
      const payload = JSON.parse(text) as {
        message?: string | string[];
      };
      message = Array.isArray(payload.message)
        ? payload.message[0]
        : payload.message;
    } catch {
      message = text;
    }
  }

  // Never expose Nest/Prisma's technical 500 response to the user.
  if (
    response.status >= 500 ||
    !message ||
    message.toLowerCase() === "internal server error"
  ) {
    throw new Error(fallback);
  }

  throw new Error(message);
}

export async function getProfileVehicles(): Promise<InstructorVehicle[]> {
  const response = await fetch(getApiUrl("/profile/vehicles"), {
    method: "GET",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    await parseError(response, "ავტოპარკის წამოღება ვერ მოხერხდა");
  }

  return (await response.json()) as InstructorVehicle[];
}

export async function createProfileVehicle(
  input: CreateInstructorVehicleInput,
): Promise<InstructorVehicle> {
  const formData = new FormData();
  input.files.forEach((file) => formData.append("files", file));
  formData.append("title", input.title.trim());
  if (input.description?.trim()) {
    formData.append("description", input.description.trim());
  }
  if (input.tag?.trim()) formData.append("tag", input.tag.trim());

  const response = await fetch(getApiUrl("/profile/vehicles"), {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    await parseError(response, "მანქანის დამატება ვერ მოხერხდა");
  }

  return (await response.json()) as InstructorVehicle;
}

export async function deleteProfileVehicle(id: string): Promise<void> {
  const response = await fetch(getApiUrl(`/profile/vehicles/${id}`), {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    await parseError(response, "მანქანის წაშლა ვერ მოხერხდა");
  }
}

export async function updateProfileVehicle(
  id: string,
  input: UpdateInstructorVehicleInput,
): Promise<InstructorVehicle> {
  const response = await fetch(getApiUrl(`/profile/vehicles/${id}`), {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    await parseError(response, "მანქანის განახლება ვერ მოხერხდა");
  }

  return (await response.json()) as InstructorVehicle;
}

export async function replaceProfileVehiclePhoto(
  id: string,
  file: File,
): Promise<InstructorVehicle> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(getApiUrl(`/profile/vehicles/${id}/photo`), {
    method: "POST",
    credentials: "include",
    body: formData,
  });

  if (!response.ok) {
    await parseError(response, "ფოტოს განახლება ვერ მოხერხდა");
  }

  return (await response.json()) as InstructorVehicle;
}
