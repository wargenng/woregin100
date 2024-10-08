import * as THREE from "three";
import { FontLoader } from "three/addons/loaders/FontLoader.js";
import { TextGeometry } from "three/addons/geometries/TextGeometry.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf1f1ef);

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.z = 2;

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#background"),
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(380, 380);

const loader = new FontLoader();
const letters = [];
loader.load("fonts/Open_Sans_Condensed_Bold.json", function (font) {
    for (const letter of "HI") {
        const geometry = new TextGeometry(letter, {
            font: font,
            size: 6,
            depth: 2,
        });

        const textMesh = new THREE.Mesh(
            geometry,
            new THREE.MeshBasicMaterial({
                color: 0x000000,
                wireframe: true,
            })
        );

        textMesh.position.x = startPositions[letters.length].x;
        textMesh.position.y = startPositions[letters.length].y;
        textMesh.position.z = -5;

        textMesh.rotation.x = THREE.MathUtils.randFloat(0, 0.15);
        textMesh.rotation.y = THREE.MathUtils.randFloat(0, 0.15);
        textMesh.rotation.z = THREE.MathUtils.randFloat(0, 0.15);

        letters.push(textMesh);
        scene.add(textMesh);
    }
});

const xoffset = 2;

const startPositions = [
    { x: -4.8 + xoffset, y: -3 },
    { x: -1 + xoffset, y: -3 },
];

function animate() {
    renderer.render(scene, camera);
    letters.forEach((letter, i) => {
        letter.rotation.x = letter.rotation.x + (i % 2 ? 0.0005 : -0.0005);
        letter.rotation.y = letter.rotation.y + (i % 2 ? 0.0005 : -0.0005);
        letter.rotation.z = letter.rotation.z + (i % 2 ? 0.0005 : -0.0005);
    });
    requestAnimationFrame(animate);
}
animate();
