"use client";

import { useMemo } from "react";

import type { PathPoint, RouteAction } from "@/features/routes/lib/route-actions";
import { actionLabel } from "@/features/routes/lib/route-actions";
import { cn } from "@/lib/utils";

type RouteMapSvgFallbackProps = {
  path: PathPoint[];
  commands: Array<{
    lat: number;
    lng: number;
    action: RouteAction;
    label?: string;
  }>;
  activeIndex?: number | null;
  vehiclePosition?: PathPoint | null;
  showCommandMarkers?: boolean;
  showVehicleMarker?: boolean;
  traveledPath?: PathPoint[];
  aheadPath?: PathPoint[];
  className?: string;
};

type ProjectedPoint = { x: number; y: number };

type Projection = {
  project: (point: PathPoint) => ProjectedPoint;
};

function createProjection(
  points: PathPoint[],
  width: number,
  height: number,
  padding: number,
): Projection {
  if (points.length === 0) {
    return {
      project: () => ({ x: width / 2, y: height / 2 }),
    };
  }

  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latSpan = Math.max(maxLat - minLat, 0.0008);
  const lngSpan = Math.max(maxLng - minLng, 0.0008);
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  return {
    project: (point) => ({
      x: padding + ((point.lng - minLng) / lngSpan) * innerWidth,
      y: padding + ((maxLat - point.lat) / latSpan) * innerHeight,
    }),
  };
}

function projectMany(projection: Projection, points: PathPoint[]) {
  return points.map((point) => projection.project(point));
}

function toPolyline(points: ProjectedPoint[]) {
  return points.map((point) => `${point.x},${point.y}`).join(" ");
}

export function RouteMapSvgFallback({
  path,
  commands,
  activeIndex,
  vehiclePosition,
  showCommandMarkers = true,
  showVehicleMarker = true,
  traveledPath,
  aheadPath,
  className,
}: RouteMapSvgFallbackProps) {
  const width = 960;
  const height = 540;
  const padding = 36;

  const allPoints = useMemo(() => {
    const points = [...path, ...(traveledPath ?? []), ...(aheadPath ?? [])];
    for (const command of commands) points.push({ lat: command.lat, lng: command.lng });
    if (vehiclePosition) points.push(vehiclePosition);
    return points;
  }, [path, commands, vehiclePosition, traveledPath, aheadPath]);

  const projection = useMemo(
    () => createProjection(allPoints, width, height, padding),
    [allPoints],
  );

  const projectedPath = useMemo(
    () => projectMany(projection, path),
    [projection, path],
  );
  const projectedTraveled = useMemo(
    () => projectMany(projection, traveledPath ?? []),
    [projection, traveledPath],
  );
  const projectedAhead = useMemo(
    () => projectMany(projection, aheadPath ?? path),
    [projection, aheadPath, path],
  );
  const projectedCommands = useMemo(
    () => projectMany(projection, commands),
    [projection, commands],
  );
  const projectedVehicle = useMemo(
    () => (vehiclePosition ? projection.project(vehiclePosition) : null),
    [projection, vehiclePosition],
  );

  if (allPoints.length === 0) {
    return (
      <div
        className={cn(
          "flex h-full min-h-0 items-center justify-center bg-[#0b1018] text-sm text-muted-foreground",
          className,
        )}
      >
        მარშრუტის წერტილები არ არის
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative h-full min-h-0 overflow-hidden bg-[#0b1018]",
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-full w-full"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="მარშრუტის გამარტივებული რუკა"
      >
        <defs>
          <pattern
            id="route-map-grid"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 32 0 L 0 0 0 32"
              fill="none"
              stroke="rgba(148,163,184,0.08)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width={width} height={height} fill="url(#route-map-grid)" />

        {projectedTraveled.length >= 2 ? (
          <polyline
            points={toPolyline(projectedTraveled)}
            fill="none"
            stroke="#94a3b8"
            strokeOpacity={0.75}
            strokeWidth={8}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {projectedAhead.length >= 2 ? (
          <>
            <polyline
              points={toPolyline(projectedAhead)}
              fill="none"
              stroke="#ffffff"
              strokeOpacity={0.95}
              strokeWidth={12}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points={toPolyline(projectedAhead)}
              fill="none"
              stroke="#1a73e8"
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        ) : projectedPath.length >= 2 ? (
          <>
            <polyline
              points={toPolyline(projectedPath)}
              fill="none"
              stroke="#ffffff"
              strokeOpacity={0.95}
              strokeWidth={12}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points={toPolyline(projectedPath)}
              fill="none"
              stroke="#1a73e8"
              strokeWidth={7}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        ) : null}

        {showCommandMarkers
          ? projectedCommands.map((point, index) => {
              const active =
                activeIndex === undefined ||
                activeIndex === null ||
                activeIndex === index;
              return (
                <g key={`cmd-${index}`}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={active ? 14 : 11}
                    fill={active ? "#1a73e8" : "#334155"}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                  <text
                    x={point.x}
                    y={point.y + 4}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={active ? 11 : 10}
                    fontWeight={700}
                  >
                    {index + 1}
                  </text>
                  <title>
                    {commands[index]?.label ??
                      actionLabel(commands[index]?.action ?? "straight")}
                  </title>
                </g>
              );
            })
          : null}

        {showVehicleMarker && projectedVehicle ? (
          <g transform={`translate(${projectedVehicle.x} ${projectedVehicle.y})`}>
            <circle r={12} fill="#1a73e8" stroke="#ffffff" strokeWidth={2.5} />
            <path d="M -5 0 L 8 0 L 0 -7 Z" fill="#ffffff" />
          </g>
        ) : null}
      </svg>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-[#0b1018] via-[#0b1018]/80 to-transparent px-4 pb-3 pt-8">
        <p className="text-xs text-muted-foreground">
          გამარტივებული რუკა · Google Maps ვერ ჩაიტვირთა
        </p>
      </div>
    </div>
  );
}
