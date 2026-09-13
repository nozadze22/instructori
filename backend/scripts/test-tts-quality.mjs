/**
 * Quick TTS smoke test — verifies voice profile produces valid MP3 audio.
 */
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(__dirname, '..', '.tmp', 'tts-test');

const PHRASES = [
  '300 მეტრში მოუხვიეთ მარჯვნივ.',
  'მალე მოუხვიეთ მარცხნივ.',
  'შემდეგ მინიშნებამდე გთხოვთ იმოძრაოთ პირდაპირ.',
];

const OLD = {
  label: 'old-48k-default',
  format: OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3,
  prosody: {},
};

const NEW = {
  label: 'new-v2-soft-96k',
  format: OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3,
  prosody: { rate: 0.92, pitch: '-2Hz', volume: 100 },
};

async function synthesize(text, profile) {
  const tts = new MsEdgeTTS();
  await tts.setMetadata('ka-GE-EkaNeural', profile.format);
  const { audioStream } = tts.toStream(text, profile.prosody);
  const chunks = [];
  await new Promise((resolve, reject) => {
    audioStream.on('data', (chunk) => chunks.push(chunk));
    audioStream.on('end', resolve);
    audioStream.on('error', reject);
  });
  tts.close();
  return Buffer.concat(chunks);
}

function isLikelyMp3(buffer) {
  if (buffer.length < 128) return false;
  // MP3 frame sync (0xFF 0xFB/0xFA/0xF3...) or ID3 header
  if (buffer[0] === 0x49 && buffer[1] === 0x44 && buffer[2] === 0x33) return true;
  return buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  const results = [];
  for (const phrase of PHRASES) {
    for (const profile of [OLD, NEW]) {
      const buffer = await synthesize(phrase, profile);
      const safeName = phrase.slice(0, 24).replace(/[^\w\u10A0-\u10FF]+/gu, '-');
      const file = join(OUT_DIR, `${profile.label}-${safeName}.mp3`);
      writeFileSync(file, buffer);
      results.push({
        profile: profile.label,
        phrase,
        bytes: buffer.length,
        validMp3: isLikelyMp3(buffer),
        file,
      });
    }
  }

  const oldAvg =
    results.filter((r) => r.profile === OLD.label).reduce((s, r) => s + r.bytes, 0) /
    PHRASES.length;
  const newAvg =
    results.filter((r) => r.profile === NEW.label).reduce((s, r) => s + r.bytes, 0) /
    PHRASES.length;

  const allValid = results.every((r) => r.validMp3 && r.bytes >= 4096);
  const richer = newAvg > oldAvg * 1.5;

  console.log('\n=== TTS Quality Test ===\n');
  for (const row of results) {
    console.log(
      `[${row.validMp3 ? 'OK' : 'FAIL'}] ${row.profile} | ${row.bytes} bytes | ${row.phrase}`,
    );
  }
  console.log(`\nOld avg: ${Math.round(oldAvg)} bytes`);
  console.log(`New avg: ${Math.round(newAvg)} bytes (${Math.round((newAvg / oldAvg - 1) * 100)}% larger)`);
  console.log(`\nSamples saved to: ${OUT_DIR}`);
  console.log(`\nOverall: ${allValid && richer ? 'PASS' : 'FAIL'}`);

  if (!allValid || !richer) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
