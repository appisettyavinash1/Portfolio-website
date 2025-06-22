document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('background-animation');
    if (!container) return;

    let scene, camera, renderer, controls, atomiumGrid;
    const spacing = 50; // Distance between Atomiums

    function init() {
        // Scene setup
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
        camera.position.z = 80;

        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        container.appendChild(renderer.domElement);

        // Controls
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableZoom = false;
        controls.enablePan = false;
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;

        // Lighting
        scene.add(new THREE.AmbientLight(0x404040));
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7);
        directionalLight.position.set(0.5, 1, 1);
        scene.add(directionalLight);

        // Atomium Lattice
        atomiumGrid = createAtomiumLattice();
        scene.add(atomiumGrid);

        window.addEventListener('resize', onWindowResize, false);
    }

    function createAtomium() {
        const atomiumGroup = new THREE.Group();
        const sphereRadius = 1.2;
        const tubeRadius = 0.2;
        const halfSide = 7;

        const material = new THREE.MeshStandardMaterial({
            color: 0xaaaaaa, // Steel-like color
            metalness: 1.0,
            roughness: 0.3,
        });

        const sphereGeometry = new THREE.SphereGeometry(sphereRadius, 32, 32);

        function createTube(p1, p2) {
            const path = new THREE.LineCurve3(p1, p2);
            const tubeGeometry = new THREE.TubeGeometry(path, 1, tubeRadius, 16, false);
            return new THREE.Mesh(tubeGeometry, material);
        }

        const cornerPositions = [
            new THREE.Vector3(halfSide, halfSide, halfSide), new THREE.Vector3(halfSide, halfSide, -halfSide),
            new THREE.Vector3(halfSide, -halfSide, halfSide), new THREE.Vector3(halfSide, -halfSide, -halfSide),
            new THREE.Vector3(-halfSide, halfSide, halfSide), new THREE.Vector3(-halfSide, halfSide, -halfSide),
            new THREE.Vector3(-halfSide, -halfSide, halfSide), new THREE.Vector3(-halfSide, -halfSide, -halfSide)
        ];
        const allPositions = [new THREE.Vector3(0, 0, 0), ...cornerPositions];

        allPositions.forEach(pos => {
            const sphere = new THREE.Mesh(sphereGeometry, material);
            sphere.position.copy(pos);
            atomiumGroup.add(sphere);
        });

        const edgeConnections = [
            [0, 1], [0, 2], [0, 4], [1, 3], [1, 5], [2, 3], [2, 6], [3, 7], [4, 5], [4, 6], [5, 7], [6, 7]
        ];

        edgeConnections.forEach(pair => {
            const tube = createTube(cornerPositions[pair[0]], cornerPositions[pair[1]]);
            atomiumGroup.add(tube);
        });

        return atomiumGroup;
    }

    function createAtomiumLattice() {
        const lattice = new THREE.Group();
        const baseAtomium = createAtomium();
        const gridSize = 4; // Creates a grid of gridSize x gridSize x gridSize

        for (let i = -gridSize / 2; i <= gridSize / 2; i++) {
            for (let j = -gridSize / 2; j <= gridSize / 2; j++) {
                for (let k = -gridSize / 2; k <= gridSize / 2; k++) {
                    const atomiumClone = baseAtomium.clone();
                    atomiumClone.position.set(i * spacing, j * spacing, k * spacing);
                    lattice.add(atomiumClone);
                }
            }
        }
        return lattice;
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        requestAnimationFrame(animate);

        // Loop the lattice
        atomiumGrid.position.z += 0.05;
        if (atomiumGrid.position.z >= spacing) {
            atomiumGrid.position.z = 0;
        }

        controls.update();
        renderer.render(scene, camera);
    }

    init();
    animate();

    // Color switcher
    const themeBtn = document.getElementById('theme-btn');
    const themes = [
        { text: '#f4f4f4', hover: '#00e0ff' }, // Default
        { text: '#ff5733', hover: '#ff8d72' }, // Coral
        { text: '#33ff57', hover: '#8aff9d' }, // Neon Green
        { text: '#f1c40f', hover: '#f3d354' }, // Sunflower Yellow
        { text: '#e74c3c', hover: '#ed877e' }, // Pomegranate Red
        { text: '#3498db', hover: '#7fc4e8' }  // Peter River Blue
    ];
    let currentThemeIndex = 0;

    if (themeBtn) {
        themeBtn.addEventListener('click', (e) => {
            e.preventDefault();
            currentThemeIndex = (currentThemeIndex + 1) % themes.length;
            const newTheme = themes[currentThemeIndex];
            document.documentElement.style.setProperty('--text-color', newTheme.text);
            document.documentElement.style.setProperty('--icon-hover-color', newTheme.hover);
        });
    }

    // Floating Action Buttons
    const scrollToTopBtn = document.getElementById('scroll-to-top-btn');
    const shareBtn = document.getElementById('share-btn');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.style.display = 'flex';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });

    scrollToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    if(shareBtn) {
        shareBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            const shareData = {
                title: 'My Portfolio',
                text: 'Check out my portfolio!',
                url: window.location.href
            };
            try {
                if (navigator.share) {
                    await navigator.share(shareData);
                } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Link copied to clipboard!');
                }
            } catch (err) {
                console.error('Error sharing:', err);
            }
        });
    }
});
