(function() {
  const container = document.getElementById('dashboard-viz');
  if (!container || !window.THREE) return;
  
  const scene = new THREE.Scene();
  
  const camera = new THREE.PerspectiveCamera(50, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(20, 15, 30);
  camera.lookAt(0, 0, 0);
  
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);
  
  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
  dirLight.position.set(10, 20, 10);
  scene.add(dirLight);
  
  // Create abstract bars representing data
  const bars = new THREE.Group();
  scene.add(bars);
  
  const material = new THREE.MeshPhongMaterial({ 
    color: 0x0ea5e9,
    shininess: 80,
    transparent: true,
    opacity: 0.9
  });
  
  const numBars = 15;
  for (let i = 0; i < numBars; i++) {
    const height = Math.random() * 10 + 2;
    const geometry = new THREE.BoxGeometry(1.5, height, 1.5);
    const mesh = new THREE.Mesh(geometry, material);
    
    // Position in a circular layout
    const angle = (i / numBars) * Math.PI * 2;
    const radius = 8;
    mesh.position.set(Math.cos(angle) * radius, height / 2 - 5, Math.sin(angle) * radius);
    mesh.lookAt(0, height / 2 - 5, 0);
    
    // Store target height for animation
    mesh.userData = { 
      targetHeight: height, 
      currentHeight: 0.1,
      phase: Math.random() * Math.PI * 2
    };
    mesh.scale.y = 0.01;
    
    bars.add(mesh);
  }
  
  // Base grid
  const gridHelper = new THREE.GridHelper(30, 10, 0x2d5a8e, 0x2d5a8e);
  gridHelper.position.y = -5;
  scene.add(gridHelper);
  
  // Animation
  let animationId;
  function animate() {
    animationId = requestAnimationFrame(animate);
    
    bars.rotation.y += 0.003;
    
    // Gentle floating
    bars.position.y = Math.sin(Date.now() * 0.001) * 0.5;
    
    bars.children.forEach(mesh => {
      // Intro grow animation
      if (mesh.scale.y < 1) {
        mesh.scale.y += (1 - mesh.scale.y) * 0.05;
      }
      
      // Gentle pulsing
      const pulse = Math.sin(Date.now() * 0.002 + mesh.userData.phase) * 0.1 + 0.9;
      mesh.scale.x = pulse;
      mesh.scale.z = pulse;
    });
    
    renderer.render(scene, camera);
  }
  
  animate();
  
  window.addEventListener('resize', () => {
    if (!container || !container.clientWidth) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
})();
