'use client';
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeDCompanyBrain() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Guarantee only one canvas exists by clearing any stale nodes
    while (mountRef.current.firstChild) {
      mountRef.current.removeChild(mountRef.current.firstChild);
    }

    const container = mountRef.current;
    const width = container.clientWidth || 550;
    const height = 480; // Fixed height for consistent, uniform scale

    // 1. Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 15.2; // Fixed optimal camera distance (no zoom/enlarge)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0); // Transparent background
    container.appendChild(renderer.domElement);

    // 2. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xEA580C, 2.8, 50);
    pointLight.position.set(12, 12, 15);
    scene.add(pointLight);

    const secondaryLight = new THREE.PointLight(0x6366F1, 2.8, 50);
    secondaryLight.position.set(-12, -12, 15);
    scene.add(secondaryLight);

    const accentLight = new THREE.PointLight(0x10B981, 1.8, 40);
    accentLight.position.set(0, 15, -10);
    scene.add(accentLight);

    // 3. Central Brain Geodesic Knowledge Core
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    // Outer wireframe geodesic icosahedron
    const geoOuter = new THREE.IcosahedronGeometry(5.8, 2);
    const matOuter = new THREE.MeshStandardMaterial({
      color: 0x27272A,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
      roughness: 0.2
    });
    const outerMesh = new THREE.Mesh(geoOuter, matOuter);
    coreGroup.add(outerMesh);

    // Inner glowing core sphere
    const geoInner = new THREE.SphereGeometry(3.2, 32, 32);
    const matInner = new THREE.MeshStandardMaterial({
      color: 0xEA580C,
      emissive: 0xEA580C,
      emissiveIntensity: 0.35,
      roughness: 0.3,
      metalness: 0.8,
      transparent: true,
      opacity: 0.85
    });
    const innerMesh = new THREE.Mesh(geoInner, matInner);
    coreGroup.add(innerMesh);

    // 4. Variable Size Neural Nodes & Enterprise Knowledge Hubs
    // - 5 Major Knowledge Hubs (large: 0.52 radius)
    // - 15 Cluster Nodes (medium: 0.30 radius)
    // - 32 Synaptic Leaf Nodes (small: 0.14 radius)
    const nodes = [];
    const nodePositions = [];
    const geometriesToDispose = [geoOuter, geoInner];
    const materialsToDispose = [matOuter, matInner];

    const hubColors = [0xEA580C, 0x6366F1, 0x10B981, 0xF59E0B, 0x06B6D4];
    const totalNodes = 52;
    const baseRadius = 6.2;

    for (let i = 0; i < totalNodes; i++) {
      const phi = Math.acos(-1 + (2 * i) / totalNodes);
      const theta = Math.sqrt(totalNodes * Math.PI) * phi;

      const x = baseRadius * Math.cos(theta) * Math.sin(phi) + (Math.random() - 0.5) * 1.2;
      const y = baseRadius * Math.sin(theta) * Math.sin(phi) + (Math.random() - 0.5) * 1.2;
      const z = baseRadius * Math.cos(phi) + (Math.random() - 0.5) * 1.2;

      // Variable node sizing:
      let nodeRadius = 0.14;
      let nodeColor = 0x6366F1;
      let emissiveIntensity = 0.6;
      let isHub = false;

      if (i < 5) {
        nodeRadius = 0.52;
        nodeColor = hubColors[i % hubColors.length];
        emissiveIntensity = 1.0;
        isHub = true;
      } else if (i < 20) {
        nodeRadius = 0.30;
        nodeColor = i % 2 === 0 ? 0xEA580C : 0x818CF8;
        emissiveIntensity = 0.75;
      } else {
        nodeRadius = 0.12 + Math.random() * 0.08;
        nodeColor = 0x94A3B8;
        emissiveIntensity = 0.45;
      }

      const geom = new THREE.SphereGeometry(nodeRadius, 16, 16);
      geometriesToDispose.push(geom);

      const mat = new THREE.MeshStandardMaterial({
        color: nodeColor,
        emissive: nodeColor,
        emissiveIntensity: emissiveIntensity,
        roughness: 0.25,
        metalness: 0.65
      });
      materialsToDispose.push(mat);

      const nodeMesh = new THREE.Mesh(geom, mat);
      nodeMesh.position.set(x, y, z);
      coreGroup.add(nodeMesh);

      nodes.push({
        mesh: nodeMesh,
        baseScale: 1,
        isHub: isHub,
        pulseSpeed: 1.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2
      });
      nodePositions.push(new THREE.Vector3(x, y, z));
    }

    // 5. Synaptic Connection Lines
    const lineMat = new THREE.LineBasicMaterial({
      color: 0xEA580C,
      transparent: true,
      opacity: 0.28
    });
    materialsToDispose.push(lineMat);

    const lineGeo = new THREE.BufferGeometry();
    geometriesToDispose.push(lineGeo);

    const linePositions = [];
    for (let i = 0; i < nodePositions.length; i++) {
      for (let j = i + 1; j < nodePositions.length; j++) {
        if (nodePositions[i].distanceTo(nodePositions[j]) < 4.4) {
          linePositions.push(
            nodePositions[i].x, nodePositions[i].y, nodePositions[i].z,
            nodePositions[j].x, nodePositions[j].y, nodePositions[j].z
          );
        }
      }
    }

    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    coreGroup.add(lines);

    // 6. Floating Synaptic Data Spheres (Silky smooth round glowing micro-spheres — NO SQUARES)
    const particleCount = 28;
    const particleGroup = new THREE.Group();
    scene.add(particleGroup);

    const particleSpheres = [];
    const pGeom = new THREE.SphereGeometry(0.12, 10, 10);
    geometriesToDispose.push(pGeom);

    const pMatOrange = new THREE.MeshBasicMaterial({ color: 0xEA580C });
    const pMatIndigo = new THREE.MeshBasicMaterial({ color: 0x6366F1 });
    materialsToDispose.push(pMatOrange, pMatIndigo);

    for (let i = 0; i < particleCount; i++) {
      const pMesh = new THREE.Mesh(pGeom, i % 2 === 0 ? pMatOrange : pMatIndigo);
      const pRadius = 7.5 + Math.random() * 3.2;
      const pAngle = Math.random() * Math.PI * 2;
      const pSpeed = (0.2 + Math.random() * 0.4) * (Math.random() > 0.5 ? 1 : -1);
      const pHeight = (Math.random() - 0.5) * 5.0;

      pMesh.position.set(
        Math.cos(pAngle) * pRadius,
        pHeight,
        Math.sin(pAngle) * pRadius
      );
      const pScale = 0.6 + Math.random() * 0.8;
      pMesh.scale.set(pScale, pScale, pScale);

      particleGroup.add(pMesh);
      particleSpheres.push({
        mesh: pMesh,
        radius: pRadius,
        angle: pAngle,
        speed: pSpeed,
        height: pHeight
      });
    }

    // 7. Fixed-size Interactive Draggable Controls (Drag to rotate freely, NO zoom/enlarge)
    let isDragging = false;
    let previousPointerPosition = { x: 0, y: 0 };
    let velocityX = 0;
    let velocityY = 0;
    let autoRotate = true;
    let autoRotateTimer = null;

    const onPointerDown = (e) => {
      isDragging = true;
      autoRotate = false;
      if (autoRotateTimer) clearTimeout(autoRotateTimer);
      previousPointerPosition = { x: e.clientX, y: e.clientY };
      if (mountRef.current) {
        mountRef.current.style.cursor = 'grabbing';
      }
    };

    const onPointerMove = (e) => {
      if (!isDragging) return;
      const deltaX = e.clientX - previousPointerPosition.x;
      const deltaY = e.clientY - previousPointerPosition.y;

      const sensitivity = 0.007;
      coreGroup.rotation.y += deltaX * sensitivity;
      coreGroup.rotation.x += deltaY * sensitivity;

      velocityY = deltaX * sensitivity;
      velocityX = deltaY * sensitivity;

      previousPointerPosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      if (!isDragging) return;
      isDragging = false;
      if (mountRef.current) {
        mountRef.current.style.cursor = 'grab';
      }
      autoRotateTimer = setTimeout(() => {
        autoRotate = true;
      }, 1400);
    };

    const canvasEl = renderer.domElement;
    canvasEl.style.touchAction = 'none';
    canvasEl.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 8. Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Inertia decay & gentle auto-rotation
      if (!isDragging) {
        coreGroup.rotation.y += velocityY;
        coreGroup.rotation.x += velocityX;
        velocityY *= 0.93;
        velocityX *= 0.93;

        if (autoRotate) {
          coreGroup.rotation.y += 0.0035;
        }
      }

      // Constrain vertical tilt to avoid flipping upside down
      coreGroup.rotation.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, coreGroup.rotation.x));

      // Breathing pulse on central core
      const pulse = 1 + Math.sin(elapsedTime * 2.2) * 0.06;
      innerMesh.scale.set(pulse, pulse, pulse);

      // Variable node breathing animation
      nodes.forEach((n) => {
        const factor = 1 + Math.sin(elapsedTime * n.pulseSpeed + n.phase) * (n.isHub ? 0.18 : 0.08);
        n.mesh.scale.set(factor, factor, factor);
      });

      // Orbit organic round spheres
      particleSpheres.forEach((p, idx) => {
        p.angle += p.speed * 0.01;
        const currentRadius = p.radius + Math.sin(elapsedTime + idx) * 0.3;
        p.mesh.position.x = Math.cos(p.angle) * currentRadius;
        p.mesh.position.z = Math.sin(p.angle) * currentRadius;
        p.mesh.position.y = p.height + Math.sin(elapsedTime * 1.2 + idx) * 0.4;
      });
      particleGroup.rotation.y += 0.001;

      renderer.render(scene, camera);
    };

    animate();

    // 9. Responsive Resize handler (maintains fixed height, adjusts width aspect ratio)
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      if (autoRotateTimer) clearTimeout(autoRotateTimer);
      canvasEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (mountRef.current) {
        while (mountRef.current.firstChild) {
          mountRef.current.removeChild(mountRef.current.firstChild);
        }
      }
      renderer.dispose();
      geometriesToDispose.forEach(g => g.dispose());
      materialsToDispose.forEach(m => m.dispose());
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        userSelect: 'none'
      }}
    >
      {/* Three.js 3D WebGL Canvas */}
      <div
        ref={mountRef}
        style={{
          width: '100%',
          height: '480px',
          maxHeight: '480px',
          overflow: 'hidden',
          cursor: 'grab',
          position: 'relative',
          zIndex: 1
        }}
      />

      {/* Floating HUD Badge 1: Top-Left Slack Hinglish */}
      <div style={{
        position: 'absolute',
        top: '24px',
        left: '12px',
        zIndex: 2,
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(99, 91, 255, 0.25)',
        borderRadius: '12px',
        padding: '8px 14px',
        boxShadow: '0 8px 24px rgba(99, 91, 255, 0.12)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        pointerEvents: 'none',
        animation: 'floatSlow 4s ease-in-out infinite'
      }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4A154B' }} />
        <div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 750, color: '#4A154B', textTransform: 'uppercase' }}>Slack (Hinglish)</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1E293B' }}>"PR merge ho gaya kya?"</div>
        </div>
      </div>

      {/* Floating HUD Badge 2: Top-Right Jira ↔ GitHub */}
      <div style={{
        position: 'absolute',
        top: '28px',
        right: '12px',
        zIndex: 2,
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: '12px',
        padding: '8px 14px',
        boxShadow: '0 8px 24px rgba(16, 185, 129, 0.12)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        pointerEvents: 'none',
        animation: 'floatSlow 4.5s ease-in-out infinite 0.5s'
      }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
        <div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 750, color: '#047857', textTransform: 'uppercase' }}>Cross-Tool Entity</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1E293B' }}>Jira PAY-891 ↔ PR #142</div>
        </div>
      </div>

      {/* Floating HUD Badge 3: Bottom-Left Sarvam Indic AI */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        left: '12px',
        zIndex: 2,
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(234, 88, 12, 0.25)',
        borderRadius: '12px',
        padding: '8px 14px',
        boxShadow: '0 8px 24px rgba(234, 88, 12, 0.12)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        pointerEvents: 'none',
        animation: 'floatSlow 5s ease-in-out infinite 1s'
      }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EA580C' }} />
        <div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 750, color: '#EA580C', textTransform: 'uppercase' }}>Sarvam AI Engine</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1E293B' }}>Saaras Voice & Indic OCR</div>
        </div>
      </div>

      {/* Floating HUD Badge 4: Bottom-Right Neo4j Knowledge Graph */}
      <div style={{
        position: 'absolute',
        bottom: '24px',
        right: '12px',
        zIndex: 2,
        background: 'rgba(255, 255, 255, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(6, 182, 212, 0.25)',
        borderRadius: '12px',
        padding: '8px 14px',
        boxShadow: '0 8px 24px rgba(6, 182, 212, 0.12)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        pointerEvents: 'none',
        animation: 'floatSlow 4.2s ease-in-out infinite 1.5s'
      }}>
        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#06B6D4' }} />
        <div>
          <div style={{ fontSize: '0.6875rem', fontWeight: 750, color: '#0891B2', textTransform: 'uppercase' }}>Deterministic Graph</div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1E293B' }}>8-Stage Audit Trace</div>
        </div>
      </div>

      {/* Bottom Center Prompt: Drag to Rotate */}
      <div style={{
        position: 'absolute',
        bottom: '8px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 2,
        fontSize: '0.6875rem',
        fontWeight: 650,
        color: '#94A3B8',
        background: 'rgba(255, 255, 255, 0.7)',
        padding: '2px 10px',
        borderRadius: 'var(--radius-pill)',
        pointerEvents: 'none',
        letterSpacing: '0.04em',
        textTransform: 'uppercase'
      }}>
        ✨ Drag 3D Brain to Rotate freely
      </div>
    </div>
  );
}
