import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createRoute,
  deleteRoute,
  getExamCities,
  getPublicRoute,
  getPublicRoutes,
  getRoute,
  getRoutes,
  getSavedRoutes,
  saveRoute,
  syncExamCatalog,
  unsaveRoute,
  updateRoute,
  type CreateRouteInput,
  type PublicRoutesQuery,
  type UpdateRouteInput,
} from "@/features/routes/api/routes";
import {
  applyOptimisticRouteSaved,
  restoreRouteSavedSnapshot,
  snapshotRouteSavedState,
} from "@/features/routes/lib/route-save-cache";

export function useRoutes() {
  return useQuery({
    queryKey: ["routes"],
    queryFn: getRoutes,
  });
}

export function usePublicRoutes(params: PublicRoutesQuery = {}) {
  return useQuery({
    queryKey: ["routes", "public", params],
    queryFn: () => getPublicRoutes(params),
    placeholderData: keepPreviousData,
  });
}

export function usePublicRoute(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["routes", "public", "detail", id],
    queryFn: () => getPublicRoute(id),
    enabled: (options?.enabled ?? true) && Boolean(id),
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

export function useRoute(id: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["routes", id],
    queryFn: () => getRoute(id),
    enabled: (options?.enabled ?? true) && Boolean(id),
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
    onMutate: async (routeId) => {
      await queryClient.cancelQueries({ queryKey: ["routes"] });
      const snapshot = snapshotRouteSavedState(queryClient, routeId);
      applyOptimisticRouteSaved(queryClient, routeId, true);
      return { snapshot, routeId };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["routes", data.id], data);
    },
    onError: (error: Error, _routeId, context) => {
      restoreRouteSavedSnapshot(queryClient, context?.snapshot);
      toast.error(error.message || "შენახვა ვერ მოხერხდა");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["routes", "saved"] });
    },
  });
}

export function useUnsaveRoute() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["routes", "unsave"],
    mutationFn: (id: string) => unsaveRoute(id),
    onMutate: async (routeId) => {
      await queryClient.cancelQueries({ queryKey: ["routes"] });
      const snapshot = snapshotRouteSavedState(queryClient, routeId);
      applyOptimisticRouteSaved(queryClient, routeId, false);
      return { snapshot, routeId };
    },
    onError: (error: Error, _routeId, context) => {
      restoreRouteSavedSnapshot(queryClient, context?.snapshot);
      toast.error(error.message || "შენახვის მოხსნა ვერ მოხერხდა");
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["routes", "saved"] });
    },
  });
}

export function useToggleRouteSave() {
  const saveRouteMutation = useSaveRoute();
  const unsaveRouteMutation = useUnsaveRoute();

  return {
    toggleSave(routeId: string, isSaved: boolean) {
      if (isSaved) unsaveRouteMutation.mutate(routeId);
      else saveRouteMutation.mutate(routeId);
    },
    pendingRouteId:
      saveRouteMutation.isPending
        ? saveRouteMutation.variables
        : unsaveRouteMutation.isPending
          ? unsaveRouteMutation.variables
          : undefined,
  };
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
