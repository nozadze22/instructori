import type { PathPoint } from "@/features/routes/lib/route-actions";

type LatLngLike = {
  lat: number | (() => number);
  lng: number | (() => number);
};

function toLiteral(point: LatLngLike): PathPoint {
  return {
    lat: typeof point.lat === "function" ? point.lat() : point.lat,
    lng: typeof point.lng === "function" ? point.lng() : point.lng,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getGoogleMaps(): any {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = (window as any).google;
  if (!g?.maps) {
    throw new Error("Google Maps ჯერ არ ჩატვირთულა");
  }
  return g.maps;
}

async function buildWithRoutesApi(
  waypoints: PathPoint[],
): Promise<PathPoint[] | null> {
  try {
    const maps = getGoogleMaps();
    const routesLib = await maps.importLibrary("routes");
    if (!routesLib?.Route?.computeRoutes) return null;

    const origin = waypoints[0];
    const destination = waypoints[waypoints.length - 1];
    const intermediates = waypoints.slice(1, -1);

    const { routes } = await routesLib.Route.computeRoutes({
      origin,
      destination,
      intermediates: intermediates.length
        ? intermediates.map((point) => ({ location: point }))
        : undefined,
      travelMode: "DRIVING",
      fields: ["path"],
      region: "GE",
    });

    const path = routes?.[0]?.path as LatLngLike[] | undefined;
    if (!path?.length) return null;
    return path.map(toLiteral);
  } catch {
    return null;
  }
}

async function buildWithDirectionsService(
  waypoints: PathPoint[],
): Promise<PathPoint[]> {
  const maps = getGoogleMaps();
  const service = new maps.DirectionsService();

  const result = await service.route({
    origin: waypoints[0],
    destination: waypoints[waypoints.length - 1],
    waypoints: waypoints.slice(1, -1).map((point) => ({
      location: point,
      stopover: true,
    })),
    travelMode: maps.TravelMode.DRIVING,
    region: "GE",
    provideRouteAlternatives: false,
  });

  const route = result.routes[0];
  if (!route) {
    throw new Error("მარშრუტი ვერ მოიძებნა");
  }

  const path: PathPoint[] = [];
  for (const leg of route.legs) {
    for (const step of leg.steps) {
      for (const point of step.path) {
        path.push(toLiteral(point));
      }
    }
  }

  if (path.length < 2) {
    throw new Error("მარშრუტი ვერ მოიძებნა");
  }

  return path;
}

/** Builds a road-following path from a few clicked waypoints. */
export async function buildDrivingPath(
  waypoints: PathPoint[],
): Promise<PathPoint[]> {
  if (waypoints.length < 2) {
    throw new Error("დაამატე მინიმუმ 2 წერტილი (დასაწყისი და დასასრული)");
  }

  const fromRoutes = await buildWithRoutesApi(waypoints);
  if (fromRoutes?.length) return fromRoutes;

  return buildWithDirectionsService(waypoints);
}
