// 1. Khởi tạo Scene, Camera và Renderer với màu sắc chuẩn điện ảnh
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0b0b); // Nền tối làm nổi bật vật thể

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Tạo màu sắc chân thực như đời thực
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

// 2. Hệ thống ánh sáng thực tế (Studio Lighting)
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

// Đèn chính (Key Light) tạo bóng đổ sắc nét
const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Đèn phụ màu xanh nhẹ (Rim Light) làm nổi bật viền vật thể
const rimLight = new THREE.DirectionalLight(0x3366ff, 1.5);
rimLight.position.set(-5, -3, -3);
scene.add(rimLight);

let currentMesh = null;

// 3. Tạo khung hình học siêu chi tiết (Plane với 128x128 lưới để tạo độ lồi lõm 3D)
const geometry = new THREE.PlaneGeometry(2.5, 2.5, 128, 128);

// 4. Xử lý sự kiện tải ảnh 2D và biến đổi thành 3D siêu thực
const imageLoader = document.getElementById('imageLoader');
imageLoader.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(event.target.result, (texture) => {
                
                // Cấu hình texture sắc nét
                texture.generateMipmaps = true;
                texture.minFilter = THREE.LinearMipmapLinearFilter;

                // Tạo vật liệu PBR cao cấp với hiệu ứng ánh sáng ngoài đời thực
                const material = new THREE.MeshStandardMaterial({
                    map: texture,                    // Ảnh màu gốc
                    displacementMap: texture,        // Dùng chính ảnh này để tạo khối nổi 3D theo độ sáng tối
                    displacementScale: 0.25,         // Độ sâu của khối nổi (càng cao càng gồ ghề)
                    roughness: 0.3,                  // Độ bóng (0: bóng loáng như kính, 1: nhám)
                    metalness: 0.1,                  // Độ kim loại
                    side: THREE.DoubleSide
                });
                
                // Xóa vật thể cũ nếu có
                if (currentMesh) {
                    scene.remove(currentMesh);
                }

                // Tạo mesh mới và đưa vào scene
                currentMesh = new THREE.Mesh(geometry, material);
                scene.add(currentMesh);
            });
        }
        reader.readAsDataURL(file);
    }
});

// 5. Tương tác xoay mượt mà bằng chuột
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

window.addEventListener('mousedown', () => { isDragging = true; });
window.addEventListener('mouseup', () => { isDragging = false; });
window.addEventListener('mousemove', (e) => {
    if (isDragging && currentMesh) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        currentMesh.rotation.y += deltaX * 0.008;
        currentMesh.rotation.x += deltaY * 0.008;
    }
    previousMousePosition = { x: e.clientX, y: e.clientY };
});

// Hỗ trợ cảm ứng cho điện thoại/máy tính bảng
let touchStartX = 0;
let touchStartY = 0;
window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
        isDragging = true;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
});
window.addEventListener('touchend', () => { isDragging = false; });
window.addEventListener('touchmove', (e) => {
    if (isDragging && currentMesh && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;

        currentMesh.rotation.y += deltaX * 0.008;
        currentMesh.rotation.x += deltaY * 0.008;

        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
});

// Tự động điều chỉnh khi đổi kích thước màn hình
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 6. Vòng lặp render thời gian thực
function animate() {
    requestAnimationFrame(animate);
    
    // Tự động xoay nhẹ nhàng khi người chơi không tương tác
    if (!isDragging && currentMesh) {
        currentMesh.rotation.y += 0.003;
    }
    
    renderer.render(scene, camera);
}
animate();
