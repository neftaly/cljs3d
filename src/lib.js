import * as THREE from 'three';
import immstruct from "immstruct";
import { fromJS } from "immutable";
import memoizee from "memoizee";

const materials = {
  grey: new THREE.MeshPhongMaterial({ color: 0x202020 }),
  floorMat: new THREE.MeshStandardMaterial({
    roughness: 0.8,
    color: 0xffffff,
    metalness: 0.2,
    bumpScale: 0.0005
  })
};

const createGeometry = memoizee(
  (Obj, ...args) => console.log('newGeo', Obj, args) || new Obj(...args),
  { length: false }
);

const createMesh = ({
  geometry = THREE.BoxBufferGeometry,
  size = [1, 1, 1],
  material = materials.grey,
  position,
  castShadow = true,
  receiveShadow = false,
  rotation
}) => {
  const mesh = new THREE.Mesh(
    createGeometry(geometry, ...size),
    material
  );
  mesh.castShadow = castShadow;
  mesh.receiveShadow = receiveShadow;
  if (rotation) {
    mesh.rotation.x = rotation[0] || 0;
    mesh.rotation.y = rotation[1] || 0;
    mesh.rotation.z = rotation[2] || 0;
  }
  return fromJS({ material, position, mesh, rotation });
};

const structure = immstruct({});

export {
 materials,
 createMesh,
 structure
};
