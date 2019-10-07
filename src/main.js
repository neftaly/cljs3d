import * as THREE from 'three';
import Stats from 'stats.js';
import OrbitControls from 'three-orbitcontrols';
import { Map, fromJS } from 'immutable';
import Cursor from 'immutable-cursor';
import raf from 'raf';
import { materials, create, handler } from './lib';

const init = ({ initialState, container }) => {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
  Object.assign(camera.position, { x: -4, y: 2, z: 4 });
  const stats = new Stats();
  container.appendChild(stats.dom);

  const renderer = Object.assign(new THREE.WebGLRenderer(), {
    physicallyCorrectLights: true,
    gammaInput: true,
    gammaOutput: true,
    toneMapping: THREE.ReinhardToneMapping,
    toneMappingExposure: Math.pow(0.68, 5.0) // to allow for very bright scenes.
  });
  renderer.shadowMap.enabled = true;
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  container.appendChild(renderer.domElement);

  const animate = (cursor, time = Date.now() / 1000) => {
    // Implement using http://conal.net/papers/icfp97/ or similar?
    // animate(state, oldState, timeDelta)
    // var time = Date.now() * 0.0005;
    // bulbLight.position.y = Math.cos( time ) * 0.75 + 2.25;
    cursor.cursor(['ball1', 'position', 1]).set(
      Math.sin(time*2) + 1
    );

    cursor.cursor(['ball1', 'position', 0]).set(
      Math.sin(time) - 1
    );

    cursor.cursor(['box1', 'rotation', 1]).set(
      Math.tan(time)/100
    );
    cursor.cursor(['box1', 'rotation', 2]).set(
      Math.tan(time*2)/100
    );

    cursor.cursor(['box2', 'rotation', 1]).set(
      time
    );

    raf(() => animate(cursor));
    renderer.render(scene, camera);
    stats.update();
  };

  const controls = new OrbitControls(camera, renderer.domElement);
  console.log({ controls });
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, false);

  const cursor = Cursor.from(Map(), handler(scene));
  cursor.set(initialState); // Trigger initial update
  animate(cursor);

  return cursor;
};

const main = (container) => {
  const initialState = fromJS({
    bulbLight: create({
      isMesh: false,
      primitive: THREE.PointLight,
      params: [0xffee88, 1, 100, 2],
      position: [0, 2, 0],
      castShadow: true,
      power: 1700,
      bulbLight: true,
      add: new THREE.Mesh(
        new THREE.SphereBufferGeometry(0.02, 16, 8),
        materials.bulbMat
      )
    }),

    hemiLight: create({
      isMesh: false,
      primitive: THREE.HemisphereLight,
      params: [0xffffff, 0xffffff, 1],
      intensity: 1
    }),
    box1: create({
      primitive: THREE.BoxBufferGeometry,
      params: [1, 1, 1],
      position: [1, 1, 1],
      rotation: [0, 0, 0]
    }),
    box2: create({
      primitive: THREE.BoxBufferGeometry,
      params: [1, 1, 1],
      position: [-1, 1, -1],
      rotation: [0, 0, 0]
      // animation: [ { t: Date.now(), name: 'bounce' } ] // TODO: animation FIFO queue?
    }),
    ball1: create({
      primitive: THREE.SphereBufferGeometry,
      params: [0.25, 32, 32],
      position: [0, 0.25, 1]
    }),
    floor: create({
      primitive: THREE.PlaneBufferGeometry,
      params: [20, 20],
      position: [0, 0, 0],
      material: materials.floorMat,
      rotation: [-Math.PI / 2.0],
      castShadow: false,
      receiveShadow: true
    })
  });
  const structure = init({ container, initialState });
};

export default main;
