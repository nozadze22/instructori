export const DEFAULT_MISTAKE_CATEGORIES = [
  { id: 'mc-traffic-light', code: 'TRAFFIC_LIGHT', label: 'შუქნიშანი', icon: '🚦', sortOrder: 0 },
  { id: 'mc-stop-sign', code: 'STOP_SIGN', label: 'STOP / გაჩერება', icon: '🛑', sortOrder: 1 },
  { id: 'mc-lane-change', code: 'LANE_CHANGE', label: 'ზოლის შეცვლა', icon: '↔️', sortOrder: 2 },
  { id: 'mc-turn', code: 'TURN', label: 'მოხვევა', icon: '↪️', sortOrder: 3 },
  { id: 'mc-distance', code: 'DISTANCE', label: 'დისტანცია', icon: '🚗', sortOrder: 4 },
  { id: 'mc-speeding', code: 'SPEEDING', label: 'სიჩქარე', icon: '⚡', sortOrder: 5 },
  { id: 'mc-pedestrian', code: 'PEDESTRIAN', label: 'ქვეითი', icon: '🚶', sortOrder: 6 },
  { id: 'mc-priority', code: 'PRIORITY', label: 'პრიორიტეტი', icon: '🔄', sortOrder: 7 },
  { id: 'mc-parking', code: 'PARKING', label: 'პარკირება', icon: '🅿️', sortOrder: 8 },
  { id: 'mc-maneuver', code: 'MANEUVER', label: 'მანევრი', icon: '↔️', sortOrder: 9 },
  {
    id: 'mc-prohibited',
    code: 'PROHIBITED_ACTION',
    label: 'აკრძალული მოქმედება',
    icon: '❌',
    sortOrder: 10,
  },
  { id: 'mc-other', code: 'OTHER', label: 'სხვა', icon: '📝', sortOrder: 11 },
] as const;

export const DEFAULT_MISTAKE_SEVERITIES = [
  { id: 'ms-minor', code: 'MINOR', label: 'მცირე', sortOrder: 0 },
  { id: 'ms-medium', code: 'MEDIUM', label: 'საშუალო', sortOrder: 1 },
  { id: 'ms-major', code: 'MAJOR', label: 'სერიოზული', sortOrder: 2 },
] as const;
