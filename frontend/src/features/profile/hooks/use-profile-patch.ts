"use client";

import { useCallback } from "react";

import { useGetMe } from "@/features/auth/login/hooks/login";
import type { ProfileInput } from "@/features/profile/api/profile";
import {
  useCreateProfile,
  useGetProfile,
  useUpdateProfile,
} from "@/features/profile/hooks/profile";
import { toProfilePayload } from "@/features/profile/schema/profile.schema";
import type { ProfileSchema } from "@/features/profile/schema/profile.schema";

export function useProfilePatch() {
  const { data: me } = useGetMe();
  const { data: profile } = useGetProfile();
  const { mutateAsync: createProfile, isPending: isCreating } =
    useCreateProfile();
  const { mutateAsync: updateProfile, isPending: isUpdating } =
    useUpdateProfile();

  const buildCurrentValues = useCallback((): ProfileSchema => {
    return {
      fullName: me?.fullName ?? "",
      bio: profile?.bio ?? "",
      phone: profile?.phone ?? "",
      city: profile?.city ?? "",
      instructorCategories: profile?.instructorCategories ?? [],
      workingHours: profile?.workingHours ?? "",
      hourlyRate:
        profile?.hourlyRate != null ? String(profile.hourlyRate) : "",
      packageDeal: profile?.packageDeal ?? "",
    };
  }, [me?.fullName, profile]);

  const patchProfile = useCallback(
    async (partial: Partial<ProfileSchema>) => {
      const merged = { ...buildCurrentValues(), ...partial };
      const payload: ProfileInput = toProfilePayload(merged);

      if (!profile) {
        return createProfile(payload);
      }
      return updateProfile(payload);
    },
    [buildCurrentValues, createProfile, profile, updateProfile],
  );

  return {
    profile,
    me,
    patchProfile,
    isPending: isCreating || isUpdating,
  };
}
