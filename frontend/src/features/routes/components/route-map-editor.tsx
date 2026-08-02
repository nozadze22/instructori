"use client";

import { useEffect, useState } from "react";
import {
  Map,
  Marker,
  Polyline,
  useMap,
  type MapMouseEvent,
} from "@vis.gl/react-google-maps";

import { Button } from "@/components/ui/button";
import { GoogleMapsProvider } from "@/features/routes/components/google-maps-provider";
import { buildDrivingPath } from "@/features/routes/lib/build-driving-path";
import type { PathPoint, RouteAction } from "@/features/routes/lib/route-actions";
import { actionLabel } from "@/features/routes/lib/route-actions";
import { cn } from "@/lib/utils";

export type MapCommand = {
  lat: number;
  lng: number;
  action: RouteAction;
};

type RouteMapEditorProps = {
  path: PathPoint[];
  commands: MapCommand[];
  mode: "waypoints" | "command";
  pendingAction: RouteAction;
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

  useEffect(() => {
    if (!map || !center) return;
    map.panTo(center);
    map.setZoom(zoom);
  }, [map, center, zoom]);

  return null;
}

function RouteMapEditorInner({
  path,
  commands,
  mode,
  pendingAction,
  mapCenter,
  onPathChange,
  onAddCommand,
}: Omit<RouteMapEditorProps, "className">) {
  const [waypoints, setWaypoints] = useState<PathPoint[]>([]);
  const [building, setBuilding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hadPath, setHadPath] = useState(path.length > 0);

  // Reset local waypoints when the parent clears the built path.
  if (path.length === 0 && hadPath) {
    setHadPath(false);
    setWaypoints([]);
    setError(null);
  } else if (path.length > 0 && !hadPath) {
    setHadPath(true);
  }

  const handleClick = (event: MapMouseEvent) => {
    const latLng = event.detail.latLng;
    if (!latLng) return;

    const point = { lat: latLng.lat, lng: latLng.lng };

    if (mode === "command") {
      onAddCommand(point);
      return;
    }

    setError(null);
    setWaypoints((prev) => [...prev, point]);
  };

  const handleBuild = async () => {
    setBuilding(true);
    setError(null);
    try {
      const built = await buildDrivingPath(waypoints);
      onPathChange(built);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "მარშრუტის აგება ვერ მოხერხდა. ჩართე Directions/Routes API.",
      );
    } finally {
      setBuilding(false);
    }
  };

  const initialCenter = mapCenter ?? path[0] ?? waypoints[0] ?? TBILISI;

  return (
    <>
      <Map
        defaultCenter={initialCenter}
        defaultZoom={13}
        gestureHandling="greedy"
        disableDefaultUI={false}
        mapTypeControl
        streetViewControl={false}
        fullscreenControl={false}
        style={{ width: "100%", height: "420px" }}
        onClick={handleClick}
        clickableIcons={false}
      >
        <MapCamera center={mapCenter} zoom={13} />

        {path.length >= 2 ? (
          <Polyline
            path={path}
            strokeColor="#2563eb"
            strokeOpacity={0.95}
            strokeWeight={5}
            geodesic={false}
          />
        ) : null}

        {waypoints.map((point, index) => (
          <Marker
            key={`wp-${index}-${point.lat}-${point.lng}`}
            position={point}
            label={{
              text: String(index + 1),
              color: "white",
              fontSize: "11px",
              fontWeight: "700",
            }}
            title={
              index === 0
                ? "დასაწყისი"
                : index === waypoints.length - 1
                  ? "დასასრული"
                  : `წერტილი ${index + 1}`
            }
          />
        ))}

        {commands.map((command, index) => (
          <Marker
            key={`cmd-${index}-${command.lat}-${command.lng}`}
            position={{ lat: command.lat, lng: command.lng }}
            label={{
              text: String(index + 1),
              color: "white",
              fontSize: "11px",
              fontWeight: "700",
            }}
            title={actionLabel(command.action)}
          />
        ))}
      </Map>

      <div className="space-y-2 border-t border-white/10 bg-surface-lowest/80 px-4 py-3">
        {mode === "waypoints" ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              className="rounded-xl"
              disabled={building || waypoints.length < 2}
              onClick={handleBuild}
            >
              {building ? "აგება..." : "მარშრუტის აგება ქუჩებზე"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="rounded-xl border-white/10"
              disabled={waypoints.length === 0 || building}
              onClick={() => {
                setWaypoints((prev) => prev.slice(0, -1));
                setError(null);
              }}
            >
              წერტილის გაუქმება
            </Button>
            <span className="text-xs text-muted-foreground">
              {waypoints.length} წერტილი · {path.length ? "ხაზი აგებულია" : "ჯერ ააგე მარშრუტი"}
            </span>
          </div>
        ) : null}

        <p className="text-xs text-muted-foreground">
          {mode === "waypoints"
            ? "დააწკაპუნე დასაწყისზე, შემდეგ რამდენიმე შუა წერტილზე, ბოლოს დასასრულზე. შემდეგ დააჭირე „მარშრუტის აგება ქუჩებზე“."
            : `დააწკაპუნე რუკაზე ბრძანების დასამატებლად (${actionLabel(pendingAction)}).`}
        </p>

        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>
    </>
  );
}

export function RouteMapEditor({
  className,
  ...props
}: RouteMapEditorProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-white/10",
        className,
      )}
    >
      <GoogleMapsProvider>
        <RouteMapEditorInner {...props} />
      </GoogleMapsProvider>
    </div>
  );
}
