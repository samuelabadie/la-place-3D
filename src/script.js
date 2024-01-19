import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import GUI from 'lil-gui';

// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 3, 200);
camera.position.set(-6, 7, 8);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 0.75, 0);
controls.enableDamping = true;
controls.enableZoom = false;

controls.minPolarAngle = Math.PI / 3;
controls.maxPolarAngle = Math.PI / 2;

controls.minAzimuthAngle = -Math.PI / 6;
controls.maxAzimuthAngle = Math.PI / 36;

controls.update();

/**
 * Lights
 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFD78A, 1.5);
directionalLight.castShadow = true;
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 1, 5);
directionalLight.shadow.mapSize.width = 1024;
scene.add(directionalLight);

const secondLight = new THREE.DirectionalLight(0xFFBF42, 0.9);
secondLight.castShadow = true;
secondLight.shadow.camera.far = 15;
secondLight.shadow.camera.left = -7;
secondLight.shadow.camera.top = 7;
secondLight.shadow.camera.right = 7;
secondLight.shadow.camera.bottom = -7;
secondLight.position.set(1, 3, -10);
secondLight.shadow.mapSize.width = 1024;
scene.add(secondLight);

const sceneLoader = new GLTFLoader();

sceneLoader.load(
    '/models/Scene/Scene.glb',
    (gltf) => {
        gltf.castShadow = true;
        gltf.receiveShadow = true;
        console.log(gltf);
        scene.add(gltf.scene);
    },
)

const cigarLoader = new GLTFLoader();

cigarLoader.load(
    '/models/Cigar/cigare.glb',
    (gltf) => {
        const cigar = gltf.scene.children[0];

        if (cigar) {
            cigar.castShadow = true;
            scene.add(cigar);
            cigar.position.set(-2, 3.2, 1);
            cigar.scale.set(0.08, 0.4, 0.08);
            cigar.rotation.x = Math.PI / 0.7;

            // Set the target of the controls to the position of the cigar
            controls.target.copy(cigar.position);
        } else {
            console.error('Cigar not found in the loaded GLTF scene.');
        }
    },
);


window.addEventListener('dblclick', () =>
{
    const fullscreenElement = document.fullscreenElement || document.webkitFullscreenElement

    if(!fullscreenElement)
    {
        if(canvas.requestFullscreen)
        {
            canvas.requestFullscreen()
        }
        else if(canvas.webkitRequestFullscreen)
        {
            canvas.webkitRequestFullscreen()
        }
    }
    else
    {
        if(document.exitFullscreen)
        {
            document.exitFullscreen()
        }
        else if(document.webkitExitFullscreen)
        {
            document.webkitExitFullscreen()
        }
    }
})

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
});
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

const tick = () => {
    const elapsedTime = clock.getElapsedTime();
    const deltaTime = elapsedTime - previousTime;
    previousTime = elapsedTime;

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();
