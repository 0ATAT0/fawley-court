/* Authored JavaScript source, never generated. Consumes GLB/manifest produced by
 * tools/design-study/build.py; that producer does not write this module. */
import * as THREE from 'three';
// Exact glTF name rule: removing dots alone missed ':' in detail:estate-bench.
export const detailNodeKey = name => THREE.PropertyBinding.sanitizeNodeName(name);
export const key = detailNodeKey;

export function clonePlacedDetail(library, placed) {
  // Exact: first-floor replacements lost child smassOnly, leaving pots suspended
  // when Open removed the terrace. Preserve placement AND its existence condition.
  const replacement=library.clone(true);
  replacement.name=placed.name;
  replacement.userData={...placed.userData,designStudy:true};
  replacement.position.copy(placed.position);
  replacement.quaternion.copy(placed.quaternion);
  replacement.scale.copy(placed.scale);
  const prefix=placed.name.match(/^smass_(c|o)_/);
  const only=placed.userData.smassOnly || (prefix ? (prefix[1]==='c'?'closed':'open') : null);
  // The size family is carried the same way and for the same reason: a small courtyard's
  // dressing is prefixed csize_s_ by the writer, and a replacement that lost the flag would
  // stand in the large position with nothing under it. Prefix table: viewer.html
  // STATE_PREFIXES, mirroring fcm/data/scene/placement_identity.py.
  const sizeOnly=placed.userData.sizeOnly || (/^csize_s_/.test(placed.name) ? 'small' : null);
  replacement.traverse(ch=>{ if(only) ch.userData.smassOnly=only;
    if(sizeOnly) ch.userData.sizeOnly=sizeOnly; });
  return replacement;
}

export function auditDetailState(root, massing, switches={}, size=null) {
  // Exhaustive over the loaded detail meshes, not a camera sample. A hidden
  // supporting terrace must never leave a visible replacement child behind.
  // `size` is the courtyard size state; passed null the size family is not audited, so
  // a caller that predates the family reports exactly what it did before.
  const result={detailMeshes:0,conditionalMeshes:0,visibleConditional:0,schemeMeshes:0,visibleScheme:0,sizeMeshes:0,visibleSize:0,vertexFoliage:0,errors:[]};
  root.traverse(o=>{
    if(!o.isMesh) return;
    let owner=o;
    while(owner && !owner.userData.designStudy) owner=owner.parent;
    if(!owner) return;
    result.detailMeshes++;
    if(o.userData.smassOnly){
      result.conditionalMeshes++;
      if(o.visible) result.visibleConditional++;
      if(o.visible && o.userData.smassOnly!==massing) result.errors.push('unsupported state: '+o.name);
    }
    if(o.userData.sizeOnly){
      result.sizeMeshes++;
      if(o.visible) result.visibleSize++;
      if(o.visible && size && o.userData.sizeOnly!==size) result.errors.push('unsupported size: '+o.name);
    }
    const sw=o.userData.schemeSwitch;
    if(sw){
      result.schemeMeshes++;
      if(o.visible) result.visibleScheme++;
      if(o.visible && switches[sw]===false) result.errors.push('disabled scheme: '+o.name);
    }
    if(o.visible && (owner.userData.layer==='prop'||owner.userData.riverDetail)) for(const m of (Array.isArray(o.material)?o.material:[o.material])) {
      if(m.vertexColors && /^(foliage|leaf_)/.test(m.name)) {
        result.vertexFoliage++;
        if(m.color.toArray().some(x=>Math.abs(x-1)>1e-6)) result.errors.push('double leaf tint: '+o.name);
      }
    }
  });
  return result;
}

export function envelopeExpansion(a,b) {
  // Exact box containment instrument, not a shape-equivalence test.
  // The first instrument falsely called a 0.628m inward crown reduction a displacement.
  // Porous replacement foliage may recede within its source box; it must not expand it.
  return Math.max(0,a.min.x-b.min.x,a.min.y-b.min.y,a.min.z-b.min.z,
    b.max.x-a.max.x,b.max.y-a.max.y,b.max.z-a.max.z);
}

