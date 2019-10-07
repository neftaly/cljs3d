import * as THREE from 'three';
import { fromJS } from 'immutable';
import memoizee from 'memoizee';

const materials = {
  grey: new THREE.MeshPhongMaterial({ color: 0x202020 }),
  floorMat: new THREE.MeshStandardMaterial({
    roughness: 0.8,
    color: 0xffffff,
    metalness: 0.8,
    bumpScale: 0.05
  }),
  bulbMat: new THREE.MeshStandardMaterial({
    emissive: 0xffffee,
    emissiveIntensity: 135,
    color: 0x000000
  })
};

// object[key].x/y/z = [x, y, z]
const assignVector3 = (object, key, vector = []) => {
  const [x = 0, y = 0, z = 0] = vector;
  Object.assign(object[key], { x, y, z });
  return object;
};

// Create a brand new object
const createUniqObject = (Primitive, params = [], opts = {}, bulbLight) => {
  const object = new Primitive(...params);
  Object.assign(object, opts);
  return object;
};

// Create a memoized object (i.e. for a mesh)
const createObject = memoizee(createUniqObject, { length: false });

// Add an entity from an immutable map to a scene
const addEntity = scene => i => {
  scene.add(i.get('object'));
  updateEntity(i);
};

// Apply changes from an immutable map to the entity within
const updateEntity = i => {
  const { object, position, rotation } = i.toJS();
  if (rotation) assignVector3(object, 'rotation', rotation);
  if (position) assignVector3(object, 'position', position);
};

// Create a threejs object and return ImmutableJS map referencing it
const create = args => {
  const {
    isMesh = true,
    primitive,
    params,
    material = materials.grey,
    position,
    rotation,
    add,
    ...opts
  } = args;
  console.log(args);
  const options = {
    castShadow: true,
    receiveShadow: true,
    ...opts
  };
  const object = (() => {
    if (!isMesh) return createUniqObject(primitive, params, opts);
    return Object.assign(
      new THREE.Mesh(createObject(primitive, params), material),
      options
    );
  })();
  if (add) object.add(add); // hack for bulblight
  const entity = fromJS({ ...args, ...options, object });
  return entity;
};

const handler = scene => (state, oldState, path) => {
  const { length } = path;
  if (length === 0) return state.map(addEntity(scene));
  if (length === 1 && !oldState.hasIn(path)) return addEntity(scene)(state);
  const entity = state.get(path[0]);
  updateEntity(entity);
};

export {
  materials,
  create,
  handler
};
