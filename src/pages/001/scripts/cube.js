import * as THREE from "three";

const canvas = document.querySelector("#cube");
if (canvas) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({ canvas });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(380, 380);
    renderer.setClearColor(0xf1f1ef, 1);

    camera.position.setZ(5);

    const geometry = new THREE.BoxGeometry(3, 3, 3);
    const material = new THREE.MeshBasicMaterial({
        color: 0x000000,
        wireframe: true,
    });

    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
        cube.rotation.x += 0.005;
        cube.rotation.y += 0.005;
    }

    animate();
}
