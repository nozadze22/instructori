export type RouteAction =
  | "TURN_LEFT"
  | "TURN_RIGHT"
  | "STOP"
  | "PARKING"
  | "REVERSE"
  | "U_TURN"
  | "CUSTOM";

export const ROUTE_ACTIONS: {
  value: RouteAction;
  label: string;
  defaultVoice: (distance: number) => string;
}[] = [
  {
    value: "TURN_LEFT",
    label: "მარცხნივ",
    defaultVoice: (d) => `${d} მეტრში მოუხვიეთ მარცხნივ.`,
  },
  {
    value: "TURN_RIGHT",
    label: "მარჯვნივ",
    defaultVoice: (d) => `${d} მეტრში მოუხვიეთ მარჯვნივ.`,
  },
  {
    value: "STOP",
    label: "გაჩერება",
    defaultVoice: (d) => `${d} მეტრში გააჩერეთ.`,
  },
  {
    value: "PARKING",
    label: "პარკინგი",
    defaultVoice: (d) => `${d} მეტრში დაიწყეთ დაპარკინგება.`,
  },
  {
    value: "REVERSE",
    label: "უკან",
    defaultVoice: (d) => `${d} მეტრში უკან გასვლა.`,
  },
  {
    value: "U_TURN",
    label: "შებრუნება",
    defaultVoice: (d) => `${d} მეტრში შეაბრუნეთ.`,
  },
  {
    value: "CUSTOM",
    label: "სხვა",
    defaultVoice: () => "",
  },
];

export function actionLabel(action: RouteAction) {
  return ROUTE_ACTIONS.find((item) => item.value === action)?.label ?? action;
}

export function defaultVoiceText(action: RouteAction, distance: number) {
  return (
    ROUTE_ACTIONS.find((item) => item.value === action)?.defaultVoice(
      distance,
    ) ?? ""
  );
}

export function englishVoiceText(action: RouteAction, distance: number) {
  switch (action) {
    case "TURN_LEFT":
      return `In ${distance} meters, turn left.`;
    case "TURN_RIGHT":
      return `In ${distance} meters, turn right.`;
    case "STOP":
      return `In ${distance} meters, stop. Check your mirrors.`;
    case "PARKING":
      return `In ${distance} meters, start parking.`;
    case "REVERSE":
      return `In ${distance} meters, reverse.`;
    case "U_TURN":
      return `In ${distance} meters, make a U-turn.`;
    default:
      return `Instruction in ${distance} meters.`;
  }
}

export type PathPoint = { lng: number; lat: number };

export function parseRoutePath(path: unknown): PathPoint[] {
  if (!Array.isArray(path)) return [];

  return path
    .map((point) => {
      if (Array.isArray(point) && point.length >= 2) {
        const lng = Number(point[0]);
        const lat = Number(point[1]);
        if (Number.isFinite(lng) && Number.isFinite(lat)) return { lng, lat };
        return null;
      }

      if (
        point &&
        typeof point === "object" &&
        "lng" in point &&
        "lat" in point
      ) {
        const lng = Number((point as PathPoint).lng);
        const lat = Number((point as PathPoint).lat);
        if (Number.isFinite(lng) && Number.isFinite(lat)) return { lng, lat };
      }

      return null;
    })
    .filter((point): point is PathPoint => point !== null);
}
