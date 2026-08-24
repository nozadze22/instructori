export type RouteAction =
  | "TURN_LEFT"
  | "TURN_RIGHT"
  | "STOP"
  | "PARKING"
  | "REVERSE"
  | "U_TURN"
  | "CUSTOM";

export const VOICE_QUICK_PHRASES = [
  { label: "მარჯვნივ", text: "მოუხვიეთ მარჯვნივ." },
  { label: "მარცხნივ", text: "მოუხვიეთ მარცხნივ." },
  { label: "პირდაპირ", text: "გააგრძელეთ პირდაპირ." },
  { label: "წინ წასვლა", text: "გააგრძელეთ წინ." },
  { label: "გაჩერება", text: "გააჩერეთ." },
  { label: "ნელა", text: "შეამცირეთ სიჩქარე." },
  { label: "სიგნალი", text: "ჩართეთ სიგნალი." },
  { label: "პარკინგი", text: "დაიწყეთ დაპარკინგება." },
  { label: "უკან", text: "უკან გასვლა." },
  { label: "შებრუნება", text: "შეაბრუნეთ." },
  { label: "მობრუნება", text: "მობრუნდით." },
  { label: "გადაუსვება", text: "გადაასვით." },
  { label: "შემოუერთება", text: "შემოერთდით." },
  { label: "გზაჯვარედინი", text: "გადაიკვეთ გზაჯვარედინი." },
] as const;

export const ROUTE_ACTIONS: {
  value: RouteAction;
  label: string;
  defaultVoice: () => string;
}[] = [
  {
    value: "TURN_LEFT",
    label: "მარცხნივ",
    defaultVoice: () => "მოუხვიეთ მარცხნივ.",
  },
  {
    value: "TURN_RIGHT",
    label: "მარჯვნივ",
    defaultVoice: () => "მოუხვიეთ მარჯვნივ.",
  },
  {
    value: "STOP",
    label: "გაჩერება",
    defaultVoice: () => "გააჩერეთ.",
  },
  {
    value: "PARKING",
    label: "პარკინგი",
    defaultVoice: () => "დაიწყეთ დაპარკინგება.",
  },
  {
    value: "REVERSE",
    label: "უკან",
    defaultVoice: () => "უკან გასვლა.",
  },
  {
    value: "U_TURN",
    label: "შებრუნება",
    defaultVoice: () => "შეაბრუნეთ.",
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

export function defaultVoiceText(action: RouteAction) {
  return ROUTE_ACTIONS.find((item) => item.value === action)?.defaultVoice() ?? "";
}

export function englishVoiceText(action: RouteAction) {
  switch (action) {
    case "TURN_LEFT":
      return "Turn left.";
    case "TURN_RIGHT":
      return "Turn right.";
    case "STOP":
      return "Stop. Check your mirrors.";
    case "PARKING":
      return "Start parking.";
    case "REVERSE":
      return "Reverse.";
    case "U_TURN":
      return "Make a U-turn.";
    default:
      return "Navigation cue.";
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
