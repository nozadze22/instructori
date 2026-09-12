import type { Query, QueryClient } from "@tanstack/react-query";

import type {
  PublicRoutesResponse,
  Route,
  RoutesListResponse,
} from "@/features/routes/api/routes";

type RouteSavedSnapshot = {
  routeId: string;
  publicCatalog: Array<[readonly unknown[], PublicRoutesResponse | undefined]>;
  publicDetail: Route | undefined;
  routeDetail: Route | undefined;
  routesLists: Array<[readonly unknown[], RoutesListResponse | undefined]>;
  savedList: Route[] | undefined;
};

function isRoutesListQuery(query: Query) {
  return (
    query.queryKey[0] === "routes" &&
    query.queryKey.length === 2 &&
    typeof query.queryKey[1] === "object" &&
    query.queryKey[1] !== null
  );
}

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

  const routesLists = queryClient.getQueriesData<RoutesListResponse>({
    predicate: isRoutesListQuery,
  });
  for (const [, list] of routesLists) {
    const match = list?.items.find((route) => route.id === routeId);
    if (match) return match;
  }

  return undefined;
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
    routesLists: queryClient.getQueriesData<RoutesListResponse>({
      predicate: isRoutesListQuery,
    }),
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
  for (const [key, value] of snapshot.routesLists) {
    queryClient.setQueryData(key, value);
  }
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

  queryClient.setQueriesData<RoutesListResponse>(
    { predicate: isRoutesListQuery },
    (list) => {
      if (!list?.items) return list;
      return {
        ...list,
        items: patchRouteInList(list.items, routeId, isSaved),
      };
    },
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
