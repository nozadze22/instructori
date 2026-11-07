import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { humanizeApiError } from "@/lib/api-errors";
import { toastApiError } from "@/lib/toast-api";

import {
  createProfile,
  createInstructorCode,
  getInstructorGroup,
  getInstructorStudents,
  getProfile,
  joinInstructorGroup,
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

export function useGetInstructorGroup(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["profile", "instructor-group"],
    queryFn: getInstructorGroup,
    retry: false,
    enabled: options?.enabled ?? true,
  });
}

export function useGetInstructorStudents(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["profile", "students"],
    queryFn: getInstructorStudents,
    retry: false,
    enabled: options?.enabled ?? true,
  });
}

export function useCreateInstructorCode() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["profile", "instructor-code", "create"],
    mutationFn: (rotate?: boolean) =>
      createInstructorCode({ rotate: rotate === true }),
    onSuccess: ({ instructorCode }) => {
      queryClient.setQueryData(["profile"], (profile: unknown) =>
        profile && typeof profile === "object"
          ? { ...profile, instructorCode }
          : { instructorCode },
      );
      queryClient.setQueryData(["me"], (me: unknown) =>
        me && typeof me === "object" ? { ...me, instructorCode } : me,
      );
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      void queryClient.invalidateQueries({ queryKey: ["instructors"] });
      toast.success("ინსტრუქტორის კოდი შეიქმნა");
    },
    onError: (error: Error) => {
      toast.error("კოდის შექმნა ვერ მოხერხდა", {
        description: humanizeApiError(error),
      });
    },
  });
}

export function useJoinInstructorGroup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["profile", "instructor-group", "join"],
    mutationFn: (instructorCode: string) => joinInstructorGroup(instructorCode),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", "instructor-group"], data);
      toast.success("ინსტრუქტორის ჯგუფს შეუერთდი");
    },
    onError: (error: Error) => {
      toastApiError(error, "კოდის დადასტურება ვერ მოხერხდა.");
    },
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
      void queryClient.invalidateQueries({ queryKey: ["instructors"] });
      toast.success("პროფილი შეიქმნა");
    },
    onError: (error: Error) => {
      console.error("[useCreateProfile:onError]", error);
      toastApiError(error, "პროფილი ვერ შეიქმნა.");
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
      toastApiError(error, "სურათი ვერ აიტვირთა.");
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
      toastApiError(error, "სურათი ვერ წაიშალა.");
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
      void queryClient.invalidateQueries({ queryKey: ["instructors"] });
      toast.success("პროფილი განახლდა");
    },
    onError: (error: Error) => {
      console.error("[useUpdateProfile:onError]", error);
      toastApiError(error, "პროფილი ვერ განახლდა.");
    },
  });
}
