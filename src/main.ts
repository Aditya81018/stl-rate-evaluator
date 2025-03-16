import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// @ts-ignore
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe0e0e0);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 50, -50);
camera.lookAt(0, 0, 0);

// const light1 = new THREE.AmbientLight(0xffffff, 100); // soft white light
// scene.add(light1);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x8d8d8d, 3);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 3);
dirLight.position.set(0, 20, 10);
scene.add(dirLight);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

function animate() {
  controls.update();
  renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);

// @ts-ignore
const loader = new STLLoader();
let mesh: any = undefined;

document.getElementById("stl-file")?.addEventListener("change", (event) => {
  loader.load(
    // @ts-ignore
    window.URL.createObjectURL(event.target?.files[0]),
    function (geometry: any) {
      if (mesh !== undefined) scene.remove(mesh);
      mesh = new THREE.Mesh(
        geometry,
        new THREE.MeshStandardMaterial({
          color: 0xaaaaaa,
        })
      );
      mesh.rotation.set(-Math.PI / 2, 0, 0);
      geometry.center();
      scene.add(mesh);

      const volume = Number((getVolume(geometry) / 1000).toFixed(2));
      const mass = Number((volume * 0.68).toFixed(2));
      const rate = Number((mass * 6).toFixed(2));

      // @ts-ignore
      document.getElementById("volume").innerText = `Volume: ${volume}cm³`;
      // @ts-ignore
      document.getElementById("mass").innerText = `Mass: ${mass}g`;
      // @ts-ignore
      document.getElementById("rate").innerText = `Rate: ${rate}Rs`;
    }
  );
});

function getVolume(geometry: any) {
  let position = geometry.attributes.position;
  let faces = position.count / 3;
  let sum = 0;
  let p1 = new THREE.Vector3(),
    p2 = new THREE.Vector3(),
    p3 = new THREE.Vector3();
  for (let i = 0; i < faces; i++) {
    p1.fromBufferAttribute(position, i * 3 + 0);
    p2.fromBufferAttribute(position, i * 3 + 1);
    p3.fromBufferAttribute(position, i * 3 + 2);
    sum += signedVolumeOfTriangle(p1, p2, p3);
  }
  return sum;
}

function signedVolumeOfTriangle(p1: any, p2: any, p3: any) {
  return p1.dot(p2.cross(p3)) / 6.0;
}
