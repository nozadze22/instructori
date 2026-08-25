import { readFileSync, mkdirSync, writeFileSync } from 'fs';
import { PDFParse } from 'pdf-parse';

const buffer = readFileSync('tmp-sa-routes.pdf');
const parser = new PDFParse({ data: buffer });
mkdirSync('tmp-sa-pages', { recursive: true });

for (const page of [25, 26, 27]) {
  const shot = await parser.getScreenshot({ partial: [page] });
  const image = shot.pages[0]?.data;
  if (!image) {
    console.log('no image for page', page);
    continue;
  }
  const out = `tmp-sa-pages/page-${page}.png`;
  writeFileSync(out, Buffer.from(image));
  console.log('wrote', out, Buffer.from(image).length, 'bytes');
}

await parser.destroy();
