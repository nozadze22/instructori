import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createRoute,
  deleteRoute,
  getExamCities,
  getRoute,
  getRoutes,
  getSavedRoutes,
  saveRoute,
  syncExamCatalog,
  unsaveRoute,
  updateRoute,
  type CreateRouteInput,
  type UpdateRouteInput,
} from "@/features/routes/api/routes";

export function useRoutes() {
  return useQuery({
    queryKey: ["routes"],
    queryFn: getRoutes,
  });
}

export function useExamCities() {
  return useQuery({
    queryKey: ["routes", "cities"],
    queryFn: getExamCities,
    staleTime: Infinity,
  });
}

export function useSavedRoutes(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["routes", "saved"],
    queryFn: getSavedRoutes,
    enabled: options?.enabled ?? true,
  });
}

export function useRoute(id: string) {
  return useQuery({
    queryKey: ["routes", id],
    queryFn: () => getRoute(id),
    enabled: Boolean(id),
  });
}

export function useCreateRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["routes", "create"],
    mutationFn: (data: CreateRouteInput) => createRoute(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast.success("მარშრუტი შეიქმნა");
    },
    onError: (error: Error) => {
      toast.error(error.message || "მარშრუტი ვერ შეიქმნა");
    },
  });
}

export function useUpdateRoute(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["routes", "update", id],
    mutationFn: (data: UpdateRouteInput) => updateRoute(id, data),
    onSuccess: (data) => {
      queryClient.setQueryData(["routes", id], data);
      void queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast.success("მარშრუტი განახლდა");
    },
    onError: (error: Error) => {
      toast.error(error.message || "მარშრუტი ვერ განახლდა");
    },
  });
}

export function useDeleteRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["routes", "delete"],
    mutationFn: (id: string) => deleteRoute(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast.success("მარშრუტი წაიშალა");
    },
    onError: (error: Error) => {
      toast.error(error.message || "მარშრუტი ვერ წაიშალა");
    },
  });
}

export function useSaveRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["routes", "save"],
    mutationFn: (id: string) => saveRoute(id),
    onSuccess: (data) => {
      queryClient.setQueryData(["routes", data.id], data);
      void queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast.success("მარშრუტი შენახულია");
    },
    onError: (error: Error) => {
      toast.error(error.message || "შენახვა ვერ მოხერხდა");
    },
  });
}

export function useUnsaveRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["routes", "unsave"],
    mutationFn: (id: string) => unsaveRoute(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: ["routes"] });
      void queryClient.invalidateQueries({ queryKey: ["routes", id] });
      toast.success("შენახვა მოიხსნა");
    },
    onError: (error: Error) => {
      toast.error(error.message || "შენახვის მოხსნა ვერ მოხერხდა");
    },
  });
}

export function useSyncExamCatalog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["routes", "sync-exam-catalog"],
    mutationFn: syncExamCatalog,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["routes"] });
      toast.success(
        `სინქი დასრულდა: ${data.created} ახალი, ${data.updated} განახლებული (სულ ${data.total})`,
      );
    },
    onError: (error: Error) => {
      toast.error(error.message || "სინქი ვერ მოხერხდა");
    },
  });
}
