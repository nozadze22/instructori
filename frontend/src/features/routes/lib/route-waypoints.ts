export type WaypointKind = "START" | "WAYPOINT" | "FINISH";

export type BuilderWaypoint = {
  id: string;
  lat: number;
  lng: number;
  type: WaypointKind;
  order: number;
};

export function createWaypointId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `wp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** First = START, last = FINISH, middle = WAYPOINT. Single point stays START. */
export function assignWaypointTypes(
  points: Array<Pick<BuilderWaypoint, "id" | "lat" | "lng">>,
): BuilderWaypoint[] {
  const total = points.length;
  return points.map((point, index) => {
    let type: WaypointKind = "WAYPOINT";
    if (total === 1 || index === 0) type = "START";
    if (total >= 2 && index === total - 1) type = "FINISH";
    return {
      id: point.id,
      lat: point.lat,
      lng: point.lng,
      type,
      order: index,
    };
  });
}

export function waypointMarkerLabel(waypoint: BuilderWaypoint): string {
  if (waypoint.type === "START") return "S";
  if (waypoint.type === "FINISH") return "F";
  return String(waypoint.order);
}

export function waypointListLabel(waypoint: BuilderWaypoint): string {
  if (waypoint.type === "START") return "Start";
  if (waypoint.type === "FINISH") return "Finish";
  return `Waypoint ${waypoint.order}`;
}

export function waypointPinColor(type: WaypointKind): string {
  switch (type) {
    case "START":
      return "#22c55e";
    case "FINISH":
      return "#ef4444";
    default:
      return "#3b82f6";
  }
}

export function waypointDot(type: WaypointKind): string {
  switch (type) {
    case "START":
      return "🟢";
    case "FINISH":
      return "🔴";
    default:
      return "🔵";
  }
}

/** SVG pin icon for classic google.maps.Marker (no mapId required). */
export function waypointPinIcon(fill: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
  <path fill="${fill}" stroke="#ffffff" stroke-width="2"
    d="M16 1C8.3 1 2 7.3 2 15c0 11.2 14 25 14 25s14-13.8 14-25C30 7.3 23.7 1 16 1z"/>
</svg>`;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: { width: 32, height: 42 },
    anchor: { x: 16, y: 42 },
    labelOrigin: { x: 16, y: 15 },
  };
}
