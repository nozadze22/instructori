import { execSync } from 'child_process';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const dir = dirname(fileURLToPath(import.meta.url));
const gitSource = execSync(
  'git show HEAD:backend/scripts/import-simulatori-route.mjs',
  { cwd: join(dir, '..', '..'), encoding: 'utf8' },
);

const fnMatch = gitSource.match(/function voiceFromKind\(kind\) \{[\s\S]*?\n\}/);
if (!fnMatch) throw new Error('voiceFromKind not found in git');

const crossingMatch = fnMatch[0].match(
  /return `\$\{prefix\}([^`$]+) გაიარეთ პირდაპირ\.`;/,
);
if (!crossingMatch) throw new Error('crossing phrase not found');

const ROUNDABOUT_AT_CROSSING = crossingMatch[1];
const ROUNDABOUT_AT_CIRCULATION = 'წრიული მოძრაობაზ' + '\u10D4';
const soonPrefixMatch = fnMatch[0].match(/: k\.includes\('soon'\)\s*\?\s*'([^']+)'/);
const SOON_PREFIX = soonPrefixMatch?.[1] ?? 'მალ\u10D4 ';

let fn = fnMatch[0].replace(
  /const prefix = k.includes\('300m'\)[\s\S]*?: '';\n\n/,
  `const isSoon = k.includes('soon') && !k.includes('300m');
  const prefix = k.includes('300m')
    ? '300 მეტრში '
    : isSoon
      ? '${SOON_PREFIX}'
      : '';
  const roundaboutPlace = isSoon
    ? '${ROUNDABOUT_AT_CIRCULATION}'
    : '${ROUNDABOUT_AT_CROSSING}';

`,
);

fn = fn.replaceAll(
  `\${prefix}${ROUNDABOUT_AT_CROSSING}`,
  '${prefix}${roundaboutPlace}',
);

const body = `/** Shared simulatori.ge event kind → Georgian voice text. */

export ${fn}

export const SOON_ROUNDABOUT_VOICE_FROM = ${JSON.stringify(`${SOON_PREFIX}${ROUNDABOUT_AT_CROSSING}`)};
export const SOON_ROUNDABOUT_VOICE_TO = ${JSON.stringify(`${SOON_PREFIX}${ROUNDABOUT_AT_CIRCULATION}`)};
`;

writeFileSync(join(dir, 'simulatori-voice-text.mjs'), body);
console.log('wrote simulatori-voice-text.mjs');
