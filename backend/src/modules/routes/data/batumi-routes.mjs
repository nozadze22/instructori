/**
 * Batumi official exam routes (B category).
 * Route 1 geometry comes from prod digitization; routes 2–3 use
 * PDF map waypoints interpolated along driving segments.
 * Refine paths in Route Builder with «მარშრუტის აგება» when Directions API billing is on.
 */

const SA_SOURCE_URL =
  'https://www.sa.gov.ge/home/file?id=%E2%84%96598_%E1%83%91%E1%83%A0%E1%83%AB%E1%83%90%E1%83%9C%E1%83%94%E1%83%91%E1%83%98%E1%83%A1_%E1%83%93%E1%83%90%E1%83%9C%E1%83%90%E1%83%A0%E1%83%97%E1%83%98_%E1%83%9B%E1%83%90%E1%83%A0%E1%83%A8%E1%83%A0%E1%83%A3%E1%83%A2%E1%83%94%E1%83%91%E1%83%98_b%2C_be_28_07_2026_16_22.pdf';

function haversineMeters(a, b) {
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** @param {{ lat: number; lng: number }[]} waypoints */
export function interpolatePath(waypoints, stepMeters = 18) {
  if (waypoints.length < 2) return waypoints;
  const out = [waypoints[0]];
  for (let i = 1; i < waypoints.length; i += 1) {
    const a = waypoints[i - 1];
    const b = waypoints[i];
    const dist = haversineMeters(a, b);
    const steps = Math.max(1, Math.ceil(dist / stepMeters));
    for (let s = 1; s <= steps; s += 1) {
      const t = s / steps;
      out.push({
        lat: a.lat + (b.lat - a.lat) * t,
        lng: a.lng + (b.lng - a.lng) * t,
      });
    }
  }
  return out;
}

function toPathJson(points) {
  return points.map((p) => [p.lng, p.lat]);
}

function step(order, point, action, voiceText) {
  return {
    order,
    lat: point.lat,
    lng: point.lng,
    action,
    distanceBeforeVoice: 0,
    voiceText,
  };
}

/** Route 2 — coastal loop via Abashidze & Khimshiashvili (PDF page 25). */
const route2Waypoints = [
  { lat: 41.63132, lng: 41.63506, label: 'start' },
  { lat: 41.6324, lng: 41.6338, label: 'orbeliani' },
  { lat: 41.6342, lng: 41.6325, label: 'abashidze' },
  { lat: 41.6375, lng: 41.6318, label: 'abashidze-n' },
  { lat: 41.6428, lng: 41.6362, label: 'khimshiashvili' },
  { lat: 41.6442, lng: 41.6315, label: 'coast-mid' },
  { lat: 41.6415, lng: 41.6248, label: 'kaczynski' },
  { lat: 41.6388, lng: 41.6225, label: 'coast-turn' },
  { lat: 41.6442, lng: 41.6315, label: 'coast-return' },
  { lat: 41.6428, lng: 41.6362, label: 'khimshiashvili-back' },
  { lat: 41.6342, lng: 41.6325, label: 'abashidze-back' },
  { lat: 41.63132, lng: 41.63506, label: 'finish' },
];

/** Route 3 — Lermontov / Griboedov loop (PDF page 26). */
const route3Waypoints = [
  { lat: 41.62995, lng: 41.63175, label: 'start' },
  { lat: 41.6312, lng: 41.6338, label: 'lermontov-n' },
  { lat: 41.6328, lng: 41.6372, label: 'chavchavadze' },
  { lat: 41.6311, lng: 41.6395, label: 'griboedov' },
  { lat: 41.6294, lng: 41.6378, label: 'pushkin' },
  { lat: 41.62995, lng: 41.63175, label: 'lermontov-s' },
  { lat: 41.6318, lng: 41.6402, label: 'bagrationi-ne' },
  { lat: 41.6308, lng: 41.6425, label: 'griboedov-se' },
  { lat: 41.6335, lng: 41.6448, label: 'bagrationi-e' },
  { lat: 41.6348, lng: 41.6432, label: 'tbel-abuseridze' },
  { lat: 41.6332, lng: 41.6408, label: 'takaishvili' },
  { lat: 41.6318, lng: 41.6402, label: 'bagrationi-w' },
  { lat: 41.62995, lng: 41.63175, label: 'finish' },
];

export const BATUMI_ROUTES = [
  {
    sourceKey: 'batumi-1',
    existingRouteId: '291b8f19-614c-42ac-bff6-33dad11e03ec',
    title: 'ბათუმი — საგამოცდო მარშრუტი №1',
    city: 'ბათუმი',
    description:
      'ოფიციალური B კატეგორიის საგამოცდო მარშრუტი №1 (პუშკინი / ორბელიანი). ხმა ერთება ბრძანების პინზე.',
    sourceUrl: SA_SOURCE_URL,
    updateOnly: true,
  },
  {
    sourceKey: 'batumi-2',
    title: 'ბათუმი — საგამოცდო მარშრუტი №2',
    city: 'ბათუმი',
    description:
      'ოფიციალური B კატეგორიის საგამოცდო მარშრუტი №2 (აბაშიძე / ხიმშიაშვილი / სანაპირო). PDF-ის მიხედვით; გზის ხაზი შეიძლება დაზუსტდეს Route Builder-ში.',
    sourceUrl: SA_SOURCE_URL,
    path: toPathJson(interpolatePath(route2Waypoints)),
    steps: [
      step(0, route2Waypoints[1], 'CUSTOM', 'შემდეგ მინიშნებამდე გთხოვთ იმოძრაოთ პირდაპირ'),
      step(1, route2Waypoints[2], 'TURN_RIGHT', '300 მეტრში მოუხვიეთ მარჯვნივ.'),
      step(2, route2Waypoints[3], 'CUSTOM', 'შემდეგ მინიშნებამდე გთხოვთ იმოძრაოთ პირდაპირ'),
      step(3, route2Waypoints[4], 'TURN_LEFT', '300 მეტრში მოუხვიეთ მარცხნივ.'),
      step(4, route2Waypoints[5], 'CUSTOM', 'შემდეგ მინიშნებამდე გთხოვთ იმოძრაოთ პირდაპირ'),
      step(5, route2Waypoints[6], 'TURN_RIGHT', '300 მეტრში მოუხვიეთ მარჯვნივ.'),
      step(6, route2Waypoints[7], 'U_TURN', '90 მეტრში შეაბრუნეთ.'),
      step(7, route2Waypoints[9], 'TURN_RIGHT', 'მალე მოუხვიეთ მარჯვნივ'),
      step(8, route2Waypoints[10], 'TURN_LEFT', '300 მეტრში მოუხვიეთ მარცხნივ.'),
      step(9, route2Waypoints[11], 'PARKING', 'მოახლოვდით საწყის წერტილს. დაიწყეთ დაპარკინგება.'),
    ],
  },
  {
    sourceKey: 'batumi-3',
    title: 'ბათუმი — საგამოცდო მარშრუტი №3',
    city: 'ბათუმი',
    description:
      'ოფიციალური B კატეგორიის საგამოცდო მარშრუტი №3 (ლერმონტოვი / გრიბოედოვი / ბაგრატიონი). PDF-ის მიხედვით; გზის ხაზი შეიძლება დაზუსტდეს Route Builder-ში.',
    sourceUrl: SA_SOURCE_URL,
    path: toPathJson(interpolatePath(route3Waypoints)),
    steps: [
      step(0, route3Waypoints[1], 'CUSTOM', 'შემდეგ მინიშნებამდე გთხოვთ იმოძრაოთ პირდაპირ'),
      step(1, route3Waypoints[2], 'TURN_RIGHT', '300 მეტრში მოუხვიეთ მარჯვნივ.'),
      step(2, route3Waypoints[3], 'TURN_RIGHT', 'მალე მოუხვიეთ მარჯვნივ'),
      step(3, route3Waypoints[4], 'TURN_RIGHT', '300 მეტრში მოუხვიეთ მარჯვნივ.'),
      step(4, route3Waypoints[5], 'TURN_LEFT', '300 მეტრში მოუხვიეთ მარცხნივ.'),
      step(5, route3Waypoints[6], 'TURN_RIGHT', '300 მეტრში მოუხვიეთ მარჯვნივ.'),
      step(6, route3Waypoints[7], 'TURN_RIGHT', 'მალე მოუხვიეთ მარჯვნივ'),
      step(7, route3Waypoints[8], 'TURN_LEFT', '300 მეტრში მოუხვიეთ მარცხნივ.'),
      step(8, route3Waypoints[9], 'TURN_RIGHT', '300 მეტრში მოუხვიეთ მარჯვნივ.'),
      step(9, route3Waypoints[10], 'TURN_RIGHT', '300 მეტრში მოუხვიეთ მარჯვნივ.'),
      step(10, route3Waypoints[11], 'TURN_LEFT', '300 მეტრში მოუხვიეთ მარცხნივ.'),
      step(11, route3Waypoints[12], 'PARKING', 'მოახლოვდით საწყის წერტილს. დაიწყეთ დაპარკინგება.'),
    ],
  },
];
