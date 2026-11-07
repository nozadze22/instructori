import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { toastApiError } from "@/lib/toast-api";

import {
  createProfileVehicle,
  deleteProfileVehicle,
  getProfileVehicles,
  replaceProfileVehiclePhoto,
  updateProfileVehicle,
  type CreateInstructorVehicleInput,
  type UpdateInstructorVehicleInput,
} from "@/features/profile/api/instructor-vehicles";

function showVehicleError(error: unknown, fallback: string) {
  toastApiError(error, fallback);
}

export function useProfileVehicles(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["profile", "vehicles"],
    queryFn: getProfileVehicles,
    enabled: options?.enabled ?? true,
  });
}

export function useCreateProfileVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["profile", "vehicles", "create"],
    mutationFn: (input: CreateInstructorVehicleInput) =>
      createProfileVehicle(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile", "vehicles"] });
      void queryClient.invalidateQueries({ queryKey: ["instructors"] });
      toast.success("მანქანა დაემატა");
    },
    onError: (error) => {
      showVehicleError(error, "მანქანის დამატება ვერ მოხერხდა.");
    },
  });
}

export function useDeleteProfileVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["profile", "vehicles", "delete"],
    mutationFn: (id: string) => deleteProfileVehicle(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile", "vehicles"] });
      void queryClient.invalidateQueries({ queryKey: ["instructors"] });
      toast.success("მანქანა წაიშალა");
    },
    onError: (error) => {
      showVehicleError(error, "მანქანის წაშლა ვერ მოხერხდა.");
    },
  });
}

export function useUpdateProfileVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["profile", "vehicles", "update"],
    mutationFn: ({
      id,
      input,
    }: {
      id: string;
      input: UpdateInstructorVehicleInput;
    }) => updateProfileVehicle(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile", "vehicles"] });
      void queryClient.invalidateQueries({ queryKey: ["instructors"] });
      toast.success("მანქანის მონაცემები განახლდა");
    },
    onError: (error) => {
      showVehicleError(error, "მანქანის განახლება ვერ მოხერხდა.");
    },
  });
}

export function useReplaceProfileVehiclePhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["profile", "vehicles", "photo"],
    mutationFn: ({ id, file }: { id: string; file: File }) =>
      replaceProfileVehiclePhoto(id, file),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["profile", "vehicles"] });
      void queryClient.invalidateQueries({ queryKey: ["instructors"] });
      toast.success("ფოტო განახლდა");
    },
    onError: (error) => {
      showVehicleError(error, "ფოტოს განახლება ვერ მოხერხდა.");
    },
  });
}
