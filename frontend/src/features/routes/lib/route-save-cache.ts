import type { QueryClient } from "@tanstack/react-query";

import type {
  PublicRoutesResponse,
  Route,
} from "@/features/routes/api/routes";

type RouteSavedSnapshot = {
  routeId: string;
  publicCatalog: Array<[readonly unknown[], PublicRoutesResponse | undefined]>;
  publicDetail: Route | undefined;
  routeDetail: Route | undefined;
  routesList: Route[] | undefined;
  savedList: Route[] | undefined;
};

function patchRouteInList(routes: Route[], routeId: string, isSaved: boolean) {
  return routes.map((route) =>
    route.id === routeId ? { ...route, isSaved } : route,
  );
}

function findRouteInCaches(
  queryClient: QueryClient,
  routeId: string,
): Route | undefined {
  const detail = queryClient.getQueryData<Route>([
    "routes",
    "public",
    "detail",
    routeId,
  ]);
  if (detail) return detail;

  const catalogs = queryClient.getQueriesData<PublicRoutesResponse>({
    queryKey: ["routes", "public"],
  });
  for (const [, catalog] of catalogs) {
    const match = catalog?.items.find((route) => route.id === routeId);
    if (match) return match;
  }

  const routesList = queryClient.getQueryData<Route[]>(["routes"]);
  return routesList?.find((route) => route.id === routeId);
}

export function snapshotRouteSavedState(
  queryClient: QueryClient,
  routeId: string,
): RouteSavedSnapshot {
  return {
    routeId,
    publicCatalog: queryClient.getQueriesData<PublicRoutesResponse>({
      queryKey: ["routes", "public"],
    }),
    publicDetail: queryClient.getQueryData<Route>([
      "routes",
      "public",
      "detail",
      routeId,
    ]),
    routeDetail: queryClient.getQueryData<Route>(["routes", routeId]),
    routesList: queryClient.getQueryData<Route[]>(["routes"]),
    savedList: queryClient.getQueryData<Route[]>(["routes", "saved"]),
  };
}

export function restoreRouteSavedSnapshot(
  queryClient: QueryClient,
  snapshot: RouteSavedSnapshot | undefined,
) {
  if (!snapshot) return;

  for (const [key, value] of snapshot.publicCatalog) {
    queryClient.setQueryData(key, value);
  }
  queryClient.setQueryData(
    ["routes", "public", "detail", snapshot.routeId],
    snapshot.publicDetail,
  );
  if (snapshot.routeDetail) {
    queryClient.setQueryData(
      ["routes", snapshot.routeDetail.id],
      snapshot.routeDetail,
    );
  }
  queryClient.setQueryData(["routes"], snapshot.routesList);
  queryClient.setQueryData(["routes", "saved"], snapshot.savedList);
}

export function applyOptimisticRouteSaved(
  queryClient: QueryClient,
  routeId: string,
  isSaved: boolean,
) {
  queryClient.setQueriesData<PublicRoutesResponse>(
    { queryKey: ["routes", "public"] },
    (catalog) => {
      if (!catalog?.items) return catalog;
      return {
        ...catalog,
        items: patchRouteInList(catalog.items, routeId, isSaved),
      };
    },
  );

  queryClient.setQueryData<Route>(
    ["routes", "public", "detail", routeId],
    (route) => (route ? { ...route, isSaved } : route),
  );

  queryClient.setQueryData<Route>(["routes", routeId], (route) =>
    route ? { ...route, isSaved } : route,
  );

  queryClient.setQueryData<Route[]>(["routes"], (routes) =>
    routes ? patchRouteInList(routes, routeId, isSaved) : routes,
  );

  queryClient.setQueryData<Route[]>(["routes", "saved"], (saved) => {
    if (!saved) return saved;

    if (!isSaved) {
      return saved.filter((route) => route.id !== routeId);
    }

    if (saved.some((route) => route.id === routeId)) {
      return patchRouteInList(saved, routeId, true);
    }

    const route = findRouteInCaches(queryClient, routeId);
    return route ? [{ ...route, isSaved: true }, ...saved] : saved;
  });
}
