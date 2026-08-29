/**
 * Paste the BROWSER_SCRIPT below into DevTools Console on simulatori.ge
 * while logged in (any driver page).
 *
 * It downloads 3 JSON files — save them to backend/data/simulatori/
 * Then run: pnpm import:simulatori:batumi
 */

export const BROWSER_SCRIPT = String.raw`
(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  async function getJson(url) {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error(url + ' → ' + res.status);
    return res.json();
  }

  function download(name, obj) {
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function routeNum(item) {
    const t = (item.title || item.name || '').toLowerCase();
    const m = t.match(/№?\\s*(\\d+)/);
    return m ? Number(m[1]) : 999;
  }

  function isBatumi(item) {
    const city = (item.city || item.cityName || '').toLowerCase();
    const title = (item.title || item.name || '').toLowerCase();
    return city.includes('batumi') || city.includes('ბათუმ') || title.includes('ბათუმ');
  }

  console.log('Loading route list…');
  const listPayload = await getJson('/api/routes');
  const list = Array.isArray(listPayload)
    ? listPayload
    : listPayload.routes || listPayload.data || [];

  let batumi = list.filter(isBatumi).sort((a, b) => routeNum(a) - routeNum(b));

  if (batumi.length < 3) {
    console.warn('List had fewer than 3 Batumi routes:', batumi);
    console.warn('Open each route manually and run:');
    console.warn("fetch('/api/routes/ROUTE_ID').then(r=>r.json()).then(console.log)");
    return;
  }

  batumi = batumi.slice(0, 3);

  for (let i = 0; i < 3; i += 1) {
    const meta = batumi[i];
    const id = meta.id || meta._id || meta.routeId;
    console.log('Fetching route', i + 1, id, meta.title || meta.name);
    const detail = await getJson('/api/routes/' + id);
    download('batumi-' + (i + 1) + '.json', detail);
    await sleep(400);
  }

  const manifest = {
    routes: batumi.map((item, index) => ({
      sourceKey: 'batumi-' + (index + 1),
      title: item.title || item.name,
      simulatoriId: item.id || item._id || item.routeId,
      file: 'batumi-' + (index + 1) + '.json',
    })),
  };
  download('manifest.json', manifest);
  console.log('Done — save files to backend/data/simulatori/ then run pnpm import:simulatori:batumi');
})();
`;

console.log(BROWSER_SCRIPT);
