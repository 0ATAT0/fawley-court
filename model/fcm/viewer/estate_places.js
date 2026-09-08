/* Authored assembly of measured illustrative dressing; physical owners retain
 * their existing financial identities. No new capex lines or building footprints. */
import * as THREE from '../../out/vendor/three/three.module.js';
import {removeSpecimen148} from './specimen_removal.js';
import {repairConnectorBases,repairConnectorGround,seatBrickAbovePlinth,seatSouthCourtyardBrick} from './connector_bases.js';
export async function preparePlaces(root,library,manifest,urls=null){
 const removedSpecimen=removeSpecimen148(root,THREE);
 const connectorBases=repairConnectorBases(root,THREE);
 const brickPlinthJoins=seatBrickAbovePlinth(root,THREE,connectorBases);
 const southCourtyardBases=seatSouthCourtyardBrick(root,THREE);
 const connectorGround=await repairConnectorGround(root,THREE,manifest.run,urls?.ground);
 const response=await fetch(urls?.placements||'./place-making/placements.json',{cache:'no-store'});
 if(!response.ok)throw Error('Place-making layout has not been built');
 const layout=await response.json();
 if(urls ? layout.catalogue_sha256!==manifest.catalogue_sha256 : layout.run!==manifest.run)throw Error('Place-making layout belongs to another generation');
 const manifestBytes=await (await fetch(urls?.manifest||'./place-making/manifest.json',{cache:'no-store'})).arrayBuffer();
 const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',manifestBytes))].map(n=>n.toString(16).padStart(2,'0')).join('');
 if(!urls&&digest!==layout.source_hashes['manifest.json'])throw Error('Layout was measured against another furniture library');
 const remove=new Set(layout.replace_existing),found=[];
 root.traverse(o=>{if(remove.has(o.name))found.push(o);});
 if(found.length!==remove.size)throw Error('Old River Club dressing replacement is incomplete');
 const objects=[];
 const gardenOn=new URLSearchParams(location.search).get('garden')!=='0';
 for(const p of layout.objects){
  if(!gardenOn&&p.id.startsWith('dress.places.garden-'))continue;
  const spec=manifest.place_assets[p.asset];if(!spec)throw Error('Missing compact asset: '+p.asset);
  const source=library.get(THREE.PropertyBinding.sanitizeNodeName(spec.node));if(!source)throw Error('Missing compact library node: '+spec.node);
  const o=source.clone(true);o.name=p.id;
  o.position.set(p.x,p.z,-p.y);o.rotation.set(0,THREE.MathUtils.degToRad(p.yaw),0);
  o.userData={layer:'prop',element:p.owner,asset:p.asset,prop:p.asset,rule:'places-'+p.zone,
   designStudy:true,placeMaking:true,placement_basis:layout.basis,support_range_m:p.support_range,
   schemeSwitch:p.switch||null,schemeRole:'scheme-work'};
  // This small authored precinct crosses the default 100 m cell boundaries.
  // Share repeated garden geometry across the precinct; retain every logical ID.
  if(p.id.startsWith('dress.places.garden-'))o.traverse(ch=>{ch.userData.renderBatchGroup='courtyard-garden';});
  // Four arrival beds straddle world Z=0. Keep this single small composition
  // together rather than paying twice for each shared material at that grid line.
  if(p.id.startsWith('dress.places.arrival-edge-'))o.traverse(ch=>{ch.userData.renderBatchGroup='arrival-borders';});
  if(p.switch)o.traverse(ch=>{ch.userData.schemeSwitch=p.switch;ch.userData.schemeRole='scheme-work';});
  root.add(o);o.updateMatrixWorld(true);
  const box=new THREE.Box3().setFromObject(o);
  if(Math.abs(box.min.y-p.z)>.004)throw Error('New furniture does not meet its measured support: '+p.id);
  objects.push(o);
 }
 found.forEach(o=>o.parent.remove(o));
 const report={added:objects.length,replaced:found.length,zones:{},basis:layout.basis,route_width_m:1.5,gardenOn,connectorBases,connectorGround,brickPlinthJoins,southCourtyardBases,removedSpecimen};
 for(const p of layout.objects){
  if(!gardenOn&&p.id.startsWith('dress.places.garden-'))continue;
  report.zones[p.zone]=(report.zones[p.zone]||0)+1;
 }
 window.__fcmPlaces=report;
 return report;
}
