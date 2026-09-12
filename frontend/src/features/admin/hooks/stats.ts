import { useQuery } from "@tanstack/react-query";

import { getAdminStats } from "@/features/admin/api/stats";

export function useAdminStats() {
  return useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => getAdminStats(),
  });
}
