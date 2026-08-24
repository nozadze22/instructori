"use client";

import { useEffect, useRef } from "react";
import { Map, Marker, Polyline, useMap } from "@vis.gl/react-google-maps";

import { GoogleMapsProvider } from "@/features/routes/components/google-maps-provider";
import { RouteMapSvgFallback } from "@/features/routes/components/route-map-svg-fallback";
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
  navigationMode?: boolean;
  headingDeg?: number;
  traveledPath?: PathPoint[];
  aheadPath?: PathPoint[];
  className?: string;
};

const TBILISI = { lat: 41.7151, lng: 44.7833 };

function ResizeMap() {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    const googleMap = map as google.maps.Map;
    const run = () => {
      google.maps.event.trigger(googleMap, "resize");
    };
    run();
    const timer = window.setTimeout(run, 80);
    window.addEventListener("resize", run);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", run);
    };
  }, [map]);

  return null;
}

function FitBounds({
  path,
  enabled,
}: {
  path: PathPoint[];
  enabled: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !enabled || path.length < 2) return;

    const lats = path.map((point) => point.lat);
    const lngs = path.map((point) => point.lng);
    map.fitBounds({
      north: Math.max(...lats),
      south: Math.min(...lats),
      east: Math.max(...lngs),
      west: Math.min(...lngs),
    });
  }, [map, path, enabled]);

  return null;
}

function NavCamera({
  position,
  headingDeg,
  enabled,
}: {
  position?: PathPoint | null;
  headingDeg: number;
  enabled: boolean;
}) {
  const map = useMap();

  useEffect(() => {
    if (!map || !enabled || !position) return;

    const camera = {
      center: position,
      zoom: 18,
      tilt: 47,
      heading: headingDeg,
    };

    const googleMap = map as google.maps.Map & {
      moveCamera?: (cam: typeof camera) => void;
    };

    if (typeof googleMap.moveCamera === "function") {
      googleMap.moveCamera(camera);
      return;
    }

    map.setCenter(position);
    map.setZoom(18);
    if (typeof map.setTilt === "function") map.setTilt(47);
    if (typeof map.setHeading === "function") map.setHeading(headingDeg);
  }, [map, enabled, position, headingDeg]);

  return null;
}

function VehicleArrow({
  position,
  headingDeg,
}: {
  position: PathPoint;
  headingDeg: number;
}) {
  const map = useMap();
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (!map || typeof google === "undefined") return;

    const marker = new google.maps.Marker({
      map,
      clickable: false,
      zIndex: 999,
    });
    markerRef.current = marker;

    return () => {
      marker.setMap(null);
      markerRef.current = null;
    };
  }, [map]);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker || typeof google === "undefined") return;
    marker.setPosition(position);
    marker.setIcon({
      path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
      scale: 7,
      fillColor: "#1a73e8",
      fillOpacity: 1,
      strokeColor: "#ffffff",
      strokeWeight: 2.5,
      rotation: headingDeg,
      anchor: new google.maps.Point(0, 2.6),
    });
  }, [position, headingDeg]);

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
  navigationMode,
  headingDeg,
  traveledPath,
  aheadPath,
}: Omit<RouteMapViewProps, "className">) {
  const traveled = traveledPath && traveledPath.length >= 2 ? traveledPath : [];
  const ahead = aheadPath && aheadPath.length >= 2 ? aheadPath : path;
  const nextCommand =
    activeIndex != null && activeIndex >= 0 ? commands[activeIndex] : null;

  return (
    <Map
      defaultCenter={path[0] ?? TBILISI}
      defaultZoom={path.length ? 14 : 13}
      gestureHandling="greedy"
      disableDefaultUI={navigationMode}
      mapTypeControl={!navigationMode}
      streetViewControl={false}
      fullscreenControl={false}
      zoomControl={!navigationMode}
      style={{ width: "100%", height: "100%", display: "block" }}
      clickableIcons={false}
      colorScheme="DARK"
    >
      <ResizeMap />
      <FitBounds path={path} enabled={!navigationMode} />
      <NavCamera
        position={vehiclePosition}
        headingDeg={headingDeg ?? 0}
        enabled={Boolean(navigationMode && followVehicle)}
      />

      {traveled.length >= 2 ? (
        <Polyline
          path={traveled}
          strokeColor="#94a3b8"
          strokeOpacity={0.7}
          strokeWeight={navigationMode ? 10 : 5}
          geodesic
        />
      ) : null}

      {ahead.length >= 2 ? (
        <Polyline
          path={ahead}
          strokeColor="#ffffff"
          strokeOpacity={0.95}
          strokeWeight={navigationMode ? 14 : 8}
          geodesic
        />
      ) : null}

      {ahead.length >= 2 ? (
        <Polyline
          path={ahead}
          strokeColor="#1a73e8"
          strokeOpacity={1}
          strokeWeight={navigationMode ? 9 : 5}
          geodesic
        />
      ) : null}

      {showCommandMarkers && !navigationMode
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

      {navigationMode && nextCommand ? (
        <Marker
          position={{ lat: nextCommand.lat, lng: nextCommand.lng }}
          title={nextCommand.label ?? actionLabel(nextCommand.action)}
        />
      ) : null}

      {showVehicleMarker && vehiclePosition && navigationMode ? (
        <VehicleArrow position={vehiclePosition} headingDeg={headingDeg ?? 0} />
      ) : null}

      {showVehicleMarker && vehiclePosition && !navigationMode ? (
        <Marker
          position={vehiclePosition}
          title="შენი მანქანა"
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
  navigationMode = false,
  headingDeg = 0,
  traveledPath,
  aheadPath,
  className,
}: RouteMapViewProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/10",
        navigationMode ? "h-full min-h-0" : "h-90 md:h-105",
        className,
      )}
    >
      <div className="absolute inset-0">
        <GoogleMapsProvider
          compact
          fallback={
            <RouteMapSvgFallback
              path={path}
              commands={commands}
              activeIndex={activeIndex}
              vehiclePosition={vehiclePosition}
              showCommandMarkers={showCommandMarkers}
              showVehicleMarker={showVehicleMarker}
              traveledPath={traveledPath}
              aheadPath={aheadPath}
            />
          }
        >
          <RouteMapViewInner
            path={path}
            commands={commands}
            activeIndex={activeIndex}
            vehiclePosition={vehiclePosition}
            followVehicle={followVehicle}
            showCommandMarkers={showCommandMarkers}
            showVehicleMarker={showVehicleMarker}
            navigationMode={navigationMode}
            headingDeg={headingDeg}
            traveledPath={traveledPath}
            aheadPath={aheadPath}
          />
        </GoogleMapsProvider>
      </div>
    </div>
  );
}
