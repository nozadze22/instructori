"use client";

import { useEffect, useRef, useState } from "react";
import {
  Map,
  Marker,
  Polyline,
  useMap,
  type MapMouseEvent,
} from "@vis.gl/react-google-maps";
import {
  CheckCircle2,
  Eraser,
  Loader2,
  MapPinned,
  MousePointerClick,
  Route,
  Trash2,
  Undo2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { GoogleMapsProvider } from "@/features/routes/components/google-maps-provider";
import { buildDrivingPath } from "@/features/routes/lib/build-driving-path";
import type { PathPoint, RouteAction } from "@/features/routes/lib/route-actions";
import { actionLabel } from "@/features/routes/lib/route-actions";
import {
  assignWaypointTypes,
  createWaypointId,
  waypointListLabel,
  waypointMarkerLabel,
  waypointPinColor,
  waypointPinIcon,
  type BuilderWaypoint,
  type WaypointKind,
} from "@/features/routes/lib/route-waypoints";
import { cn } from "@/lib/utils";

export type MapCommand = {
  lat: number;
  lng: number;
  action: RouteAction;
  voiceText?: string;
};

type RouteMapEditorProps = {
  path: PathPoint[];
  commands: MapCommand[];
  mode: "waypoints" | "command";
  pendingVoiceText: string;
  mapCenter?: PathPoint | null;
  onPathChange: (path: PathPoint[]) => void;
  onAddCommand: (point: PathPoint) => void;
  className?: string;
};

const TBILISI = { lat: 41.7151, lng: 44.7833 };

function MapCamera({
  center,
  zoom = 13,
}: {
  center?: PathPoint | null;
  zoom?: number;
}) {
  const map = useMap();
  const appliedCenterKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!map || center == null) return;

    const centerKey = `${center.lat.toFixed(6)},${center.lng.toFixed(6)}`;
    if (appliedCenterKeyRef.current === centerKey) return;

    appliedCenterKeyRef.current = centerKey;
    map.panTo(center);
    map.setZoom(zoom);
  }, [center, map, zoom]);

  return null;
}

function WaypointBadge({ type }: { type: WaypointKind }) {
  return (
    <span
      className={cn(
        "flex size-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white shadow-sm ring-2 ring-white/20",
        type === "START" && "bg-emerald-500",
        type === "FINISH" && "bg-rose-500",
        type === "WAYPOINT" && "bg-sky-500",
      )}
      aria-hidden
    >
      {type === "START" ? "S" : type === "FINISH" ? "F" : "•"}
    </span>
  );
}

