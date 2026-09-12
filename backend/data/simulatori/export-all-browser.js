(async () => {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const CITIES = [
  {
    "id": "batumi",
    "name": "ბათუმი",
    "keywords": [
      "batumi",
      "ბათუმ"
    ]
  },
  {
    "id": "poti",
    "name": "ფოთი",
    "keywords": [
      "poti",
      "ფოთ"
    ]
  },
  {
    "id": "ozurgeti",
    "name": "ოზურგეთი",
    "keywords": [
      "ozurgeti",
      "ოზურგეთ"
    ]
  }
];

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
    const m = t.match(/№?\s*(\d+)/);
    return m ? Number(m[1]) : 999;
  }

  function inferCity(meta) {
    const cityText = (meta.city || meta.cityName || '').trim();
    const title = (meta.title || meta.name || '').trim();
    const haystack = (cityText + ' ' + title).toLowerCase();

    for (const city of CITIES) {
      if (city.keywords.some((kw) => haystack.includes(String(kw).toLowerCase()))) {
        return city;
      }
    }

    if (cityText) {
      return { id: cityText.toLowerCase().replace(/\s+/g, '-'), name: cityText, keywords: [] };
    }

    return { id: 'unknown', name: 'უცნობი', keywords: [] };
  }

  function buildSourceKey(meta, city, index, used) {
    const num = routeNum(meta);
    let base = city.id + '-' + (num === 999 ? index + 1 : num);
    let key = base;
    let n = 2;
    while (used.has(key)) {
      key = base + '-' + n;
      n += 1;
    }
    used.add(key);
    return key;
  }

  console.log('Loading ALL routes…');
  const listPayload = await getJson('/api/routes');
  const list = Array.isArray(listPayload)
    ? listPayload
    : listPayload.routes || listPayload.data || [];

  if (!list.length) {
    console.warn('No routes in list. Response:', listPayload);
    return;
  }

  console.log('Found', list.length, 'routes. Fetching details…');

  const usedKeys = new Set();
  const routes = [];

  for (let i = 0; i < list.length; i += 1) {
    const meta = list[i];
    const id = meta.id || meta._id || meta.routeId;
    if (!id) {
      console.warn('Skip item without id', meta);
      continue;
    }

    const city = inferCity(meta);
    const sourceKey = buildSourceKey(meta, city, i, usedKeys);
    const title = meta.title || meta.name || city.name + ' #' + (i + 1);

    console.log('[' + (i + 1) + '/' + list.length + ']', sourceKey, title);
    const payload = await getJson('/api/routes/' + id);

    routes.push({
      sourceKey,
      title,
      city: city.name,
      cityId: city.id,
      simulatoriId: id,
      payload,
    });

    await sleep(350);
  }

  const bundle = {
    exportedAt: new Date().toISOString(),
    routeCount: routes.length,
    routes,
  };

  download('simulatori-all-routes.json', bundle);
  console.log('Done! Downloaded simulatori-all-routes.json with', routes.length, 'routes');
  console.log('Save to backend/data/simulatori/ then run: pnpm import:simulatori:all');
})();
