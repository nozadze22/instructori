import { getApiUrl } from "@/lib/api";

export type InstructorCertificate = {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string;
  sortOrder: number;
};

export async function getProfileCertificates() {
  const response = await fetch(getApiUrl("/profile/certificates"), {
    credentials: "include",
  });
  if (!response.ok) throw new Error("სერტიფიკატების წამოღება ვერ მოხერხდა");
  return (await response.json()) as InstructorCertificate[];
}

export async function createProfileCertificate(input: {
  title: string;
  description?: string;
  file: File;
}) {
  const form = new FormData();
  form.append("title", input.title);
  if (input.description) form.append("description", input.description);
  form.append("file", input.file);
  const response = await fetch(getApiUrl("/profile/certificates"), {
    method: "POST",
    credentials: "include",
    body: form,
  });
  if (!response.ok) throw new Error("სერტიფიკატის დამატება ვერ მოხერხდა");
  return (await response.json()) as InstructorCertificate;
}

export function updateProfileCertificate(
  id: string,
  input: { title?: string; description?: string },
) {
  return fetch(getApiUrl(`/profile/certificates/${id}`), {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).then(async (response) => {
    if (!response.ok) throw new Error("სერტიფიკატი ვერ განახლდა");
    return (await response.json()) as InstructorCertificate;
  });
}

export async function replaceProfileCertificatePhoto(id: string, file: File) {
  const form = new FormData();
  form.append("file", file);
  const response = await fetch(getApiUrl(`/profile/certificates/${id}/photo`), {
    method: "POST",
    credentials: "include",
    body: form,
  });
  if (!response.ok) throw new Error("სერტიფიკატის ფოტო ვერ განახლდა");
  return (await response.json()) as InstructorCertificate;
}

export async function deleteProfileCertificate(id: string) {
  const response = await fetch(getApiUrl(`/profile/certificates/${id}`), {
    method: "DELETE",
    credentials: "include",
  });
  if (!response.ok) throw new Error("სერტიფიკატი ვერ წაიშალა");
}
