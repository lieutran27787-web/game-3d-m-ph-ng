// 1. Khởi tạo môi trường 3D
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x090d16);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 4.5);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

// 2. Hệ thống ánh sáng Studio
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
mainLight.position.set(4, 5, 4);
scene.add(mainLight);

const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
rimLight.position.set(-4, -2, -3);
scene.add(rimLight);

let currentGroup = new THREE.Group();
scene.add(currentGroup);

// Hàm xóa vật thể cũ an toàn
function clearScene() {
    while(currentGroup.children.length > 0){ 
        const obj = currentGroup.children[0]; 
        currentGroup.remove(obj); 
    }
}

// 3. Xây dựng các chủ đề mô phỏng (Nhà, Cơ thể người, Đồ ăn, Vật dụng)
function setTheme(type) {
    clearScene();
    
    if (type === 'house') {
        // Mô phỏng Ngôi nhà
        const houseGeo = new THREE.BoxGeometry(2, 1.5, 2);
        const mat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.3, metalness: 0.1 });
        const house = new THREE.Mesh(houseGeo, mat);
        house.position.y = -0.2;
        currentGroup.add(house);
        
        const roofGeo = new THREE.ConeGeometry(1.6, 1, 4);
        const roofMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.4 });
        const roof = new THREE.Mesh(roofGeo, roofMat);
        roof.position.y = 1;
        roof.rotation.y = Math.PI / 4;
        currentGroup.add(roof);

    } else if (type === 'body') {
        // Mô phỏng Cơ thể người (Trái tim sinh học)
        const heartGeo = new THREE.SphereGeometry(1.2, 64, 64);
        const mat = new THREE.MeshStandardMaterial({ color: 0xd90429, roughness: 0.2, metalness: 0.3 });
        const heart = new THREE.Mesh(heartGeo, mat);
        currentGroup.add(heart);

    } else if (type === 'food') {
        // Mô phỏng Đồ ăn (Quả táo dinh dưỡng)
        const foodGeo = new THREE.SphereGeometry(1.3, 32, 32);
        const mat = new THREE.MeshStandardMaterial({ color: 0x10b981, roughness: 0.25 });
        const food = new THREE.Mesh(foodGeo, mat);
        currentGroup.add(food);

    } else if (type === 'tools') {
        // Mô phỏng Vật dụng (Bánh răng công cụ)
        const toolGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.4, 16);
        const mat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.3, metalness: 0.8 });
        const tool = new THREE.Mesh(toolGeo, mat);
        tool.rotation.x = Math.PI / 3;
        currentGroup.add(tool);
    }
}

// Khởi chạy mặc định chủ đề Ngôi Nhà
setTheme('house');

// 4. Tính năng tải ảnh 2D tùy biến áp lên khối 3D
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
                    roughness: 0.3,
                    side: THREE.DoubleSide
                });
                const customMesh = new THREE.Mesh(geometry, customMaterial);
                currentGroup.add(customMesh);
            });
        }
        reader.readAsDataURL(file);
    }
});

// 5. Tương tác xoay mượt mà bằng chuột và cảm ứng
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

// 6. Vòng lặp render
function animate() {
    requestAnimationFrame(animate);
    if (!isDragging && currentGroup) {
        currentGroup.rotation.y += 0.002;
    }
    renderer.render(scene, camera);
}
animate();
