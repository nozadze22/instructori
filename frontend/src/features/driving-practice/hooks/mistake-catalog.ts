import { useQuery } from "@tanstack/react-query";

import {
  listMistakeCategories,
  listMistakeSeverities,
} from "@/features/driving-practice/api/mistake-catalog";

export function useMistakeCategories() {
  return useQuery({
    queryKey: ["mistake-catalog", "categories"],
    queryFn: () => listMistakeCategories(),
    staleTime: 60_000,
  });
}

export function useMistakeSeverities() {
  return useQuery({
    queryKey: ["mistake-catalog", "severities"],
    queryFn: () => listMistakeSeverities(),
    staleTime: 60_000,
  });
}
