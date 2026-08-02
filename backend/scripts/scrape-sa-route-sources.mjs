import { writeFileSync } from 'fs';
import { join } from 'path';

const URL = 'https://www.sa.gov.ge/d/normativeacts';

async function main() {
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`Failed: ${res.status}`);
  const html = await res.text();

  const items = [];
  const blockRe =
    /<p class="height-100 m-t">([\s\S]*?)<\/p>[\s\S]*?href="(\/home\/file\?id=[^"]+)"/g;

  let match;
  while ((match = blockRe.exec(html))) {
    const title = match[1]
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const url = `https://www.sa.gov.ge${match[2]}`;
    if (/მარშრუტ|598|ბრძანებ/i.test(title) || /მარშრუტ|598|marshrut/i.test(url)) {
      items.push({ title, url });
    }
  }

  // Also collect all file links with route-like filenames
  const fileRe = /href="(\/home\/file\?id=[^"]+)"/g;
  const seen = new Set(items.map((i) => i.url));
  while ((match = fileRe.exec(html))) {
    const path = match[1];
    const decoded = decodeURIComponent(path);
    if (!/მარშრუტ|marshrut|598.*b|ბრძანებ/i.test(decoded)) continue;
    const url = `https://www.sa.gov.ge${path}`;
    if (seen.has(url)) continue;
    seen.add(url);
    items.push({ title: decoded.split('id=')[1] ?? decoded, url });
  }

  const out = join(process.cwd(), 'src/modules/routes/data/sa-route-sources.json');
  writeFileSync(out, JSON.stringify({ scrapedAt: new Date().toISOString(), items }, null, 2));
  console.log(`Saved ${items.length} sources -> ${out}`);
  for (const item of items.slice(0, 15)) {
    console.log('-', item.title.slice(0, 80));
    console.log(' ', item.url);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
