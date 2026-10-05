import { mkdir, copyFile, access, readFile } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'dist');
await mkdir(path.join(out, 'vendor'), {recursive:true});
for (const [source, target] of [
  ['build/three.module.js', 'three.module.js'],
  ['build/three.core.js', 'three.core.js'],
  ['examples/jsm/loaders/STLLoader.js', 'STLLoader.js'],
  ['examples/jsm/controls/OrbitControls.js', 'OrbitControls.js']
]) await copyFile(path.join(root, 'node_modules/three', source), path.join(out, 'vendor', target));
for (const file of ['index.html','app.js','device.js','exhibit.js','tour.js','tour.css','apple.css','motion.js','relay.css','hero.css','ash.js','helix.js','dna.js','relay.js','lab.css','pipeline.css','style.css','assets/body.stl','assets/cartridge.stl','assets/recording.json']) await access(path.join(out,file));
const recording = JSON.parse(await readFile(path.join(out,'assets/recording.json'),'utf8'));
if(recording.summary.rows !== 1781 || recording.summary.numeric_ppm_rows !== 186) throw new Error('Unexpected recording coverage');
console.log('Static exhibit ready in dist. Three.js modules bundled locally. Recording coverage verified.');
