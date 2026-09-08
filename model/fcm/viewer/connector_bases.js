/* Authored study geometry treatment. The promoted generation remains immutable.
 * Defect: connector bottom caps ended at the nominal datum, above adjacent
 * terrain, exposing a serrated ground junction. Extend only the buried footing.
 * Exact vertex policy; no new triangles, material, footprint or placement change.
 */
export const FOOTING_DROP = .30;
export const BRICK_PLINTH_HEIGHT = 1.302;
export function underPlinthCap(x,z,triangles){
 return triangles.some(t=>{
  const distances=t.map((a,i)=>{const b=t[(i+1)%3];return ((b[0]-a[0])*(z-a[2])-(b[2]-a[2])*(x-a[0]))/Math.hypot(b[0]-a[0],b[2]-a[2]);});
  return distances.every(d=>d>=-.002)||distances.every(d=>d<=.002);
 });
}
export function seatSouthCourtyardBrick(root,THREE){
 // South courtyard has unplinthed arcade infill: NEVER raise its brick base.
 // Recess only brick vertices meeting a stone plinth face, preserving every Y.
 root.updateMatrixWorld(true);const bricks=[],report=[];
 root.traverse(o=>{if(o.isMesh&&/^(smass_[a-z]_)?prop\.south-courtyard$/.test(o.name)&&!Array.isArray(o.material)&&o.material?.name.startsWith('wall_brick'))bricks.push(o);});
 const ground=Math.min(...bricks.map(o=>new THREE.Box3().setFromObject(o).min.y));
 for(const o of bricks){
  const base=new THREE.Box3().setFromObject(o).min.y;if(Math.abs(base-ground)>.01)continue;
  const sides=[],caps=[];
  root.traverse(stone=>{
   if(!stone.isMesh||stone.name!==o.name||Array.isArray(stone.material)||!stone.material?.name.startsWith('stone_detail'))return;
   const g=stone.geometry,p=g.attributes.position,index=g.index;
   for(let i=0;i<(index?index.count:p.count);i+=3){
    const t=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,index?index.getX(i+j):i+j).applyMatrix4(stone.matrixWorld));
    if(Math.max(...t.map(v=>v.y))-Math.min(...t.map(v=>v.y))<.004&&t.every(v=>v.y>base+.37&&v.y<base+.447))caps.push(t.map(v=>v.toArray()));
    if(Math.min(...t.map(v=>v.y))>base+.03||Math.max(...t.map(v=>v.y))>base+.445||Math.max(...t.map(v=>v.y))-Math.min(...t.map(v=>v.y))<.3)continue;
    const triangle=new THREE.Triangle(...t),normal=triangle.getNormal(new THREE.Vector3());
    if(Math.abs(normal.y)<.05)sides.push({triangle,normal});
   }
  });
  if(!sides.length)throw Error('South courtyard has no measured stone plinth faces');
  o.geometry=o.geometry.clone();const p=o.geometry.attributes.position,inverse=o.matrixWorld.clone().invert();let changed=0;
  const vertexNormals=new Map(),normalMatrix=new THREE.Matrix3().getNormalMatrix(o.matrixWorld);
  const positionKey=v=>v.toArray().map(n=>n.toFixed(5)).join(',');
  // A stone return can stop inside a longer brick face. Decide that join on
  // the whole face, including its lower endpoints outside the stone footprint.
  const facePlanes=new Map(),index=o.geometry.index;
  for(let i=0;i<(index?index.count:p.count);i+=3){
   const t=[0,1,2].map(j=>new THREE.Vector3().fromBufferAttribute(p,index?index.getX(i+j):i+j).applyMatrix4(o.matrixWorld));
   if(t.every(v=>v.y>base+.445))continue;
   const triangle=new THREE.Triangle(...t);
   for(const side of sides){
    if(!t.every(v=>Math.abs(v.clone().sub(side.triangle.a).dot(side.normal))<.004))continue;
    const centre=side.triangle.getMidpoint(new THREE.Vector3());
    if(triangle.closestPointToPoint(centre,new THREE.Vector3()).distanceTo(centre)>.002)continue;
    for(const v of t.filter(v=>v.y<=base+.445)){
     const key=positionKey(v),list=facePlanes.get(key)||[];
     if(!list.some(n=>Math.abs(n.dot(side.normal))>.999))list.push(side.normal);
     facePlanes.set(key,list);
    }
   }
  }
  for(let i=0;i<p.count;i++){
   const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);
   const n=new THREE.Vector3().fromBufferAttribute(o.geometry.attributes.normal,i).applyMatrix3(normalMatrix).normalize();
   if(Math.abs(n.y)>.5)continue;
   const key=positionKey(v),list=vertexNormals.get(key)||[];list.push(n);vertexNormals.set(key,list);
  }
  for(let i=0;i<p.count;i++){
   const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);if(v.y>base+.445)continue;
   const spanning=facePlanes.get(positionKey(v)),normals=[...(spanning||[])];
   for(const side of sides){
    if(Math.abs(v.clone().sub(side.triangle.a).dot(side.normal))>.004)continue;
    if(side.triangle.closestPointToPoint(v,new THREE.Vector3()).distanceTo(v)>.03)continue;
    if(!normals.some(n=>Math.abs(n.dot(side.normal))>.999))normals.push(side.normal);
   }
   if(!normals.length)continue;
   // Pick a bounded displacement inside the measured stone footprint and clear
   // of EVERY coincident plane. Opposed end faces of abutting boxes cannot cancel.
   const candidates=Array.from({length:16},(_,j)=>new THREE.Vector3(Math.cos(j*Math.PI/8)*.012,0,Math.sin(j*Math.PI/8)*.012))
    .filter(d=>normals.every(n=>Math.abs(n.dot(d))>.004)&&(underPlinthCap(v.x+d.x,v.z+d.z,caps)||spanning));
   const outward=vertexNormals.get(positionKey(v))||[];
   candidates.sort((a,b)=>outward.reduce((s,n)=>s+n.dot(a),0)-outward.reduce((s,n)=>s+n.dot(b),0));
   if(!candidates.length)continue;
   v.add(candidates[0]).applyMatrix4(inverse);p.setXYZ(i,v.x,v.y,v.z);changed++;
  }
  p.needsUpdate=true;o.geometry.computeBoundingBox();o.geometry.computeBoundingSphere();
  report.push({name:o.name,base,changed,maxRecess:.012});
 }
 if(report.length<2)throw Error('South courtyard ground-bearing brick meshes missing');
 return report;
}
export function seatBrickAbovePlinth(root,THREE,bases){
 // Defect: brick and stone occupied the same connector wall plane below the
 // 1.30 m plinth top. Draco decoding left sub-millimetre offsets and brick stripes.
 // Retain each wall solid's bottom cap, lifting its hidden lower vertices to the
 // plinth joint. All coordinates above the joint, materials and indices remain.
 const report=[];
 for(const base of bases.filter(r=>r.name.endsWith('_Mesh_6'))){
  const o=root.getObjectByName(base.name),p=o.geometry.attributes.position;
  const inverse=o.matrixWorld.clone().invert(),top=base.base+BRICK_PLINTH_HEIGHT;
  let changed=0;
  for(let i=0;i<p.count;i++){
   const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);
   if(v.y>=top)continue;
   v.y=top;v.applyMatrix4(inverse);p.setXYZ(i,v.x,v.y,v.z);changed++;
  }
  p.needsUpdate=true;o.geometry.computeBoundingBox();o.geometry.computeBoundingSphere();
  report.push({name:o.name,top,changed});
 }
 if(report.length!==2)throw Error('Both connector brick/plinth joins are required');
 return report;
}
export async function repairConnectorGround(root,THREE,run,url='./place-making/connector-ground.json'){
 const response=await fetch(url,{cache:'no-store'});
 if(!response.ok)throw Error('Build the measured connector paving junctions');
 const data=await response.json();if(data.run!==run)throw Error('Connector junctions belong to another generation');
 const court=root.getObjectByName('phase4hardstandingcourt');
 if(!court?.isMesh)throw Error('Connector paving has no court material owner');
 const inverse=root.matrixWorld.clone().invert();
 for(const [i,row] of data.objects.entries()){
  const positions=[];
  for(const face of row.faces){
   const p=face.map(v=>new THREE.Vector3(...v));
   if(p[1].clone().sub(p[0]).cross(p[2].clone().sub(p[0])).y<0)p.reverse();
   for(const v of p)positions.push(...v.applyMatrix4(inverse).toArray());
  }
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();
  const o=new THREE.Mesh(g,court.material);o.name='connector-paving-junction-'+i;
  o.userData={...court.userData,element:'area.arrival-court',connectorJunction:true};o.receiveShadow=court.receiveShadow;o.castShadow=court.castShadow;root.add(o);
 }
 return data.objects.map(o=>({owner:o.owner,area:o.area,triangles:o.faces.length}));
}
export function repairConnectorBases(root, THREE) {
 root.updateMatrixWorld(true);
 const names=new Set(['main-house-north-wing_Mesh_6','main-house-north-wing_Mesh_7','south-wing_Mesh_6','south-wing_Mesh_7']);
 const report=[];
 root.traverse(o=>{
  if(!names.has(o.name)||!o.isMesh)return;
  const g=o.geometry.clone(),p=g.attributes.position,world=o.matrixWorld,inverse=world.clone().invert();
  let base=Infinity;
  for(let i=0;i<p.count;i++)base=Math.min(base,new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(world).y);
  let changed=0;
  for(let i=0;i<p.count;i++){
   const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(world);
   if(v.y>base+.025)continue;
   v.y-=FOOTING_DROP;v.applyMatrix4(inverse);p.setXYZ(i,v.x,v.y,v.z);changed++;
  }
  if(!changed)throw Error('Connector footing treatment found no base vertices: '+o.name);
  p.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();o.geometry=g;
  report.push({name:o.name,base,changed,drop:FOOTING_DROP});
 });
 if(report.length!==4)throw Error('Connector footing treatment requires both brick and stone meshes on both wings');
 return report;
}
