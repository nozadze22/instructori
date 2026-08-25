import { readFileSync, writeFileSync } from 'fs';
import { PDFParse } from 'pdf-parse';

const buffer = readFileSync('tmp-sa-routes.pdf');
const parser = new PDFParse({ data: buffer });
const result = await parser.getText();
await parser.destroy();

const text = result.text;
writeFileSync('tmp-sa-routes.txt', text, 'utf8');

const markers = ['ბათუმ', 'Batumi', 'BATUMI'];
for (const marker of markers) {
  const idx = text.indexOf(marker);
  if (idx >= 0) {
    console.log(`Found "${marker}" at ${idx}`);
    console.log(text.slice(idx, idx + 12000));
    break;
  }
}

console.log('\n--- total chars', text.length, 'pages', result.totalPages);
