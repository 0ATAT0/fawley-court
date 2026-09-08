/* Remove one named source specimen in the places preview. World Y is height.
 * Defect: source specimen 148 retained at the trunk picked by Angus on 8 Sep.
 * Exact connected-component removal; never use a broad terrain/tree cut box. */
export function components(geometry,THREE,matrix){
 const p=geometry.attributes.position,index=geometry.index,parent=new Map(),keys=[];
 const find=k=>{let r=k;while(parent.get(r)!==r)r=parent.get(r);while(k!==r){const next=parent.get(k);parent.set(k,r);k=next;}return r;};
 for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(matrix);const k=v.toArray().map(n=>n.toFixed(4)).join(',');keys.push(k);if(!parent.has(k))parent.set(k,k);}
 const faces=[];
 for(let i=0;i<(index?index.count:p.count);i+=3){const ids=[0,1,2].map(j=>index?index.getX(i+j):i+j);for(const id of ids.slice(1))parent.set(find(keys[id]),find(keys[ids[0]]));faces.push(ids);}
 const groups=new Map();
 faces.forEach(ids=>{const key=find(keys[ids[0]]);if(!groups.has(key))groups.set(key,{faces:[],box:new THREE.Box3()});const g=groups.get(key);g.faces.push(ids);for(const id of ids)g.box.expandByPoint(new THREE.Vector3().fromBufferAttribute(p,id).applyMatrix4(matrix));});
 return [...groups.values()];
}
export function removeSpecimen148(root,THREE){
 root.updateMatrixWorld(true);const report=[];
 for(const [name,count,radius] of [['phase4plantingsource-specimenstrunks',1,.5],['phase4plantingsource-specimens',3,4]]){
  const matches=[];root.traverse(o=>{if(o.isMesh&&o.name.replace(/\./g,'')===name)matches.push(o);});
  if(matches.length!==1)throw Error('Specimen removal requires one aggregate: '+name);
  const o=matches[0],groups=components(o.geometry,THREE,o.matrixWorld);
  const removed=groups.filter(g=>{const c=g.box.getCenter(new THREE.Vector3());return Math.hypot(c.x+103.074,c.z-4.354)<radius;});
  if(removed.length!==count)throw Error('Specimen 148 component identity mismatch: '+name+' '+removed.length);
  const before=groups.reduce((n,g)=>n+g.faces.length,0),faces=groups.filter(g=>!removed.includes(g)).flatMap(g=>g.faces).flat();
  o.geometry=o.geometry.clone();o.geometry.setIndex(faces);o.geometry.computeBoundingBox();o.geometry.computeBoundingSphere();
  report.push({source:'source.planting.specimen-tree-148',name,components:removed.length,removedTriangles:before-faces.length/3,centres:removed.map(g=>g.box.getCenter(new THREE.Vector3()).toArray())});
 }
 return report;
}
