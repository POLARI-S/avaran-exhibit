import assert from 'node:assert/strict';
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const recording=JSON.parse(await readFile(path.join(root,'dist/assets/recording.json'),'utf8'));
const manifest=JSON.parse(await readFile(path.join(root,'asset-manifest.json'),'utf8'));
const rows=recording.rows;
assert.equal(rows.length,1781);
assert.equal(rows.filter(r=>r.h2s_estimated_ppm!==null).length,186);
assert.equal(recording.summary.duration_seconds,3603.521);
assert.deepEqual(recording.summary.statuses,{NO_BASELINE:727,BASELINE_CAPTURING:22,BELOW_MODEL_RANGE:813,DHT_ERROR:21,ABOVE_MODEL_RANGE:12,ESTIMATED:186});
let largestGap=0;
for(let i=0;i<rows.length;i++){
  const row=rows[i];
  assert(row.timestamp_local.endsWith('+05:30'));
  assert(Number.isFinite(row.seconds));
  assert.equal(Object.hasOwn(row,'serial_port'),false);
  assert.equal(Object.hasOwn(row,'raw_line'),false);
  assert.equal(Object.hasOwn(row,'baseline_id'),false);
  if(row.ppm_status!=='ESTIMATED')assert.equal(row.h2s_estimated_ppm,null);
  if(row.ppm_status==='DHT_ERROR'){assert.equal(row.temperature_c,null);assert.equal(row.humidity_percent,null);}
  if(i){assert(row.seconds>rows[i-1].seconds);largestGap=Math.max(largestGap,row.seconds-rows[i-1].seconds);}
}
assert(Math.abs(largestGap-3.749)<.000001);
assert.deepEqual(manifest.models.body.min,[-24,-18,0]);
assert.deepEqual(manifest.models.body.max,[24,18,8]);
assert.equal(manifest.models.cartridge.max[1],26);
let byteExactCopies=0;
for(const asset of manifest.assets){
  if(!asset.processing.startsWith('Byte-for-byte'))continue;
  const original=await readFile(path.join(root,'source-assets',asset.source));
  const working=await readFile(path.join(root,'dist',asset.asset));
  const hash=b=>createHash('sha256').update(b).digest('hex');
  assert.equal(hash(original),hash(working),asset.asset);byteExactCopies++;
}
async function inspect(folder){for(const entry of await readdir(folder,{withFileTypes:true})){const full=path.join(folder,entry.name);if(entry.isDirectory())await inspect(full);else assert(!/\.(exe|lnk|log|csv|docx|pdf)$/i.test(entry.name),'Unreviewed raw material in public output: '+entry.name);}}
await inspect(path.join(root,'dist'));
const html=await readFile(path.join(root,'dist/index.html'),'utf8');
assert(!/PDMS/i.test(html));
for(const match of html.matchAll(/(?:src|href)="(assets\/[^"#?]+)"/g))await readFile(path.join(root,'dist',match[1]));
const report={passed:true,recording_rows:1781,numeric_ppm_rows:186,environmental_error_rows:21,duration_seconds:3603.521,largest_timestamp_gap_seconds:Number(largestGap.toFixed(3)),timestamps_strictly_increasing:true,unavailable_ppm_preserved_as_null:true,private_csv_columns_excluded:true,byte_exact_asset_copies:byteExactCopies,original_shared_CAD_coordinates:true,unreviewed_files_excluded_from_public_output:true};
await writeFile(path.join(root,'qa/data-and-assets-audit.json'),JSON.stringify(report,null,2));
console.log(report);
