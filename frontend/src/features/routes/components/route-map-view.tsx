"use client";

import { useEffect } from "react";
import { Map, Marker, Polyline, useMap } from "@vis.gl/react-google-maps";

import { GoogleMapsProvider } from "@/features/routes/components/google-maps-provider";
import type { PathPoint, RouteAction } from "@/features/routes/lib/route-actions";
import { actionLabel } from "@/features/routes/lib/route-actions";
import { cn } from "@/lib/utils";

type RouteMapViewProps = {
  path: PathPoint[];
  commands: Array<{
    lat: number;
    lng: number;
    action: RouteAction;
    label?: string;
  }>;
  activeIndex?: number | null;
  vehiclePosition?: PathPoint | null;
  followVehicle?: boolean;
  showCommandMarkers?: boolean;
  showVehicleMarker?: boolean;
  className?: string;
};

const TBILISI = { lat: 41.7151, lng: 44.7833 };

function FitBounds({ path }: { path: PathPoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || path.length < 2) return;

    const lats = path.map((point) => point.lat);
    const lngs = path.map((point) => point.lng);
    map.fitBounds({
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs),
    });
  }, [map, path]);

  return null;
}

function FollowVehicle({
  position,
  enabled,
}: {
  position?: PathPoint | null;
  enabled?: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !enabled || !position) return;
    map.panTo(position);
  }, [map, enabled, position]);

  return null;
}

function RouteMapViewInner({
  path,
  commands,
  activeIndex,
  vehiclePosition,
  followVehicle,
  showCommandMarkers,
  showVehicleMarker,
}: Omit<RouteMapViewProps, "className">) {
  return (
    <Map
      defaultCenter={path[0] ?? TBILISI}
      defaultZoom={path.length ? 14 : 13}
      gestureHandling="greedy"
      disableDefaultUI={false}
      mapTypeControl
      streetViewControl={false}
      fullscreenControl={false}
      style={{ width: "100%", height: "100%" }}
      clickableIcons={false}
    >
      <FitBounds path={path} />
      <FollowVehicle position={vehiclePosition} enabled={followVehicle} />

      {path.length >= 2 ? (
        <Polyline
          path={path}
          strokeColor="#2563eb"
          strokeOpacity={0.95}
          strokeWeight={5}
          geodesic
        />
      ) : null}

      {showCommandMarkers
        ? commands.map((command, index) => (
            <Marker
              key={`cmd-${command.lat}-${command.lng}-${index}`}
              position={{ lat: command.lat, lng: command.lng }}
              label={{
                text: String(index + 1),
                color: "white",
                fontSize: "11px",
                fontWeight: "700",
              }}
              title={command.label ?? actionLabel(command.action)}
              opacity={
                activeIndex === undefined ||
                activeIndex === null ||
                activeIndex === index
                  ? 1
                  : 0.45
              }
            />
          ))
        : null}

      {showVehicleMarker && vehiclePosition ? (
        <Marker
          position={vehiclePosition}
          title="სიმულაცია"
          label={{
            text: "▶",
            color: "white",
            fontSize: "12px",
            fontWeight: "700",
          }}
        />
      ) : null}
    </Map>
  );
}

export function RouteMapView({
  path,
  commands,
  activeIndex,
  vehiclePosition,
  followVehicle,
  showCommandMarkers = true,
  showVehicleMarker = true,
  className,
}: RouteMapViewProps) {
  return (
    <div
      className={cn(
        "h-[360px] overflow-hidden rounded-2xl border border-white/10 md:h-[420px]",
        className,
      )}
    >
      <GoogleMapsProvider>
        <RouteMapViewInner
          path={path}
          commands={commands}
          activeIndex={activeIndex}
          vehiclePosition={vehiclePosition}
          followVehicle={followVehicle}
          showCommandMarkers={showCommandMarkers}
          showVehicleMarker={showVehicleMarker}
        />
      </GoogleMapsProvider>
    </div>
  );
}
