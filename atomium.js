// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);

// Lighting
scene.add(new THREE.AmbientLight(0xcccccc));
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Atomium Constants
const sphereRadius = 1.2;
const tubeRadius = 0.2;
const halfSide = 7;

// Material
const material = new THREE.MeshStandardMaterial({
    color: 0xc0c0c0, // A silver color
    metalness: 0.9,
    roughness: 0.2,
});

// Sphere and Tube Geometries
const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 32);

function createTube(p1, p2) {
    const path = new THREE.LineCurve3(p1, p2);
    const tubeGeometry = new THREE.TubeGeometry(path, 1, tubeRadius, 16, false);
    const tube = new THREE.Mesh(tubeGeometry, material);
    scene.add(tube);
}

// Positions for spheres
const cornerPositions = [
    new THREE.Vector3(halfSide, halfSide, halfSide),    // 0
    new THREE.Vector3(halfSide, halfSide, -halfSide),   // 1
    new THREE.Vector3(halfSide, -halfSide, halfSide),   // 2
    new THREE.Vector3(halfSide, -halfSide, -halfSide),  // 3
    new THREE.Vector3(-halfSide, halfSide, halfSide),   // 4
    new THREE.Vector3(-halfSide, halfSide, -halfSide),  // 5
    new THREE.Vector3(-halfSide, -halfSide, halfSide),  // 6
    new THREE.Vector3(-halfSide, -halfSide, -halfSide)  // 7
];
const allPositions = [new THREE.Vector3(0, 0, 0), ...cornerPositions];

// Create Spheres
allPositions.forEach(pos => {
    const sphere = new THREE.Mesh(sphereGeometry, material);
    sphere.position.copy(pos);
    scene.add(sphere);
});

// Create Tubes
// Edges of the cube
const edgeConnections = [
    [0, 1], [0, 2], [0, 4], [1, 3], [1, 5], [2, 3], 
    [2, 6], [3, 7], [4, 5], [4, 6], [5, 7], [6, 7]
];

edgeConnections.forEach(pair => {
    createTube(cornerPositions[pair[0]], cornerPositions[pair[1]]);
});

// Tubes from center to corners (commented out as it's not in the real Atomium)
// const center = allPositions[0];
// for (let i = 0; i < cornerPositions.length; i++) {
//     createTube(center, cornerPositions[i]);
// }

// Camera Position
camera.position.set(0, 10, 25);
controls.update();

// Animation Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