function RouteMapEditorInner({
  path,
  commands,
  mode,
  pendingVoiceText,
  mapCenter,
  onPathChange,
  onAddCommand,
}: Omit<RouteMapEditorProps, "className">) {
  const [waypoints, setWaypoints] = useState<BuilderWaypoint[]>([]);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const draggingRef = useRef(false);
  const skipNextClickRef = useRef(false);
  const routeBuiltRef = useRef(path.length >= 2);
  const keepWaypointsOnPathClearRef = useRef(false);
  const prevPathLenRef = useRef(path.length);

  useEffect(() => {
    const prevLen = prevPathLenRef.current;
    const nextLen = path.length;
    prevPathLenRef.current = nextLen;

    if (nextLen === 0 && prevLen > 0) {
      routeBuiltRef.current = false;
      if (!keepWaypointsOnPathClearRef.current) {
        setWaypoints([]);
        setError(null);
      }
      keepWaypointsOnPathClearRef.current = false;
      return;
    }

    if (nextLen > 0 && prevLen === 0) {
      routeBuiltRef.current = true;
    }
  }, [path.length]);

  const clearBuiltPath = () => {
    if (path.length === 0) {
      routeBuiltRef.current = false;
      return;
    }
    keepWaypointsOnPathClearRef.current = true;
    onPathChange([]);
    routeBuiltRef.current = false;
  };

  const calculateRoute = async (points: BuilderWaypoint[]) => {
    if (points.length < 2) {
      setError("დაამატე მინიმუმ START და FINISH");
      return;
    }

    setBuilding(true);
    setError(null);
    try {
      const built = await buildDrivingPath(
        points.map((point) => ({ lat: point.lat, lng: point.lng })),
      );
      onPathChange(built);
      routeBuiltRef.current = true;
    } catch (err) {
      keepWaypointsOnPathClearRef.current = true;
      onPathChange([]);
      routeBuiltRef.current = false;
      setError(
        err instanceof Error
          ? err.message
          : "მარშრუტის აგება ვერ მოხერხდა. ჩართე Directions/Routes API.",
      );
    } finally {
      setBuilding(false);
    }
  };

  const handleClick = (event: MapMouseEvent) => {
    if (skipNextClickRef.current) {
      skipNextClickRef.current = false;
      return;
    }
    if (draggingRef.current) return;

    const latLng = event.detail.latLng;
    if (!latLng) return;

    const point = { lat: latLng.lat, lng: latLng.lng };

    if (mode === "command") {
      onAddCommand(point);
      return;
    }

    setError(null);
    clearBuiltPath();
    setWaypoints((prev) =>
      assignWaypointTypes([
        ...prev.map((wp) => ({ id: wp.id, lat: wp.lat, lng: wp.lng })),
        { id: createWaypointId(), lat: point.lat, lng: point.lng },
      ]),
    );
  };

  const handleDragEnd = async (
    id: string,
    event: { latLng: { lat: () => number; lng: () => number } | null },
  ) => {
    draggingRef.current = false;
    skipNextClickRef.current = true;

    const latLng = event.latLng;
    if (!latLng) return;

    const lat = latLng.lat();
    const lng = latLng.lng();
    const shouldRecalc = routeBuiltRef.current;

    const nextPoints = assignWaypointTypes(
      waypoints.map((point) =>
        point.id === id
          ? { id: point.id, lat, lng }
          : { id: point.id, lat: point.lat, lng: point.lng },
      ),
    );

    setError(null);
    setWaypoints(nextPoints);
    clearBuiltPath();

    if (shouldRecalc && nextPoints.length >= 2) {
      await calculateRoute(nextPoints);
    }
  };

  const handleUndo = () => {
    setError(null);
    clearBuiltPath();
    setWaypoints((prev) =>
      assignWaypointTypes(
        prev.slice(0, -1).map((wp) => ({
          id: wp.id,
          lat: wp.lat,
          lng: wp.lng,
        })),
      ),
    );
  };

  const handleClear = () => {
    setError(null);
    setWaypoints([]);
    routeBuiltRef.current = false;
    keepWaypointsOnPathClearRef.current = false;
    onPathChange([]);
  };

  const handleDeleteWaypoint = (id: string) => {
    setError(null);
    clearBuiltPath();
    setWaypoints((prev) =>
      assignWaypointTypes(
        prev
          .filter((point) => point.id !== id)
          .map((wp) => ({ id: wp.id, lat: wp.lat, lng: wp.lng })),
      ),
    );
  };

  const initialCenter = mapCenter ?? path[0] ?? waypoints[0] ?? TBILISI;
  const routeReady = path.length >= 2;

  return (
    <div className="relative z-0 h-[min(58vh,560px)] min-h-[340px] w-full overflow-hidden sm:h-[min(72vh,720px)] sm:min-h-[520px]">
      <Map
        defaultCenter={initialCenter}
        defaultZoom={13}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapTypeControl={false}
        streetViewControl={false}
        fullscreenControl={false}
        zoomControl
        style={{ width: "100%", height: "100%" }}
        onClick={handleClick}
        clickableIcons={false}
      >
        <MapCamera center={mapCenter} zoom={13} />

        {routeReady ? (
          <Polyline
            path={path}
            strokeColor="#4d8eff"
            strokeOpacity={0.95}
            strokeWeight={6}
            geodesic={false}
          />
        ) : null}

        {waypoints.map((waypoint) => (
          <Marker
            key={waypoint.id}
            position={{ lat: waypoint.lat, lng: waypoint.lng }}
            draggable={mode === "waypoints"}
            clickable={mode === "waypoints"}
            icon={waypointPinIcon(waypointPinColor(waypoint.type))}
            label={{
              text: waypointMarkerLabel(waypoint),
              color: "white",
              fontSize: "11px",
              fontWeight: "700",
            }}
            title={waypointListLabel(waypoint)}
            onDragStart={() => {
              draggingRef.current = true;
            }}
            onDragEnd={(event) => {
              void handleDragEnd(waypoint.id, event);
            }}
          />
        ))}

        {commands.map((command, index) => (
          <Marker
            key={`cmd-${index}-${command.lat}-${command.lng}`}
            position={{ lat: command.lat, lng: command.lng }}
            clickable={false}
            label={{
              text: String(index + 1),
              color: "white",
              fontSize: "11px",
              fontWeight: "700",
            }}
            title={command.voiceText?.trim() || actionLabel(command.action)}
          />
        ))}
      </Map>

      {/* Floating control panel — compact dock on phone, side panel on desktop */}
      <aside className="pointer-events-none absolute inset-x-2 bottom-2 z-[1] flex flex-col overflow-hidden sm:inset-x-auto sm:inset-y-4 sm:left-4 sm:bottom-auto sm:h-auto sm:max-h-[calc(100%-2rem)] sm:w-72">
        <div className="pointer-events-auto flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/12 bg-[#0b0e15]/92 shadow-[0_20px_50px_rgb(0_0_0_/_.45)] backdrop-blur-xl sm:h-full sm:flex-1">
          <div className="hidden border-b border-white/8 px-4 py-3.5 sm:block">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary-container/20 text-primary">
                <MapPinned className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold tracking-tight">
                  Route Builder
                </p>
                <p className="truncate text-[11px] text-muted-foreground">
                  {mode === "waypoints"
                    ? "Click → drag → Calculate"
                    : pendingVoiceText.trim()
                      ? `ბრძანება: ${pendingVoiceText.trim()}`
                      : "დაწერე ტექსტი და დააწკაპუნე რუკაზე"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex min-h-0 flex-col gap-2 p-2 sm:flex-1 sm:gap-3 sm:p-3">
            {mode === "waypoints" ? (
              <div className="space-y-2">
                <Button
                  type="button"
                  className="h-9 w-full rounded-xl font-semibold premium-gradient border-0 text-white shadow-md sm:h-10"
                  disabled={building || waypoints.length < 2}
                  onClick={() => void calculateRoute(waypoints)}
                >
                  {building ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Route className="size-4" />
                  )}
                  {building ? "აგება..." : "Calculate Route"}
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 rounded-xl border-white/10 bg-white/4 text-xs hover:bg-white/8 sm:h-9"
                    onClick={handleUndo}
                  >
                    <Undo2 className="size-3.5" />
                    Undo
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-8 rounded-xl border-white/10 bg-white/4 text-xs hover:bg-white/8 sm:h-9"
                    disabled={
                      (waypoints.length === 0 && path.length === 0) || building
                    }
                    onClick={handleClear}
                  >
                    <Eraser className="size-3.5" />
                    Clear
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/12 bg-white/3 px-3 py-2.5 text-xs text-muted-foreground">
                დააწკაპუნე რუკაზე ბრძანების დასამატებლად.
              </div>
            )}

            <div className="hidden items-center justify-between px-0.5 sm:flex">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Waypoints
              </p>
              <span className="rounded-full bg-white/6 px-2 py-0.5 text-[10px] tabular-nums text-muted-foreground">
                {waypoints.length}
              </span>
            </div>

            <div className="admin-scrollbar hidden min-h-0 flex-1 overflow-y-auto pr-0.5 sm:block">
              {waypoints.length === 0 ? (
                <div className="flex h-auto min-h-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-3 py-2 text-center sm:h-full sm:min-h-28 sm:gap-2 sm:px-4">
                  <MousePointerClick className="hidden size-5 text-muted-foreground/70 sm:block" />
                  <p className="text-[11px] text-muted-foreground sm:text-xs">
                    რუკაზე დააწკაპუნე პირველი წერტილისთვის
                  </p>
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {waypoints.map((waypoint) => (
                    <li
                      key={waypoint.id}
                      className="group flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.03] px-2.5 py-2 transition hover:border-white/14 hover:bg-white/[0.06]"
                    >
                      <WaypointBadge type={waypoint.type} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">
                          {waypointListLabel(waypoint)}
                        </p>
                        <p className="truncate font-mono text-[10px] text-muted-foreground/80">
                          {waypoint.lat.toFixed(4)}, {waypoint.lng.toFixed(4)}
                        </p>
                      </div>
                      {mode === "waypoints" ? (
                        <button
                          type="button"
                          className="rounded-lg p-1.5 text-muted-foreground opacity-70 transition hover:bg-destructive/15 hover:text-destructive group-hover:opacity-100"
                          aria-label={`${waypointListLabel(waypoint)} წაშლა`}
                          disabled={building}
                          onClick={() => handleDeleteWaypoint(waypoint.id)}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {routeReady ? (
              <div className="flex items-start gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-[11px] text-emerald-300">
                <CheckCircle2 className="mt-0.5 size-3.5 shrink-0" />
                <span>
                  ქუჩებზე აგებულია · {path.length.toLocaleString("ka-GE")}{" "}
                  წერტილი
                </span>
              </div>
            ) : null}

            {error ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-[11px] leading-relaxed text-destructive">
                {error}
              </div>
            ) : null}
          </div>
        </div>
      </aside>

      {/* Bottom hint chip */}
      {mode === "waypoints" && waypoints.length < 2 && !error ? (
        <div className="pointer-events-none absolute bottom-4 left-1/2 z-[1] hidden -translate-x-1/2 sm:block">
          <div className="rounded-full border border-white/12 bg-[#0b0e15]/80 px-4 py-2 text-xs text-muted-foreground shadow-lg backdrop-blur-md">
            START → waypoints → FINISH, შემდეგ Calculate
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function RouteMapEditor({
  className,
  ...props
}: RouteMapEditorProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/10 bg-surface-lowest shadow-[inset_0_1px_0_rgb(255_255_255_/_.04)]",
        className,
      )}
    >
      <GoogleMapsProvider>
        <RouteMapEditorInner {...props} />
      </GoogleMapsProvider>
    </div>
  );
}
