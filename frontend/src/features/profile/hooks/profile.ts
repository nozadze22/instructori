import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createProfile,
  getProfile,
  removeProfileAvatar,
  updateProfile,
  uploadProfileAvatar,
  type ProfileInput,
} from "@/features/profile/api/profile";

export function useGetProfile(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => getProfile(),
    retry: false,
    enabled: options?.enabled ?? true,
  });
}

export function useCreateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["profile", "create"],
    mutationFn: async (data: ProfileInput) => {
      try {
        return await createProfile(data);
      } catch (error) {
        console.error("[useCreateProfile]", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data);
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("პროფილი შეიქმნა");
    },
    onError: (error: Error) => {
      console.error("[useCreateProfile:onError]", error);
      toast.error(error.message || "პროფილი ვერ შეიქმნა");
    },
  });
}

export function useUploadProfileAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["profile", "avatar", "upload"],
    mutationFn: (file: File) => uploadProfileAvatar(file),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data);
      toast.success("პროფილის სურათი აიტვირთა");
    },
    onError: (error: Error) => {
      toast.error(error.message || "სურათი ვერ აიტვირთა");
    },
  });
}

export function useRemoveProfileAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["profile", "avatar", "remove"],
    mutationFn: () => removeProfileAvatar(),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data);
      toast.success("პროფილის სურათი წაიშალა");
    },
    onError: (error: Error) => {
      toast.error(error.message || "სურათი ვერ წაიშალა");
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["profile", "update"],
    mutationFn: async (data: ProfileInput) => {
      try {
        return await updateProfile(data);
      } catch (error) {
        console.error("[useUpdateProfile]", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["profile"], data);
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      toast.success("პროფილი განახლდა");
    },
    onError: (error: Error) => {
      console.error("[useUpdateProfile:onError]", error);
      toast.error(error.message || "პროფილი ვერ განახლდა");
    },
  });
}
