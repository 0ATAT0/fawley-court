/* Production assembly of the build-owned estate detail package. */
import * as THREE from 'three';
import {key,clonePlacedDetail,envelopeExpansion} from '../fcm/viewer/detail_state.js';
import {preparePlaces} from '../fcm/viewer/estate_places.js';

export async function prepareEstateDetail(root,loader,base){
 const json=async name=>{const r=await fetch(base+name,{cache:'no-store'});if(!r.ok)throw Error('Missing built estate detail: '+name);return r.json();};
 const manifest=await json('estate-detail-manifest.json');
 if(manifest.schema!==1||manifest.replacements.length)throw Error('Unsupported estate detail package');
 const load=async(name,hash)=>{
  const r=await fetch(base+name,{cache:'no-store'});if(!r.ok)throw Error('Missing built estate geometry: '+name);
  const bytes=await r.arrayBuffer();const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(n=>n.toString(16).padStart(2,'0')).join('');
  if(digest!==hash)throw Error('Estate geometry receipt mismatch: '+name);
  return new Promise((resolve,reject)=>loader.parse(bytes,'',resolve,reject));
 };
 const gltf=await load('estate-detail.glb',manifest.glb_sha256),library=new Map();gltf.scene.traverse(o=>library.set(key(o.name),o));
 const placements=[];root.traverse(o=>{if(manifest.prop_replacements[o.userData.prop])placements.push(o);});
 /* COVERAGE, not a count recorded elsewhere (10 Sep 2026, goal g38071c0). This required the
    number of placed props to equal spec.count, a constant authored into the detail library
    when it was built. The courtyard size study places both size states' props - one hidden -
    so large-planter went from 53 to 84 and the whole split load fell back: the model never
    loaded, in the harness and in a real browser alike, with only a warning to say why.

    Same shape as the positional pins this goal retired: a number recorded at one moment,
    which every later legitimate change has to argue past. What the check is FOR is that the
    library covers every prop it claims to replace, and that nothing was dropped. Coverage is
    asserted here; "nothing dropped" is asserted against the generation's OWN placement
    record below, which moves with the model instead of standing still against it. */
 const uncovered=Object.entries(manifest.prop_replacements)
   .filter(([,spec])=>!library.has(key(spec.node))).map(([name])=>name);
 if(uncovered.length)throw Error('Estate detail library covers no node for: '+uncovered.join(', '));
 const placedCounts={};for(const o of placements)placedCounts[o.userData.prop]=(placedCounts[o.userData.prop]||0)+1;
 const dressing=await json('props-placement.json'),byProp=(dressing.counts||{}).by_prop||{};
 const short=Object.keys(manifest.prop_replacements)
   .filter(name=>byProp[name]!==undefined&&(placedCounts[name]||0)!==byProp[name])
   .map(name=>`${name} ${placedCounts[name]||0}/${byProp[name]}`);
 if(short.length)throw Error('Estate props placed do not match this generation: '+short.join(', '));
 for(const placed of placements){
  const replacement=clonePlacedDetail(library.get(key(manifest.prop_replacements[placed.userData.prop].node)),placed);
  placed.parent.add(replacement);root.updateMatrixWorld(true);
  if(envelopeExpansion(new THREE.Box3().setFromObject(placed),new THREE.Box3().setFromObject(replacement))>.015)throw Error('Estate prop expanded its accepted envelope');
  placed.parent.remove(placed);
 }
 const riverReceipt=await json('estate-river-manifest.json');
 if(riverReceipt.catalogue_sha256!==manifest.catalogue_sha256)throw Error('Mixed estate detail generation');
 const river=await load('estate-river.glb',riverReceipt.glb_sha256);
 let club=null;root.traverse(o=>{if(o.userData.element==='prop.river-club'&&o.userData.asset)club=o;});
 const planting=river.scene.getObjectByName(key('detail:river-club-planting'));
 if(!club||!planting)throw Error('River planting has no registered owner');
 planting.userData.designStudy=true;planting.userData.riverDetail=true;club.add(planting);
 const places=await preparePlaces(root,library,manifest,{manifest:base+'estate-detail-manifest.json',placements:base+'estate-places.json',ground:base+'estate-connector-ground.json'});
 window.__fcmEstateDetail={catalogue:manifest.catalogue_sha256,places,riverContainers:riverReceipt.containers.length};
 return window.__fcmEstateDetail;
}
