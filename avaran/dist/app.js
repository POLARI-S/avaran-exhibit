const $ = selector => document.querySelector(selector);
const details = {
  backing:{title:'White backing',purpose:'A consistent opaque white background beneath each film supports optical comparison.',assembly:'Two illustrative white layers sit beneath the exposed film and protected reference, inside the replaceable cartridge.',evidence:'Illustrative layer · Optical performance requires validation.'},
  body:{title:'Reusable body',purpose:'The printed head supports the optical assembly and holds the replaceable cartridge.',assembly:'The supplied FINAL body mesh represents the reusable housing. The strap shown here is a schematic addition.',evidence:'Built prototype · Original CAD geometry.'},
  cartridge:{title:'Replaceable cartridge',purpose:'A removable carrier for the two film patches and their optical references. The grip extends beyond the body by design.',assembly:'Seat the cartridge in the body using the shared CAD alignment. Replace the cartridge and sensing film as consumables.',evidence:'Built prototype · Original CAD geometry. White backing is an illustrative layer.'},
  sensing:{title:'Exposed sensing film',purpose:'An AgNP–PVA composite patch is exposed to the atmosphere. The intended response is a visible change associated with silver–sulfide formation.',assembly:'Silver nanoparticles are mixed with PVA, cast into a film, and cut into patches. Exact formulation and thickness are not confirmed.',evidence:'Films built · Preliminary qualitative trials. Numerical colour-to-dose calibration is not validated.'},
  reference:{title:'Protected reference',purpose:'A second patch of the same composite provides an intended comparison with the exposed patch.',assembly:'A matching patch is placed over consistent white backing behind the reference cover. Optical equivalence must be tested.',evidence:'Two-patch prototype built · Reference performance remains unvalidated.'},
  cover:{title:'Reference cover',purpose:'The cover is intended to limit gas access to the reference patch while allowing it to be photographed.',assembly:'Illustrative transparent cover. Its material and edge-sealing method are not confirmed.',evidence:'Intended gas barrier · Exclusion has not been independently validated.'},
  optics:{title:'Optical reference sticker',purpose:'The sticker is pasted onto the replaceable cartridge and travels with it when removed from the body. Printed references and corner fiducials locate the optical face.',assembly:'Remove the cartridge to see the attached sticker. Open cartridge layers to lift the sticker, reference cover, films and backing in an illustrative layer view. Printed reference values still need characterization.',evidence:'Cartridge placement confirmed by the prototype maker · Print artwork and layer spacing are illustrative.'}
};
let device, exploded=false,removed=false,photo=false;
const viewControlIds=['#remove-cartridge','#explode','#reset-view'];
viewControlIds.forEach(id=>$(id).disabled=true);
function selectPart(key){const item=details[key];if(!item)return;document.querySelectorAll('[data-part]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.part===key));$('#part-detail').innerHTML=`<h3>${item.title}</h3><p>${item.purpose}</p><span class="detail-label">PREPARATION & ASSEMBLY</span><p>${item.assembly}</p><p class="part-evidence">${item.evidence}</p>`;}
selectPart('body');
document.querySelectorAll('[data-part]').forEach(b=>b.addEventListener('click',()=>{$('#component-details').open=true;selectPart(b.dataset.part);device?.select(b.dataset.part);}));
// The layer panel has an explicit close control and closes with Escape; focus returns to the chosen label.
function closeDetails(){const panel=$('#component-details');if(!panel.open)return;panel.open=false;document.querySelector('.part-callout[aria-pressed="true"]')?.focus({preventScroll:true});}
$('#detail-close').addEventListener('click',event=>{event.preventDefault();closeDetails();});
$('#component-details').addEventListener('keydown',event=>{if(event.key==='Escape'){event.stopPropagation();closeDetails();}});
function updateView(){ const mode=photo?'photo':'model';$('#model-viewport').dataset.mode=mode;document.querySelector('.model-stage').dataset.mode=mode;$('#model-fallback').hidden=!photo;viewControlIds.forEach(id=>$(id).disabled=photo||!device);updateAssembly();if(photo)$('#assembly-label').textContent='ORIGINAL PHOTO';}
function fallback(message){photo=true;updateView();$('#model-loading').hidden=true;$('#fallback-message').textContent=message;document.body.classList.add('graphics-fallback');}
$('#model-viewport').addEventListener('model-failed',e=>fallback(e.detail));
async function initDevice(){if(new URLSearchParams(location.search).get('graphics')==='off'){fallback('Photo mode selected. Original prototype photograph shown; all component descriptions remain accessible.');return;}try{const {createDevice}=await import('./device.js');device=await createDevice($('#model-viewport'),selectPart);Promise.resolve(window.avaranIntro).then(()=>{if(!device)return;exploded=true;removed=true;device.explode(true);updateAssembly();});viewControlIds.forEach(id=>$(id).disabled=photo);$('#model-loading').hidden=true;$('#model-viewport').dataset.ready='true';}catch(error){console.error('Device unavailable:',error);fallback('3D is unavailable on this device. Original prototype photograph shown; all component descriptions remain accessible.');}}
initDevice();
function updateAssembly(){
  $('#explode').setAttribute('aria-pressed',exploded);$('#explode').textContent=exploded?'Close cartridge layers':'Open cartridge layers';
  $('#remove-cartridge').setAttribute('aria-pressed',removed);$('#remove-cartridge').textContent=removed?'Insert cartridge':'Remove cartridge';
  $('#assembly-label').textContent=exploded?'CARTRIDGE LAYERS':removed?'CARTRIDGE REMOVED':'ASSEMBLED';
}
$('#remove-cartridge').addEventListener('click',()=>{removed=!removed;exploded=false;device?.remove(removed);updateAssembly();device?.select('cartridge');});
$('#explode').addEventListener('click',()=>{exploded=!exploded;removed=true;if(exploded)device?.explode(true);else device?.remove(true);updateAssembly();});
$('#reset-view').addEventListener('click',()=>{device?.reset();});
import { initExhibit } from './exhibit.js';
initExhibit();
