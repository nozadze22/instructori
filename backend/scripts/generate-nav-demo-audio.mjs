/**
 * Bake short Georgian TTS clips for the homepage navigation demo.
 *   pnpm exec node scripts/generate-nav-demo-audio.mjs
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const lines = [
  { file: '01-left.mp3', text: 'მოუხვიეთ მარცხნივ.' },
  { file: '02-straight.mp3', text: 'გააგრძელეთ პირდაპირ.' },
  { file: '03-right.mp3', text: 'მოუხვიეთ მარჯვნივ.' },
  { file: '04-roundabout.mp3', text: 'შედით წრიულ გადასასვლელში და გაემართეთ მეორე გასასვლელზე.' },
  { file: '05-arrive.mp3', text: 'მიზანს მიაღწიეთ.' },
];

const outDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../frontend/public/demo-nav',
);

async function synthesize(text) {
  const tts = new MsEdgeTTS();
  try {
    await tts.setMetadata(
      'ka-GE-EkaNeural',
      OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3,
    );
    const { audioStream } = tts.toStream(text, {
      rate: 0.92,
      pitch: '-2Hz',
      volume: 100,
    });
    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
  } finally {
    tts.close();
  }
}

await mkdir(outDir, { recursive: true });
for (const line of lines) {
  const buffer = await synthesize(line.text);
  await writeFile(path.join(outDir, line.file), buffer);
  console.log('wrote', line.file, buffer.length, 'bytes');
}
console.log('Done →', outDir);
