import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function AvatarScene({ state = 'idle', modelUrl = '/models/avatar.glb' }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(state);
  const [modelLoaded, setModelLoaded] = useState(false);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.set(0, 0.4, 5.2);

    // Resize handler
    const resize = () => {
      if (!canvas.parentElement) return;
      const { clientWidth, clientHeight } = canvas.parentElement;
      if (clientWidth === 0 || clientHeight === 0) return;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', resize);
    const resizeObserver = new ResizeObserver(resize);
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
    resize();

    // Studio Stage Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainLight.position.set(3, 5, 4);
    mainLight.castShadow = true;
    scene.add(mainLight);

    const tealFill = new THREE.PointLight(0x00d2ff, 2.8, 14);
    tealFill.position.set(-3, 2, 3);
    scene.add(tealFill);

    const pinkRim = new THREE.PointLight(0xff4081, 2.2, 14);
    pinkRim.position.set(3, 1, -2);
    scene.add(pinkRim);

    const goldAccent = new THREE.PointLight(0xc5a880, 2.0, 10);
    goldAccent.position.set(0, 3, -1);
    scene.add(goldAccent);

    // Root Group for Full Body Character
    const characterGroup = new THREE.Group();
    scene.add(characterGroup);

    // Platform / Stage Floor
    const platformGeo = new THREE.CylinderGeometry(1.6, 1.7, 0.1, 64);
    const platformMat = new THREE.MeshStandardMaterial({
      color: 0x3b6b5e,
      roughness: 0.2,
      metalness: 0.6,
      transparent: true,
      opacity: 0.85
    });
    const platform = new THREE.Mesh(platformGeo, platformMat);
    platform.position.set(0, -2.15, 0);
    platform.receiveShadow = true;
    scene.add(platform);

    const platformRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.62, 0.02, 16, 64),
      new THREE.MeshBasicMaterial({ color: 0x00e5ff })
    );
    platformRing.position.set(0, -2.09, 0);
    platformRing.rotation.x = Math.PI / 2;
    scene.add(platformRing);

    // =========================================================
    // CREATIVE STAGE ENVIRONMENT ANIMATIONS & HOLOGRAPHIC OBJECTS
    // =========================================================

    // 1. Ambient Floating Particle Atmosphere (1,200 Sparks & Dust)
    const PARTICLE_COUNT = 1200;
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    const particleColors = new Float32Array(PARTICLE_COUNT * 3);
    const cEmerald = new THREE.Color(0x2e7d68);
    const cGold = new THREE.Color(0xc5a880);
    const cTeal = new THREE.Color(0x00d2ff);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 12;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 7;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;

      const pick = Math.random();
      const color = pick < 0.4 ? cEmerald : pick < 0.8 ? cGold : cTeal;
      particleColors[i * 3] = color.r;
      particleColors[i * 3 + 1] = color.g;
      particleColors[i * 3 + 2] = color.b;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    const particleMat = new THREE.PointsMaterial({
      size: 0.035,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true
    });
    const dustParticles = new THREE.Points(particleGeo, particleMat);
    scene.add(dustParticles);

    // 2. Left Holographic Floating Orbital Core (Neural Ring + Particles)
    const leftHoloGroup = new THREE.Group();
    leftHoloGroup.position.set(-2.2, 0.4, -0.5);
    scene.add(leftHoloGroup);

    const holoRing1 = new THREE.Mesh(
      new THREE.TorusGeometry(0.55, 0.015, 16, 64),
      new THREE.MeshBasicMaterial({ color: 0x00d2ff, transparent: true, opacity: 0.8 })
    );
    holoRing1.rotation.x = Math.PI / 3;
    leftHoloGroup.add(holoRing1);

    const holoRing2 = new THREE.Mesh(
      new THREE.TorusGeometry(0.42, 0.012, 16, 64),
      new THREE.MeshBasicMaterial({ color: 0x3b6b5e, transparent: true, opacity: 0.85 })
    );
    holoRing2.rotation.y = Math.PI / 4;
    leftHoloGroup.add(holoRing2);

    const holoCoreOrb = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.18, 1),
      new THREE.MeshStandardMaterial({ color: 0x2e7d68, wireframe: true, transparent: true, opacity: 0.9 })
    );
    leftHoloGroup.add(holoCoreOrb);

    // Audio Equalizer Spectrum Bars on Left Stage
    const eqBars = [];
    const eqGroup = new THREE.Group();
    eqGroup.position.set(-2.2, -0.6, -0.5);
    scene.add(eqGroup);

    for (let i = 0; i < 7; i++) {
      const barGeo = new THREE.BoxGeometry(0.04, 0.6, 0.04);
      const barMat = new THREE.MeshStandardMaterial({ color: 0x3b6b5e, roughness: 0.2, metalness: 0.8 });
      const bar = new THREE.Mesh(barGeo, barMat);
      bar.position.set((i - 3) * 0.1, 0, 0);
      eqGroup.add(bar);
      eqBars.push(bar);
    }

    // 3. Right Holographic Quantum Crystal (Rotating Dual Pyramids)
    const rightHoloGroup = new THREE.Group();
    rightHoloGroup.position.set(2.2, 0.4, -0.5);
    scene.add(rightHoloGroup);

    const crystalOcta = new THREE.Mesh(
      new THREE.OctahedronGeometry(0.38, 0),
      new THREE.MeshStandardMaterial({
        color: 0xc5a880,
        wireframe: true,
        transparent: true,
        opacity: 0.85
      })
    );
    rightHoloGroup.add(crystalOcta);

    const outerWireSphere = new THREE.Mesh(
      new THREE.IcosahedronGeometry(0.65, 1),
      new THREE.MeshBasicMaterial({ color: 0x3b6b5e, wireframe: true, transparent: true, opacity: 0.35 })
    );
    rightHoloGroup.add(outerWireSphere);

    // Audio Wave Rings on Right Stage Floor
    const waveRings = [];
    for (let i = 0; i < 3; i++) {
      const ringMesh = new THREE.Mesh(
        new THREE.RingGeometry(0.2, 0.25, 32),
        new THREE.MeshBasicMaterial({ color: 0x00d2ff, side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
      );
      ringMesh.position.set(2.2, -0.7, -0.5);
      ringMesh.rotation.x = Math.PI / 2;
      scene.add(ringMesh);
      waveRings.push(ringMesh);
    }

    // Full Body Procedural Rig Joints & References
    let mixer = null;
    let headJoint = null;
    let spineJoint = null;
    let armLeft = null;
    let armRight = null;
    let forearmLeft = null;
    let forearmRight = null;
    let mouthMesh = null;
    let headsetLeds = [];
    let leftEye = null;
    let rightEye = null;
    let micLed = null;

    // Load custom GLTF .glb model if present in /public/models/avatar.glb
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        const loadedModel = gltf.scene;
        loadedModel.scale.set(1.4, 1.4, 1.4);
        loadedModel.position.set(0, -2.1, 0);
        characterGroup.add(loadedModel);
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(loadedModel);
          const action = mixer.clipAction(gltf.animations[0]);
          action.play();
        }
        setModelLoaded(true);
      },
      undefined,
      () => {
        // Fallback: Construct Full-Body Procedural 3D Stylized Character
        buildFullBodyProceduralCharacter();
      }
    );

    function buildFullBodyProceduralCharacter() {
      // Materials
      const skinMat = new THREE.MeshStandardMaterial({ color: 0xffdbac, roughness: 0.45, metalness: 0.05 });
      const hairMat = new THREE.MeshStandardMaterial({ color: 0x1da1f2, roughness: 0.3, metalness: 0.1 });
      const headsetMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.2, metalness: 0.8 });
      const glowingLedMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });
      const glassFrameMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.1, metalness: 0.9 });
      const lensMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.35,
        roughness: 0.1,
        transmission: 0.9,
      });
      const coatMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
      const pinkCollarMat = new THREE.MeshStandardMaterial({ color: 0xec4899, roughness: 0.5 });
      const tieMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.4 });
      const pantsMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
      const bootMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.4 });

      // Spine & Body Pivot
      spineJoint = new THREE.Group();
      spineJoint.position.set(0, -0.6, 0);
      characterGroup.add(spineJoint);

      // Torso / Lab Coat & Shirt
      const torsoGeo = new THREE.CylinderGeometry(0.55, 0.48, 1.1, 32);
      const torsoMesh = new THREE.Mesh(torsoGeo, coatMat);
      torsoMesh.position.set(0, 0.55, 0);
      torsoMesh.castShadow = true;
      spineJoint.add(torsoMesh);

      // Pink Collar & Tie
      const collarLeft = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.05), pinkCollarMat);
      collarLeft.position.set(-0.16, 1.02, 0.32);
      collarLeft.rotation.set(0, 0.3, -0.2);
      spineJoint.add(collarLeft);

      const collarRight = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.05), pinkCollarMat);
      collarRight.position.set(0.16, 1.02, 0.32);
      collarRight.rotation.set(0, -0.3, 0.2);
      spineJoint.add(collarRight);

      const tieGeo = new THREE.ConeGeometry(0.1, 0.65, 4);
      const tieMesh = new THREE.Mesh(tieGeo, tieMat);
      tieMesh.position.set(0, 0.72, 0.34);
      tieMesh.rotation.x = Math.PI;
      spineJoint.add(tieMesh);

      // Legs & Boots
      const hips = new THREE.Mesh(new THREE.CylinderGeometry(0.48, 0.42, 0.3, 32), pantsMat);
      hips.position.set(0, -0.15, 0);
      spineJoint.add(hips);

      const legLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 1.2, 16), pantsMat);
      legLeft.position.set(-0.25, -0.85, 0);
      legLeft.castShadow = true;
      spineJoint.add(legLeft);

      const legRight = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.14, 1.2, 16), pantsMat);
      legRight.position.set(0.25, -0.85, 0);
      legRight.castShadow = true;
      spineJoint.add(legRight);

      const bootLeft = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.42), bootMat);
      bootLeft.position.set(-0.25, -1.48, 0.08);
      bootLeft.castShadow = true;
      spineJoint.add(bootLeft);

      const bootRight = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.42), bootMat);
      bootRight.position.set(0.25, -1.48, 0.08);
      bootRight.castShadow = true;
      spineJoint.add(bootRight);

      // Arms (Rigged Upper Arms & Forearms for Dynamic Talking Gestures)
      armLeft = new THREE.Group();
      armLeft.position.set(-0.62, 1.0, 0);
      spineJoint.add(armLeft);

      const upperArmLeftMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.6, 16), coatMat);
      upperArmLeftMesh.position.set(0, -0.3, 0);
      armLeft.add(upperArmLeftMesh);

      forearmLeft = new THREE.Group();
      forearmLeft.position.set(0, -0.6, 0);
      armLeft.add(forearmLeft);

      const lowerArmLeftMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.55, 16), skinMat);
      lowerArmLeftMesh.position.set(0, -0.28, 0);
      const handLeftMesh = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), skinMat);
      handLeftMesh.position.set(0, -0.58, 0);
      forearmLeft.add(lowerArmLeftMesh, handLeftMesh);

      armRight = new THREE.Group();
      armRight.position.set(0.62, 1.0, 0);
      spineJoint.add(armRight);

      const upperArmRightMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.13, 0.6, 16), coatMat);
      upperArmRightMesh.position.set(0, -0.3, 0);
      armRight.add(upperArmRightMesh);

      forearmRight = new THREE.Group();
      forearmRight.position.set(0, -0.6, 0);
      armRight.add(forearmRight);

      const lowerArmRightMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.55, 16), skinMat);
      lowerArmRightMesh.position.set(0, -0.28, 0);
      const handRightMesh = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 16), skinMat);
      handRightMesh.position.set(0, -0.58, 0);
      forearmRight.add(lowerArmRightMesh, handRightMesh);

      // Neck & Head Joint
      const neckMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.3, 16), skinMat);
      neckMesh.position.set(0, 1.22, 0);
      spineJoint.add(neckMesh);

      headJoint = new THREE.Group();
      headJoint.position.set(0, 1.45, 0);
      spineJoint.add(headJoint);

      // Head Geometry
      const headGeo = new THREE.SphereGeometry(0.62, 32, 32);
      headGeo.scale(0.9, 1.05, 0.9);
      const headMesh = new THREE.Mesh(headGeo, skinMat);
      headMesh.castShadow = true;
      headJoint.add(headMesh);

      // Eyes
      const eyeGeo = new THREE.SphereGeometry(0.075, 16, 16);
      const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1 });
      const pupilMat = new THREE.MeshBasicMaterial({ color: 0x3b2314 });

      leftEye = new THREE.Group();
      const leftEyeWhite = new THREE.Mesh(eyeGeo, eyeWhiteMat);
      const leftPupil = new THREE.Mesh(new THREE.SphereGeometry(0.042, 16, 16), pupilMat);
      leftPupil.position.set(0, 0, 0.05);
      leftEye.add(leftEyeWhite, leftPupil);
      leftEye.position.set(-0.2, 0.08, 0.52);
      headJoint.add(leftEye);

      rightEye = new THREE.Group();
      const rightEyeWhite = new THREE.Mesh(eyeGeo, eyeWhiteMat);
      const rightPupil = new THREE.Mesh(new THREE.SphereGeometry(0.042, 16, 16), pupilMat);
      rightPupil.position.set(0, 0, 0.05);
      rightEye.add(rightEyeWhite, rightPupil);
      rightEye.position.set(0.2, 0.08, 0.52);
      headJoint.add(rightEye);

      // Glasses
      const frameLeft = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.018, 16, 32), glassFrameMat);
      frameLeft.position.set(-0.2, 0.08, 0.57);
      const lensLeft = new THREE.Mesh(new THREE.CircleGeometry(0.12, 32), lensMat);
      lensLeft.position.set(-0.2, 0.08, 0.57);
      headJoint.add(frameLeft, lensLeft);

      const frameRight = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.018, 16, 32), glassFrameMat);
      frameRight.position.set(0.2, 0.08, 0.57);
      const lensRight = new THREE.Mesh(new THREE.CircleGeometry(0.12, 32), lensMat);
      lensRight.position.set(0.2, 0.08, 0.57);
      headJoint.add(frameRight, lensRight);

      const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.15), glassFrameMat);
      bridge.position.set(0, 0.08, 0.58);
      bridge.rotation.z = Math.PI / 2;
      headJoint.add(bridge);

      // Mouth
      const mouthGeo = new THREE.CapsuleGeometry(0.07, 0.11, 8, 16);
      const mouthMat = new THREE.MeshBasicMaterial({ color: 0xd97706 });
      mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
      mouthMesh.position.set(0, -0.14, 0.55);
      mouthMesh.rotation.z = Math.PI / 2;
      mouthMesh.scale.set(0.85, 0.18, 0.3);
      headJoint.add(mouthMesh);

      // Cyan / Blue Hair
      const hairMain = new THREE.Mesh(new THREE.SphereGeometry(0.66, 32, 32), hairMat);
      hairMain.position.set(0, 0.08, -0.04);
      hairMain.scale.set(0.96, 1.05, 0.96);
      headJoint.add(hairMain);

      for (let i = -3; i <= 3; i++) {
        const bang = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.42, 16), hairMat);
        bang.position.set(i * 0.075, 0.48, 0.44);
        bang.rotation.x = 0.48;
        bang.rotation.z = -i * 0.08;
        headJoint.add(bang);
      }

      // Tech Headset with Glowing LEDs
      const headband = new THREE.Mesh(new THREE.TorusGeometry(0.64, 0.038, 16, 32, Math.PI), headsetMat);
      headband.position.set(0, 0.08, 0);
      headband.rotation.x = -Math.PI / 2;
      headJoint.add(headband);

      const earcupLeft = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.11, 32), headsetMat);
      earcupLeft.position.set(-0.58, 0.08, 0);
      earcupLeft.rotation.z = Math.PI / 2;
      const ledLeft = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.018, 16, 32), glowingLedMat);
      ledLeft.position.set(-0.64, 0.08, 0);
      ledLeft.rotation.y = Math.PI / 2;
      headJoint.add(earcupLeft, ledLeft);

      const earcupRight = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.11, 32), headsetMat);
      earcupRight.position.set(0.58, 0.08, 0);
      earcupRight.rotation.z = Math.PI / 2;
      const ledRight = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.018, 16, 32), glowingLedMat);
      ledRight.position.set(0.64, 0.08, 0);
      ledRight.rotation.y = Math.PI / 2;
      headJoint.add(earcupRight, ledRight);

      headsetLeds.push(ledLeft, ledRight);

      const micStem = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.38, 16), headsetMat);
      micStem.position.set(-0.44, -0.08, 0.32);
      micStem.rotation.x = 0.8;
      micStem.rotation.z = -0.4;
      micLed = new THREE.Mesh(new THREE.SphereGeometry(0.032, 16, 16), glowingLedMat);
      micLed.position.set(-0.3, -0.14, 0.48);
      headJoint.add(micStem, micLed);
    }

    // Animation Loop
    let animationFrameId;
    let clock = new THREE.Clock();
    let blinkTimer = 0;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const dt = clock.getDelta();
      const t = clock.getElapsedTime();
      const currentState = stateRef.current;

      if (mixer) {
        mixer.update(dt);
      }

      // 1. Animate Floating Particle Atmosphere
      if (dustParticles) {
        dustParticles.rotation.y = t * 0.03;
        dustParticles.rotation.x = Math.sin(t * 0.02) * 0.05;
      }

      // 2. Animate Left Holographic Orbital Core & Equalizer Spectrum Bars
      if (leftHoloGroup) {
        leftHoloGroup.position.y = 0.4 + Math.sin(t * 1.5) * 0.08;
        holoRing1.rotation.z = t * 0.8;
        holoRing2.rotation.x = -t * 0.6;
        holoCoreOrb.rotation.y = t * 1.2;
      }

      // Dynamic Equalizer Frequency Bars Animation (Responds intensely during Talking state)
      eqBars.forEach((bar, index) => {
        let heightMultiplier = 0.2 + Math.sin(t * 4 + index * 0.8) * 0.3;
        if (currentState === 'talking') {
          heightMultiplier = 0.4 + Math.abs(Math.sin(t * 12 + index * 1.2)) * 1.2;
          bar.material.color.setHex(0x00d2ff);
        } else if (currentState === 'listening') {
          heightMultiplier = 0.3 + Math.abs(Math.sin(t * 6 + index * 0.5)) * 0.6;
          bar.material.color.setHex(0x2e7d68);
        } else {
          bar.material.color.setHex(0x3b6b5e);
        }
        bar.scale.y = heightMultiplier;
      });

      // 3. Animate Right Holographic Quantum Crystal & Stage Wave Rings
      if (rightHoloGroup) {
        rightHoloGroup.position.y = 0.4 + Math.cos(t * 1.5) * 0.08;
        crystalOcta.rotation.y = -t * 0.9;
        crystalOcta.rotation.x = t * 0.4;
        outerWireSphere.rotation.y = t * 0.3;
      }

      // Wave Rings Expansion
      waveRings.forEach((ring, index) => {
        const ringTime = (t * 1.5 + index * 0.6) % 2.0;
        const scale = 0.4 + ringTime * 2.2;
        ring.scale.set(scale, scale, 1);
        ring.material.opacity = Math.max(0, 0.7 - ringTime * 0.35);
      });

      // 4. Animate Full-Body Character & Speech Gestures
      if (characterGroup && spineJoint) {
        spineJoint.position.y = -0.6 + Math.sin(t * 1.6) * 0.015;
        spineJoint.rotation.z = Math.sin(t * 0.8) * 0.015;

        if (currentState === 'idle') {
          if (headJoint) {
            headJoint.rotation.y = Math.sin(t * 0.9) * 0.05;
            headJoint.rotation.x = Math.sin(t * 0.6) * 0.02;
          }
          if (armLeft && armRight) {
            armLeft.rotation.z = 0.15 + Math.sin(t * 1.5) * 0.03;
            armLeft.rotation.x = Math.sin(t * 1.0) * 0.04;
            armRight.rotation.z = -0.15 - Math.sin(t * 1.5) * 0.03;
            armRight.rotation.x = -Math.sin(t * 1.0) * 0.04;
          }
          if (forearmLeft && forearmRight) {
            forearmLeft.rotation.x = -0.2;
            forearmRight.rotation.x = -0.2;
          }
          if (mouthMesh) mouthMesh.scale.set(0.85, 0.18, 0.3);
          headsetLeds.forEach((led) => led.material.color.setHex(0x00e5ff));
          if (micLed) micLed.material.color.setHex(0x00e5ff);

        } else if (currentState === 'listening') {
          if (headJoint) {
            headJoint.rotation.y = 0.18 + Math.sin(t * 2) * 0.02;
            headJoint.rotation.z = -0.06;
          }
          if (armLeft && armRight) {
            armLeft.rotation.z = 0.8 + Math.sin(t * 3) * 0.04;
            armLeft.rotation.x = 0.5;
            armRight.rotation.z = -0.15;
            armRight.rotation.x = 0.1;
          }
          if (forearmLeft) forearmLeft.rotation.x = -1.2;
          if (mouthMesh) mouthMesh.scale.set(0.7, 0.12, 0.3);

          const pulse = 0.5 + Math.abs(Math.sin(t * 4)) * 0.5;
          headsetLeds.forEach((led) => led.material.color.setRGB(0, pulse, 1));
          if (micLed) micLed.material.color.setRGB(0, pulse, 1);

        } else if (currentState === 'talking') {
          if (headJoint) {
            headJoint.rotation.y = Math.sin(t * 3.5) * 0.08;
            headJoint.rotation.x = Math.sin(t * 7.0) * 0.04;
          }

          if (armLeft && armRight) {
            armLeft.rotation.z = 0.35 + Math.sin(t * 4.5) * 0.15;
            armLeft.rotation.x = 0.4 + Math.cos(t * 3.2) * 0.2;

            armRight.rotation.z = -0.38 - Math.cos(t * 4.0) * 0.18;
            armRight.rotation.x = 0.3 + Math.sin(t * 3.8) * 0.22;
          }
          if (forearmLeft && forearmRight) {
            forearmLeft.rotation.x = -0.6 + Math.sin(t * 5) * 0.2;
            forearmRight.rotation.x = -0.6 + Math.cos(t * 5) * 0.2;
          }

          const openMouthHeight = 0.25 + Math.abs(Math.sin(t * 14)) * 0.65;
          const openMouthWidth = 0.8 + Math.cos(t * 10) * 0.25;
          if (mouthMesh) mouthMesh.scale.set(openMouthWidth, openMouthHeight, 0.4);

          const speechGlow = Math.abs(Math.sin(t * 9));
          headsetLeds.forEach((led) => led.material.color.setRGB(1 - speechGlow, speechGlow, 1));
          if (micLed) micLed.material.color.setRGB(1, 0.2, speechGlow);
        }

        // Blinking
        blinkTimer += dt;
        if (blinkTimer > 3.2) {
          if (leftEye && rightEye) {
            leftEye.scale.y = 0.1;
            rightEye.scale.y = 0.1;
            setTimeout(() => {
              if (leftEye && rightEye) {
                leftEye.scale.y = 1;
                rightEye.scale.y = 1;
              }
            }, 120);
          }
          blinkTimer = 0;
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [modelUrl]);

  return (
    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          width: '100%', 
          height: '100%', 
          display: 'block' 
        }} 
      />
    </div>
  );
}
