// 1. Khởi tạo môi trường 3D phong cách game Anime
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050515);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 4.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.3;
document.body.appendChild(renderer.domElement);

// 2. Hệ thống ánh sáng Neon rực rỡ phong cách HI3D
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const cyanLight = new THREE.DirectionalLight(0x00f0ff, 2.5);
cyanLight.position.set(5, 5, 5);
scene.add(cyanLight);

const pinkLight = new THREE.DirectionalLight(0xff007f, 1.5);
pinkLight.position.set(-5, -3, -3);
scene.add(pinkLight);

let currentGroup = new THREE.Group();
scene.add(currentGroup);

function clearScene() {
    while(currentGroup.children.length > 0){ 
        const obj = currentGroup.children[0]; 
        currentGroup.remove(obj); 
    }
}

// 3. Tạo các mô hình phong cách khoa học viễn tưởng / Anime
function setTheme(type) {
    clearScene();
    
    if (type === 'valkyrie') {
        // Core lăng kính năng lượng (Hình thoi xoay đa chiều)
        const geo = new THREE.OctahedronGeometry(1.2, 0);
        const mat = new THREE.MeshStandardMaterial({ 
            color: 0x00f0ff, 
            roughness: 0.1, 
            metalness: 0.9,
            emissive: 0x0044aa,
            emissiveIntensity: 0.5
        });
        const mesh = new THREE.Mesh(geo, mat);
        currentGroup.add(mesh);

        // Vòng năng lượng bao quanh
        const ringGeo = new THREE.TorusGeometry(1.8, 0.04, 16, 100);
        const ringMat = new THREE.MeshStandardMaterial({ color: 0xff007f, emissive: 0xff007f });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.rotation.x = Math.PI / 2;
        currentGroup.add(ring);

    } else if (type === 'mecha') {
        // Khiên cơ khí bảo vệ (Mecha Shield)
        const geo = new THREE.BoxGeometry(1.8, 1.8, 0.3);
        const mat = new THREE.MeshStandardMaterial({ 
            color: 0x3b82f6, 
            roughness: 0.2, 
            metalness: 0.8,
            emissive: 0x1d4ed8,
            emissiveIntensity: 0.3
        });
        const mesh = new THREE.Mesh(geo, mat);
        currentGroup.add(mesh);

    } else if (type === 'energy') {
        // Tinh thể năng lượng (Energy Crystal)
        const geo = new THREE.DodecahedronGeometry(1.2);
        const mat = new THREE.MeshStandardMaterial({ 
            color: 0x10b981, 
            roughness: 0.15, 
            metalness: 0.7,
            emissive: 0x047857,
            emissiveIntensity: 0.4
        });
        const mesh = new THREE.Mesh(geo, mat);
        currentGroup.add(mesh);
    }
}

// Mặc định chạy mẫu Valkyrie Core
setTheme('valkyrie');

// 4. Tính năng tùy biến: Tải ảnh 2D dán lên mô hình 3D phong cách card
const imageLoader = document.getElementById('imageLoader');
imageLoader.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(event.target.result, (texture) => {
                clearScene();
                const geometry = new THREE.PlaneGeometry(2.5, 2.5, 128, 128);
                const customMaterial = new THREE.MeshStandardMaterial({
                    map: texture,
                    displacementMap: texture,
                    displacementScale: 0.2,
                    roughness: 0.2,
                    metalness: 0.3,
                    side: THREE.DoubleSide
                });
                const customMesh = new THREE.Mesh(geometry, customMaterial);
                currentGroup.add(customMesh);
            });
        }
        reader.readAsDataURL(file);
    }
});

// 5. Điều khiển xoay mượt mà 360 độ bằng chuột / cảm ứng
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

window.addEventListener('mousedown', () => { isDragging = true; });
window.addEventListener('mouseup', () => { isDragging = false; });
window.addEventListener('mousemove', (e) => {
    if (isDragging && currentGroup) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;
        currentGroup.rotation.y += deltaX * 0.007;
        currentGroup.rotation.x += deltaY * 0.007;
    }
    previousMousePosition = { x: e.clientX, y: e.clientY };
});

let touchStartX = 0, touchStartY = 0;
window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        isDragging = true;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
});
window.addEventListener('touchend', () => { isDragging = false; });
window.addEventListener('touchmove', (e) => {
    if (isDragging && currentGroup && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;
        currentGroup.rotation.y += deltaX * 0.007;
        currentGroup.rotation.x += deltaY * 0.007;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 6. Vòng lặp render chuyển động tự động
function animate() {
    requestAnimationFrame(animate);
    if (!isDragging && currentGroup) {
        currentGroup.rotation.y += 0.003;
        currentGroup.rotation.x += 0.001;
    }
    renderer.render(scene, camera);
}
animate();
