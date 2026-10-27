// 1. Khởi tạo môi trường đồ họa 3D (Scene, Camera, Renderer)
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b0b0b);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 0, 4);

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; // Tạo màu sắc chuẩn điện ảnh, chân thực
renderer.toneMappingExposure = 1.2;
document.body.appendChild(renderer.domElement);

// 2. Thiết lập hệ thống ánh sáng chuyên nghiệp (Studio Lighting)
// Ánh sáng tổng thể dịu nhẹ
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

// Đèn chính chiếu góc nghiêng tạo bóng đổ sắc nét cho các khối lồi lõm
const mainLight = new THREE.DirectionalLight(0xffffff, 2.2);
mainLight.position.set(4, 5, 4);
scene.add(mainLight);

// Đèn phụ ánh sáng xanh làm nổi bật viền cạnh (Rim Light)
const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
rimLight.position.set(-4, -2, -3);
scene.add(rimLight);

let currentMesh = null;

// 3. Tạo khung hình học dạng lưới mịn (Plane Geometry với 128x128 điểm để tạo độ lồi lõm chi tiết)
const geometry = new THREE.PlaneGeometry(2.5, 2.5, 128, 128);

// Tạo một vật liệu mặc định ban đầu khi chưa tải ảnh
let defaultMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x1f2937, 
    roughness: 0.4,
    metalness: 0.2,
    side: THREE.DoubleSide
});
currentMesh = new THREE.Mesh(geometry, defaultMaterial);
scene.add(currentMesh);

// 4. Lập trình tính năng xử lý sự kiện khi người dùng chọn ảnh 2D
const imageLoader = document.getElementById('imageLoader');
imageLoader.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            const textureLoader = new THREE.TextureLoader();
            textureLoader.load(event.target.result, (texture) => {
                
                // Cấu hình độ nét cho texture ảnh
                texture.generateMipmaps = true;
                texture.minFilter = THREE.LinearMipmapLinearFilter;

                // Tạo vật liệu PBR (Physically Based Rendering) mô phỏng vật chất giống ngoài đời
                const realisticMaterial = new THREE.MeshStandardMaterial({
                    map: texture,                 // Bản đồ màu sắc (Ảnh 2D gốc)
                    displacementMap: texture,     // Bản đồ dịch chuyển khối: Tự động dùng độ sáng tối của ảnh để đùn khối nổi/chìm 3D
                    displacementScale: 0.22,      // Độ sâu của khối nổi (có thể tăng giảm tùy ý)
                    roughness: 0.25,              // Độ bóng bề mặt (giúp bắt sáng lung linh như thật)
                    metalness: 0.1,               // Độ ánh kim
                    side: THREE.DoubleSide
                });
                
                // Xóa vật thể cũ để giải phóng bộ nhớ
                if (currentMesh) {
                    scene.remove(currentMesh);
                    currentMesh.geometry.dispose();
                    currentMesh.material.dispose();
                }

                // Tạo vật thể 3D mới từ ảnh vừa tải và đưa vào không gian
                currentMesh = new THREE.Mesh(geometry, realisticMaterial);
                scene.add(currentMesh);
            });
        }
        reader.readAsDataURL(file);
    }
});

// 5. Lập trình tương tác xoay vật thể mượt mà bằng Chuột (Mouse) và Cảm ứng (Touch)
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };

window.addEventListener('mousedown', () => { isDragging = true; });
window.addEventListener('mouseup', () => { isDragging = false; });
window.addEventListener('mousemove', (e) => {
    if (isDragging && currentMesh) {
        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        currentMesh.rotation.y += deltaX * 0.007;
        currentMesh.rotation.x += deltaY * 0.007;
    }
    previousMousePosition = { x: e.clientX, y: e.clientY };
});

// Hỗ trợ cảm ứng vuốt trên điện thoại / máy tính bảng
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

        currentMesh.rotation.y += deltaX * 0.007;
        currentMesh.rotation.x += deltaY * 0.007;

        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
    }
});

// Tự động căn chỉnh khi thay đổi kích thước cửa sổ trình duyệt
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 6. Vòng lặp kết xuất hình ảnh liên tục (Render Loop)
function animate() {
    requestAnimationFrame(animate);
    
    // Nếu người dùng không tương tác, vật thể sẽ tự động xoay nhẹ nhàng để quan sát đa chiều
    if (!isDragging && currentMesh) {
        currentMesh.rotation.y += 0.002;
    }
    
    renderer.render(scene, camera);
}
animate();
