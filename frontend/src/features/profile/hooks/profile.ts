import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createProfile,
  getProfile,
  updateProfile,
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
      toast.success("პროფილი შეიქმნა");
    },
    onError: (error: Error) => {
      console.error("[useCreateProfile:onError]", error);
      toast.error(error.message || "პროფილი ვერ შეიქმნა");
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
      toast.success("პროფილი განახლდა");
    },
    onError: (error: Error) => {
      console.error("[useUpdateProfile:onError]", error);
      toast.error(error.message || "პროფილი ვერ განახლდა");
    },
  });
}
