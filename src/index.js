import * as THREE from 'three';
import Stats from 'stats.js';
import OrbitControls from 'three-orbitcontrols';

import { fromJS } from "immutable";
import { materials, createMesh, structure } from './lib';

var camera, scene, renderer,
  bulbLight, bulbMat, hemiLight, stats;

function init() {

  var container = document.getElementById( 'container' );

  stats = new Stats();
  container.appendChild( stats.dom );

  camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 0.1, 100 );
  camera.position.x = - 4;
  camera.position.z = 4;
  camera.position.y = 2;

  scene = new THREE.Scene();

  var bulbGeometry = new THREE.SphereBufferGeometry( 0.02, 16, 8 );
  bulbLight = new THREE.PointLight( 0xffee88, 1, 100, 2 );

  bulbMat = new THREE.MeshStandardMaterial( {
    emissive: 0xffffee,
    emissiveIntensity: 1,
    color: 0x000000
  } );
  bulbLight.add( new THREE.Mesh( bulbGeometry, bulbMat ) );
  bulbLight.position.set( 0, 2, 0 );
  bulbLight.castShadow = true;
  scene.add( bulbLight );

  hemiLight = new THREE.HemisphereLight( 0xddeeff, 0x0f0e0d, 0.02 );
  hemiLight.intensity = 0.5;
  scene.add( hemiLight );

  structure.on('swap', (struct, old, path) => {
    struct.map((object, id) => {
      const { mesh, position, rotation } = object.toJS();
      if (!old.has(id)) scene.add(mesh);
      if (rotation) {
        mesh.rotation.x = rotation[0] || 0;
        mesh.rotation.y = rotation[1] || 0;
        mesh.rotation.z = rotation[2] || 0;
      }
      if (position) mesh.position.set(...position);
    });
  });

  renderer = new THREE.WebGLRenderer();
  renderer.physicallyCorrectLights = true;
  renderer.gammaInput = true;
  renderer.gammaOutput = true;
  renderer.shadowMap.enabled = true;
  renderer.toneMapping = THREE.ReinhardToneMapping;
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  container.appendChild( renderer.domElement );


  var controls = new OrbitControls( camera, renderer.domElement );

  window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );
}

//

function animate() {
  requestAnimationFrame(animate);
  render();
}

function render() {
  renderer.toneMappingExposure = Math.pow( 0.68, 5.0 ); // to allow for very bright scenes.
  renderer.shadowMap.enabled = true;
  bulbLight.castShadow = true;

  bulbLight.power = 1700;
  bulbMat.emissiveIntensity = bulbLight.intensity / Math.pow( 0.02, 2.0 ); // convert from intensity to irradiance at bulb surface

  var time = Date.now() * 0.0005;

  bulbLight.position.y = Math.cos( time ) * 0.75 + 2.25;

  renderer.render( scene, camera );

  stats.update();
}

export default function () {
  init();
  animate();

  const ddd = {
    box1: createMesh({ position: [1, 1, 1] }),
    box2: createMesh({ position: [-1, 1, -1] }),
    ball1: createMesh({ position: [0, 0.25, 1], size: [0.25, 32, 32], geometry: THREE.SphereBufferGeometry }),
    floor: createMesh({
      geometry: THREE.PlaneBufferGeometry,
      material: materials.floorMat,
      size: [20, 20],
      rotation: [ -Math.PI / 2.0 ],
      castShadow: false,
      receiveShadow: true
    })
  };
  structure.cursor().set(fromJS(ddd));
  setTimeout(
    () => structure.cursor(['ball1', 'position', 0]).set(2), 500
  );
}
