document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('background-animation');
    if (!container) return;

    let scene, camera, renderer, stars, controls, atomium;

    function init() {
        // Scene setup
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 30;

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
        scene.add(new THREE.AmbientLight(0xcccccc));
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        scene.add(directionalLight);

        // Starfield
        const starVertices = [];
        for (let i = 0; i < 15000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starVertices.push(x, y, z);
        }
        const starGeometry = new THREE.BufferGeometry();
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
        const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 });
        stars = new THREE.Points(starGeometry, starMaterial);
        scene.add(stars);
        
        // Atomium
        atomium = createAtomium();
        scene.add(atomium);

        window.addEventListener('resize', onWindowResize, false);
    }

    function createAtomium() {
        const atomiumGroup = new THREE.Group();
        const sphereRadius = 1.2;
        const tubeRadius = 0.2;
        const halfSide = 7;

        const material = new THREE.MeshStandardMaterial({
            color: 0xc0c0c0,
            metalness: 0.9,
            roughness: 0.2,
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

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function animate() {
        requestAnimationFrame(animate);

        stars.position.z += 0.2;
        if (stars.position.z > 1000) {
            stars.position.z = -1000;
        }

        if (atomium) {
            atomium.rotation.y += 0.001;
            atomium.rotation.x += 0.0005;
        }
        
        controls.update();
        renderer.render(scene, camera);
    }

    init();
    animate();

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
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
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
                    console.log('Shared successfully');
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
