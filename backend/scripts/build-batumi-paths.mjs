import 'dotenv/config';

const key = process.env.GOOGLE_MAPS_API_KEY;

async function directions(waypoints, label) {
  const origin = waypoints[0];
  const destination = waypoints[waypoints.length - 1];
  const middle = waypoints.slice(1, -1);
  const url = new URL('https://maps.googleapis.com/maps/api/directions/json');
  url.searchParams.set('origin', `${origin.lat},${origin.lng}`);
  url.searchParams.set('destination', `${destination.lat},${destination.lng}`);
  if (middle.length) {
    url.searchParams.set(
      'waypoints',
      middle.map((p) => `${p.lat},${p.lng}`).join('|'),
    );
  }
  url.searchParams.set('mode', 'driving');
  url.searchParams.set('region', 'ge');
  url.searchParams.set('key', key);
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== 'OK') {
    throw new Error(`${label}: ${data.status} ${data.error_message ?? ''}`);
  }

  const path = [];
  for (const leg of data.routes[0].legs) {
    for (const step of leg.steps) {
      for (const point of decodePolyline(step.polyline.points)) {
        path.push(point);
      }
    }
  }
  return path;
}

function decodePolyline(encoded) {
  let index = 0;
  const len = encoded.length;
  const path = [];
  let lat = 0;
  let lng = 0;
  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    path.push({ lat: lat / 1e5, lng: lng / 1e5 });
  }
  return path;
}

const agency = { lat: 41.63134, lng: 41.63498, name: 'agency' };

const route2Wps = [
  agency,
  { lat: 41.6328, lng: 41.6322, name: 'abashidze' },
  { lat: 41.6415, lng: 41.6368, name: 'khimshiashvili-n' },
  { lat: 41.6448, lng: 41.6285, name: 'coast-sw' },
  { lat: 41.6395, lng: 41.6215, name: 'kaczynski' },
  agency,
];

const route3Wps = [
  { lat: 41.6299, lng: 41.6318, name: 'lermontov' },
  { lat: 41.6318, lng: 41.6365, name: 'chavchavadze' },
  { lat: 41.6304, lng: 41.6388, name: 'griboedov' },
  { lat: 41.6292, lng: 41.6362, name: 'pushkin' },
  { lat: 41.6315, lng: 41.6395, name: 'bagrationi' },
  { lat: 41.6338, lng: 41.6412, name: 'tbel-abuseridze' },
  { lat: 41.6325, lng: 41.6398, name: 'takaishvili' },
  { lat: 41.6299, lng: 41.6318, name: 'lermontov-end' },
];

const route2 = await directions(route2Wps, 'route2');
const route3 = await directions(route3Wps, 'route3');
console.log('route2', route2.length, 'route3', route3.length);

export { route2, route3, route2Wps, route3Wps };
