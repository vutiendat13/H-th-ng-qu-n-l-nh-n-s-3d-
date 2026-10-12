(function() {
  const canvas = document.getElementById('login-canvas');
  if (!canvas || !window.THREE) return;
  
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x1e3a5f);
  
  const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.z = 150;
  
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
  } catch(e) {
    canvas.style.background = 'linear-gradient(135deg, #1e3a5f, #152c4a)';
    return;
  }
  
  // Create nodes
  const particleCount = 120;
  const particles = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = [];
  
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 300;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 300;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 300;
    
    velocities.push({
      x: (Math.random() - 0.5) * 0.5,
      y: (Math.random() - 0.5) * 0.5,
      z: (Math.random() - 0.5) * 0.5
    });
  }
  
  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  
  const particleMaterial = new THREE.PointsMaterial({
    color: 0x0ea5e9,
    size: 3,
    transparent: true,
    opacity: 0.8
  });
  
  const particleSystem = new THREE.Points(particles, particleMaterial);
  scene.add(particleSystem);
  
  // Create lines
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.15
  });
  
  const lineGeometry = new THREE.BufferGeometry();
  const linesMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(linesMesh);
  
  // Resize handler
  window.addEventListener('resize', () => {
    if (!canvas) return;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  });
  
  // Animation
  let animationId;
  function animate() {
    animationId = requestAnimationFrame(animate);
    
    const pos = particleSystem.geometry.attributes.position.array;
    
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] += velocities[i].x;
      pos[i * 3 + 1] += velocities[i].y;
      pos[i * 3 + 2] += velocities[i].z;
      
      // Bounds
      if (Math.abs(pos[i * 3]) > 150) velocities[i].x *= -1;
      if (Math.abs(pos[i * 3 + 1]) > 150) velocities[i].y *= -1;
      if (Math.abs(pos[i * 3 + 2]) > 150) velocities[i].z *= -1;
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;
    
    // Update connections
    const linePositions = [];
    const maxDistance = 40;
    
    for (let i = 0; i < particleCount; i++) {
      for (let j = i + 1; j < particleCount; j++) {
        const dx = pos[i * 3] - pos[j * 3];
        const dy = pos[i * 3 + 1] - pos[j * 3 + 1];
        const dz = pos[i * 3 + 2] - pos[j * 3 + 2];
        const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
        
        if (dist < maxDistance) {
          linePositions.push(
            pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2],
            pos[j * 3], pos[j * 3 + 1], pos[j * 3 + 2]
          );
        }
      }
    }
    
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    
    scene.rotation.y += 0.001;
    scene.rotation.x += 0.0005;
    
    renderer.render(scene, camera);
  }
  
  animate();
  
  // Stop animation if hidden
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      animate();
    }
  });
})();
