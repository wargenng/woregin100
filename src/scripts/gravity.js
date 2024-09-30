import * as THREE from "three";

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.setZ(5);

const renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector("#gravity"),
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(380, 380);
renderer.setClearColor(0xf1f1ef, 1);

const geometry = new THREE.CircleGeometry(1, 32);
const material = new THREE.MeshBasicMaterial({
    color: 0x000000,
    wireframe: false,
});
const circle = new THREE.Mesh(geometry, material);
circle.position.y = 2.875;
scene.add(circle);

let velocity = 0;
const gravity = 0.001;

const groundLevel = -3.875;

function animate() {
    velocity -= gravity;
    circle.position.y += velocity;

    if (circle.position.y - 1 <= groundLevel) {
        circle.position.y = groundLevel + 1;
        velocity = 0;
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();
