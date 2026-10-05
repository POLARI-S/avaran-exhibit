import { readFile, writeFile, mkdir, copyFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { STLLoader } from 'three/addons/loaders/STLLoader.js';

const root = path.resolve(import.meta.dirname, '..');
const source = path.join(root, 'source-assets');
const out = path.join(root, 'dist');
const manifest = [];
await mkdir(path.join(out, 'assets'), { recursive: true });
async function copy(original, clean) {
  const target = `assets/${clean}`;
  await copyFile(path.join(source, original), path.join(out, target));
  manifest.push({ asset: target, source: original.replaceAll('\\', '/'), processing: 'Byte-for-byte copy; original colour preserved.' });
  return target;
}
const h = 'H2S data';
await copy(`${h}/avaranlogo.png`, 'logo.png');
const models = {};
for (const part of ['BODY', 'CARTRIDGE']) {
  const asset = await copy(`${h}/AVARAN_R6_print/AVARAN_FINAL_${part}.stl`, `${part.toLowerCase()}.stl`);
  const bytes = await readFile(path.join(out, asset));
  const geometry = new STLLoader().parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  geometry.computeBoundingBox();
  const b = geometry.boundingBox;
  models[part.toLowerCase()] = { min: b.min.toArray(), max: b.max.toArray(), unit: 'mm (CAD interpretation)', coordinate_system: 'Original shared CAD coordinates; neither mesh recentered.' };
  // Technical plan for reviewing CAD geometry; not part of the public exhibit.
  const pos = geometry.attributes.position.array;
  const polygons = [];
  const levels = new Set();
  for (let i = 0; i < pos.length; i += 9) {
    levels.add(Number(pos[i + 2].toFixed(3)));
    if (pos[i + 2] === pos[i + 5] && pos[i + 2] === pos[i + 8]) {
      const points = [0, 3, 6].map(j => `${pos[i + j]},${-pos[i + j + 1]}`).join(' ');
      polygons.push(`<polygon points="${points}" fill="hsl(${pos[i+2]*35},35%,${35+pos[i+2]*5}%)" stroke="#222" stroke-width=".05"/>`);
    }
  }
  await mkdir(path.join(root, 'qa'), { recursive: true });
  await writeFile(path.join(root, 'qa', `${part.toLowerCase()}-plan.svg`), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -30 60 60" width="600" height="600">${polygons.join('')}</svg>`);
  console.log(part, models[part.toLowerCase()], 'Z levels', [...levels].sort((a,b)=>a-b));
}
const wristFiles = (await readdir(path.join(source, h, 'H2S wrist band'))).sort();
for (let i = 0; i < wristFiles.length; i++) await copy(`${h}/H2S wrist band/${wristFiles[i]}`, `prototype-${i+1}.jpg`);
const chamberFiles = (await readdir(path.join(source, h, 'H2S environment controller'))).sort();
let photo = 0;
for (const file of chamberFiles) await copy(`${h}/H2S environment controller/${file}`, file.endsWith('.mp4') ? 'chamber.mp4' : `chamber-${++photo}.jpg`);
await copy('supplemental/WhatsApp Image 2026-10-02 at 2.40.19 AM.jpeg', 'chamber-arduino.jpg');
const loggerSource = 'supplemental/WhatsApp Image 2026-10-02 at 2.49.54 AM.jpeg';
execFileSync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(root, 'scripts/redact-controller.ps1'), '-Source', path.join(source, loggerSource), '-Destination', path.join(out, 'assets/chamber-logger.png')]);
manifest.push({ asset: 'assets/chamber-logger.png', source: loggerSource, processing: 'Lossless PNG with six opaque privacy masks over serial-port identifiers and local file paths; measured values and interface otherwise unchanged.' });
for (const n of ['1.png', '2', '3', '4', '5', '6', 'both.png']) await copy(`${h}/H2S app ss/${n}`, `app-${n.split('.')[0]}.png`);
const trials = [];
for (let i = 1; i <= 5; i++) {
  const folder = `${h}/agNPs Patches data/Batch${i}`;
  const files = (await readdir(path.join(source, folder))).sort();
  const before = [], after = [];
  for (const file of files) {
    const asset = await copy(`${folder}/${file}`, file.replace('.jpeg', '.jpg').toLowerCase());
    (file.includes('-B') ? before : after).push(asset);
  }
  trials.push({ id: `B${i}`, before, after, duration: ['10 minutes','20 minutes','30 minutes','45 minutes','Around 12 hours'][i-1], concentration: i === 1 ? 'Approximately 30 ppm' : 'Approximately 20 ppm', evidence: 'qualitative', conditions_source: 'team_report', matched_patch_ids: false });
}
await copy(`${h}/agNPs Patches data/First experiment color difference.jpeg`, 'early-film.jpg');
function parseCSV(csv) {
  const rows = []; let row = [], field = '', quoted = false;
  for (let i=0; i<csv.length; i++) {
    const c = csv[i];
    if(c === '"') { if(quoted && csv[i+1] === '"') { field += '"'; i++; } else quoted = !quoted; }
    else if(c === ',' && !quoted) { row.push(field); field=''; }
    else if(c === '\n' && !quoted) { row.push(field.replace(/\r$/, '')); rows.push(row); row=[]; field=''; }
    else field += c;
  }
  if(field || row.length) { row.push(field.replace(/\r$/, '')); rows.push(row); }
  return rows;
}
const original = 'Portable/Recordings/H2S_2026-09-30_15-36-18-703.csv';
const [headers, ...raw] = parseCSV((await readFile(path.join(source, original), 'utf8')).replace(/^\uFEFF/, ''));
const numeric = ['temperature_c', 'humidity_percent', 'h2s_raw', 'h2s_voltage_v', 'h2s_estimated_ppm', 'app_target_c'];
const keep = ['timestamp_local', ...numeric, 'ppm_status', 'relay_output', 'app_control_state', 'app_requested_output', 'app_command_status'];
const rows = raw.filter(r => r.length === headers.length).map(r => Object.fromEntries(keep.map(key => {
  const value = r[headers.indexOf(key)];
  return [key, numeric.includes(key) ? (value.trim() && Number.isFinite(Number(value)) ? Number(value) : null) : value];
})));
const start = Date.parse(rows[0].timestamp_local);
for(const row of rows) row.seconds = (Date.parse(row.timestamp_local) - start) / 1000;
const statuses = {};
for(const row of rows) statuses[row.ppm_status] = (statuses[row.ppm_status] || 0) + 1;
const recording = { source: original, timezone: '+05:30', evidence: 'recorded_controller_session', linked_to_patch_trials: false, rows, summary: { rows: rows.length, duration_seconds: rows.at(-1).seconds, statuses, numeric_ppm_rows: rows.filter(r=>r.h2s_estimated_ppm !== null).length } };
await writeFile(path.join(out, 'assets', 'recording.json'), JSON.stringify(recording));
manifest.push({ asset: 'assets/recording.json', source: original, processing: 'Deterministic CSV parse; whitelist of public columns; empty numeric fields remain null. All 1,781 rows retained. Wall-clock differences from timestamps with +05:30. No interpolation, dose calculation or patch matching.' });
await writeFile(path.join(out, 'assets', 'trials.json'), JSON.stringify(trials, null, 2));
await writeFile(path.join(root, 'asset-manifest.json'), JSON.stringify({ assets: manifest, models, trials }, null, 2));
await writeFile(path.join(root, 'qa', 'recording-audit.json'), JSON.stringify(recording.summary, null, 2));
console.log('Recording audit:', recording.summary);
