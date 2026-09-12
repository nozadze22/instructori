(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const CITY_ID = "poti";
  const CITY_NAME = "ფოთი";
  const KEYWORDS = ["poti","ფოთ"];

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

  function matchesCity(item) {
    const cityText = (item.city || item.cityName || '').toLowerCase();
    const title = (item.title || item.name || '').toLowerCase();
    const haystack = cityText + ' ' + title;
    return KEYWORDS.some((keyword) => haystack.includes(String(keyword).toLowerCase()));
  }

  console.log('Loading route list for', CITY_NAME, '…');
  const listPayload = await getJson('/api/routes');
  const list = Array.isArray(listPayload)
    ? listPayload
    : listPayload.routes || listPayload.data || [];

  const cityRoutes = list.filter(matchesCity).sort((a, b) => routeNum(a) - routeNum(b));

  if (cityRoutes.length === 0) {
    console.warn('No routes found for', CITY_NAME);
    console.warn('Sample titles:', list.slice(0, 10).map((item) => item.title || item.name));
    return;
  }

  console.log('Found', cityRoutes.length, 'routes for', CITY_NAME);

  const manifestRoutes = [];

  for (let i = 0; i < cityRoutes.length; i += 1) {
    const meta = cityRoutes[i];
    const id = meta.id || meta._id || meta.routeId;
    const routeNumber = routeNum(meta);
    const sourceKey = CITY_ID + '-' + (routeNumber === 999 ? i + 1 : routeNumber);
    const fileName = sourceKey + '.json';

    console.log('Fetching', sourceKey, id, meta.title || meta.name);
    const detail = await getJson('/api/routes/' + id);
    download(fileName, detail);

    manifestRoutes.push({
      sourceKey,
      title: meta.title || meta.name || (CITY_NAME + ' #' + (i + 1)),
      simulatoriId: id,
      file: fileName,
      city: CITY_NAME,
    });

    await sleep(400);
  }

  download('manifest-' + CITY_ID + '.json', { city: CITY_NAME, routes: manifestRoutes });
  console.log('Done — save files to backend/data/simulatori/');
  console.log('Then run: pnpm import:simulatori:city -- ' + CITY_ID);
})();
