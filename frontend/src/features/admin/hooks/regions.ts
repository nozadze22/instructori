import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  listExamRegions,
  updateExamRegionActive,
  type AdminExamRegion,
} from "@/features/admin/api/regions";

export function useAdminExamRegions() {
  return useQuery({
    queryKey: ["admin", "regions"],
    queryFn: () => listExamRegions(),
  });
}

export function useUpdateExamRegionActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["admin", "regions", "active"],
    mutationFn: ({
      id,
      isActive,
    }: {
      id: string;
      isActive: boolean;
    }) => updateExamRegionActive(id, isActive),
    onSuccess: (data) => {
      queryClient.setQueryData<AdminExamRegion[]>(
        ["admin", "regions"],
        (prev) => {
          if (!prev) return prev;
          return prev.map((region) =>
            region.id === data.id
              ? { ...region, isActive: data.isActive }
              : region,
          );
        },
      );
      void queryClient.invalidateQueries({ queryKey: ["admin", "regions"] });
      void queryClient.invalidateQueries({ queryKey: ["routes"] });
      void queryClient.invalidateQueries({ queryKey: ["public-routes"] });
      toast.success(data.isActive ? "რეგიონი ჩართულია" : "რეგიონი გამორთულია");
    },
    onError: () => {
      toast.error("რეგიონის განახლება ვერ მოხერხდა");
    },
  });
}
