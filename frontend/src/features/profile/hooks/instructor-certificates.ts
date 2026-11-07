import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toastApiError } from "@/lib/toast-api";
import {
  createProfileCertificate,
  deleteProfileCertificate,
  getProfileCertificates,
  replaceProfileCertificatePhoto,
  updateProfileCertificate,
} from "@/features/profile/api/instructor-certificates";

const key = ["profile", "certificates"];

export function useProfileCertificates(enabled = true) {
  return useQuery({ queryKey: key, queryFn: getProfileCertificates, enabled });
}

function refresh(client: ReturnType<typeof useQueryClient>) {
  void client.invalidateQueries({ queryKey: key });
  void client.invalidateQueries({ queryKey: ["instructors"] });
}

export function useCreateProfileCertificate() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: createProfileCertificate,
    onSuccess: () => {
      refresh(client);
      toast.success("სერტიფიკატი დაემატა");
    },
    onError: (error) => toastApiError(error, "სერტიფიკატის დამატება ვერ მოხერხდა."),
  });
}

export function useUpdateProfileCertificate() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { title?: string; description?: string } }) =>
      updateProfileCertificate(id, input),
    onSuccess: () => {
      refresh(client);
      toast.success("სერტიფიკატი განახლდა");
    },
    onError: (error) => toastApiError(error, "სერტიფიკატი ვერ განახლდა."),
  });
}

export function useDeleteProfileCertificate() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: deleteProfileCertificate,
    onSuccess: () => {
      refresh(client);
      toast.success("სერტიფიკატი წაიშალა");
    },
    onError: (error) => toastApiError(error, "სერტიფიკატი ვერ წაიშალა."),
  });
}

export function useReplaceProfileCertificatePhoto() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      replaceProfileCertificatePhoto(id, file),
    onSuccess: () => {
      refresh(client);
      toast.success("სერტიფიკატის ფოტო განახლდა");
    },
    onError: (error) => toastApiError(error, "სერტიფიკატის ფოტო ვერ განახლდა."),
  });
}
