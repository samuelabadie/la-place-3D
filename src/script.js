import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { TweenMax } from 'gsap';
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


const fontPath  = './font.json';
const fontLoader = new FontLoader()
fontLoader.load(
    fontPath,
    (font) => {
        const textGeometry = new TextGeometry(
            'Garcia 12',
            {
                font: font,
                size: 0.5,
                height: 0.1,
                curveSegments: 6,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 4
            }
        )
        textGeometry.computeBoundingBox()
        textGeometry.center()
        const textMaterial = new THREE.MeshMatcapMaterial({
            color: 0xffffff,
        })
        
        const text = new THREE.Mesh(textGeometry, textMaterial)

        text.position.set(-4, 4, 2);
        text.scale.set(0.5, 0.5, 0.5); 
        scene.add(text)
        console.log('font loaded successfully')
    }
);

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

let cigar;

cigarLoader.load(
    '/models/Cigar/cigare.glb',
    (gltf) => {
        cigar = gltf.scene.children[0];

        if (cigar) {
            cigar.castShadow = true;
            scene.add(cigar);
            cigar.position.set(-2, 3.2, 1);
            cigar.scale.set(0.08, 0.4, 0.08);
            cigar.rotation.x = Math.PI / 0.1;

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

window.addEventListener('click', () =>
{
    if (cigar) {
        // Use GSAP to rotate the cigar two times (720 degrees) over a duration of 2 seconds
        TweenMax.to(cigar.rotation, 0.3, { y: cigar.rotation.y + Math.PI * 2 });
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
