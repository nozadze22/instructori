import { useQuery } from "@tanstack/react-query";

import { getDashboard } from "@/features/dashboard/api/dashboard";

export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: () => getDashboard(),
    retry: false,
  });
}
