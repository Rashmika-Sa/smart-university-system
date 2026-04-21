import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from '../../api/axios';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import StudentTopNav from '../../components/StudentTopNav';

// -----------------------------------------------------------------------------
//  Leaflet / OpenStreetMap loader
// -----------------------------------------------------------------------------
let leafletLoadPromise = null;
const loadLeaflet = () => {
  if (window.L) return Promise.resolve();
  if (leafletLoadPromise) return leafletLoadPromise;
  leafletLoadPromise = new Promise((resolve, reject) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = resolve;
    script.onerror = () => { leafletLoadPromise = null; reject(new Error('Leaflet failed')); };
    document.head.appendChild(script);
  });
  return leafletLoadPromise;
};

// -----------------------------------------------------------------------------
//  ADVANCED 3D SEAT MAP - realistic bus interior
// -----------------------------------------------------------------------------
const Advanced3DSeatMap = ({ capacity, takenSeats, selectedSeat, onSelect, isVisible }) => {
  const containerRef   = useRef(null);
  const sceneRef       = useRef(null);
  const cameraRef      = useRef(null);
  const rendererRef    = useRef(null);
  const controlsRef    = useRef(null);
  const seatDataRef    = useRef(new Map());
  const raycasterRef   = useRef(null);
  const animationRef   = useRef(null);
  // Use THREE.Clock but suppress deprecation warnings, or track time manually
  const startTimeRef   = useRef(Date.now());
  const initializedRef = useRef(false);

  const COL_X       = [-2.1, -1.15, 1.15, 2.1];
  const ROW_Z_START =  3.2;
  const ROW_Z_STEP  = -1.35;
  const rows        = Math.ceil(capacity / 4);

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;
    const t = setTimeout(() => {
      if (!initializedRef.current && containerRef.current) {
        initThree(); buildBusInterior(); buildAllSeats(); addLights(); startLoop();
        initializedRef.current = true;
      }
    }, 100);
    return () => clearTimeout(t);
  }, [isVisible]);

  useEffect(() => () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
    controlsRef.current?.dispose();
    if (rendererRef.current) {
      rendererRef.current.dispose();
      try { containerRef.current?.removeChild(rendererRef.current.domElement); } catch (_) {}
    }
    initializedRef.current = false;
  }, []);

  useEffect(() => { if (initializedRef.current) refreshSeatAppearance(); }, [takenSeats, selectedSeat]);

  // -- THREE init --------------------------------------------------------------
  const initThree = () => {
    const el = containerRef.current;
    const W = el.clientWidth, H = el.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f6ff);
    scene.fog = new THREE.Fog(0xf0f6ff, 22, 42);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 200);
    camera.position.set(9, 9, 3);
    camera.lookAt(0, 0.8, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.shadowMap.enabled   = true;
    renderer.shadowMap.type      = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    el.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ctrl = new OrbitControls(camera, renderer.domElement);
    ctrl.enableDamping  = true;  ctrl.dampingFactor  = 0.07;
    ctrl.rotateSpeed    = 0.85;  ctrl.zoomSpeed      = 1.1;
    ctrl.maxPolarAngle  = Math.PI / 2.1;
    ctrl.minDistance    = 4;     ctrl.maxDistance    = 22;
    ctrl.target.set(0, 1.2, 0);
    controlsRef.current = ctrl;

    raycasterRef.current = new THREE.Raycaster();
    window.addEventListener('resize', onResize);
  };

  // -- Helper: create mesh, set position/rotation, add to scene ---------------
  const addMesh = (scene, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.rotation.x = rx;
    m.rotation.y = ry;
    m.castShadow = true;
    m.receiveShadow = true;
    scene.add(m);
    return m;
  };



  // -- Minimal open floor + aisle - no walls, no roof ------------------------
  const buildBusInterior = () => {
    const s = sceneRef.current;
    const busLen = rows * 1.35 + 2.0;
    const zMid   = ROW_Z_START + (rows - 1) * ROW_Z_STEP / 2;

    // Floor - clean light tile
    addMesh(s,
      new THREE.BoxGeometry(7.2, 0.05, busLen),
      new THREE.MeshStandardMaterial({ color: 0xe8edf5, roughness: 0.8, metalness: 0.0 }),
      0, -0.025, zMid
    );

    // Aisle runner - slightly darker strip between seat columns
    addMesh(s,
      new THREE.BoxGeometry(1.55, 0.06, busLen),
      new THREE.MeshStandardMaterial({ color: 0xc8d0de, roughness: 0.85 }),
      0, 0.01, zMid
    );

    // Subtle row divider lines on the floor (thin flat boxes)
    for (let row = 0; row < rows; row++) {
      const fz = ROW_Z_START + row * ROW_Z_STEP - (ROW_Z_STEP / 2);
      addMesh(s,
        new THREE.BoxGeometry(7.2, 0.02, 0.04),
        new THREE.MeshStandardMaterial({ color: 0xbcc5d6, roughness: 1.0 }),
        0, 0.03, fz
      );
    }

    // -- DRIVER AREA - placed at front of bus (high +Z) -----------------------
    const frontZ = ROW_Z_START + 2.5;   // in front of first passenger row
    const darkMat  = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.5, metalness: 0.4 });
    const greyMat  = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6, metalness: 0.3 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd1d5db, roughness: 0.15, metalness: 0.9 });

    // Dashboard panel
    const dash = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.55, 0.75), darkMat);
    dash.position.set(-0.4, 0.62, frontZ + 0.5);
    dash.castShadow = true;
    s.add(dash);

    // Dashboard face (slight angle forward)
    const dashFace = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.5, 0.08),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.5 }));
    dashFace.position.set(-0.4, 0.78, frontZ + 0.12);
    dashFace.rotation.x = 0.3;
    s.add(dashFace);

    // Instrument cluster (small glowing panel)
    const clusterMat = new THREE.MeshStandardMaterial({
      color: 0x1d4ed8, emissive: 0x1d4ed8, emissiveIntensity: 0.4, roughness: 0.5,
    });
    const cluster = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.25, 0.04), clusterMat);
    cluster.position.set(-0.4, 0.82, frontZ + 0.13);
    cluster.rotation.x = 0.3;
    s.add(cluster);

    // Speed dial dots on cluster
    const dotMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 0.8 });
    [-0.22, 0, 0.22].forEach(dx => {
      const dot = new THREE.Mesh(new THREE.CircleGeometry(0.04, 12), dotMat);
      dot.position.set(-0.4 + dx, 0.83, frontZ + 0.14);
      dot.rotation.x = 0.3;
      s.add(dot);
    });

    // Steering column (vertical post)
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 0.55, 12), greyMat);
    col.position.set(-1.7, 0.56, frontZ + 0.15);
    col.rotation.x = -0.38;
    col.castShadow = true;
    s.add(col);

    // -- STEERING WHEEL -------------------------------------------------------
    const swX = -1.7, swY = 0.88, swZ = frontZ + 0.0;
    const swTiltX = -0.38;   // angled toward driver

    // Outer rim
    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(0.32, 0.038, 20, 64),
      new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.3, metalness: 0.5 })
    );
    rim.position.set(swX, swY, swZ);
    rim.rotation.x = swTiltX;
    rim.castShadow = true;
    s.add(rim);

    // Rubber grip texture on rim (3 dark segments)
    for (let i = 0; i < 3; i++) {
      const grip = new THREE.Mesh(
        new THREE.TorusGeometry(0.32, 0.042, 8, 12, Math.PI * 0.5),
        new THREE.MeshStandardMaterial({ color: 0x374151, roughness: 0.9 })
      );
      grip.position.set(swX, swY, swZ);
      grip.rotation.x = swTiltX;
      grip.rotation.z = (i * Math.PI * 2) / 3;
      s.add(grip);
    }

    // Centre hub
    const hub = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.085, 0.055, 16),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4, metalness: 0.6 })
    );
    hub.position.set(swX, swY, swZ);
    hub.rotation.x = swTiltX + Math.PI / 2;
    s.add(hub);

    // Horn button (small coloured circle in hub)
    const horn = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.02, 12),
      new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xef4444, emissiveIntensity: 0.3, roughness: 0.5 })
    );
    horn.position.set(swX, swY, swZ);
    horn.rotation.x = swTiltX + Math.PI / 2;
    s.add(horn);

    // 3 spokes connecting hub to rim
    for (let i = 0; i < 3; i++) {
      const angle = (i * Math.PI * 2) / 3 + Math.PI / 6;
      const spoke = new THREE.Mesh(
        new THREE.BoxGeometry(0.032, 0.28, 0.022),
        chromeMat
      );
      spoke.position.set(swX, swY, swZ);
      // offset spoke to reach from hub to rim
      spoke.position.x += Math.sin(angle) * 0.155;
      spoke.position.y += Math.cos(angle) * 0.155;
      spoke.rotation.x = swTiltX;
      spoke.rotation.z = -angle;
      s.add(spoke);
    }

    // Driver seat (simple bucket seat shape)
    const driverSeatBase = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.1, 0.55),
      new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.6 })
    );
    driverSeatBase.position.set(-1.7, 0.38, frontZ - 0.25);
    s.add(driverSeatBase);

    const driverSeatBack = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.72, 0.09),
      new THREE.MeshStandardMaterial({ color: 0x1e3a5f, roughness: 0.6 })
    );
    driverSeatBack.position.set(-1.7, 0.76, frontZ - 0.5);
    driverSeatBack.rotation.x = -0.12;
    s.add(driverSeatBack);

    // Seat legs
    [[-0.25, 0.1], [0.25, 0.1], [-0.25, -0.2], [0.25, -0.2]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.38, 8),
        new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.4, metalness: 0.7 })
      );
      leg.position.set(-1.7 + lx, 0.19, frontZ - 0.25 + lz);
      s.add(leg);
    });
  };

  // -- Seat builder -----------------------------------------------------------
  const makeSeat = (isTaken, isSel) => {
    const g = new THREE.Group();
    const cC = isTaken ? 0x7f1d1d : isSel ? 0x164e63 : 0x1e3a8a;
    const bC = isTaken ? 0x991b1b : isSel ? 0x0e7490 : 0x1d4ed8;
    const tC = isTaken ? 0xb91c1c : isSel ? 0x22d3ee : 0x3b82f6;
    const mat = (col, rough = 0.45, metal = 0.04, emCol = 0, emInt = 0) =>
      new THREE.MeshStandardMaterial({ color: col, roughness: rough, metalness: metal, emissive: emCol, emissiveIntensity: emInt });

    // Legs
    const legH = 0.42;
    const legMat = mat(0x6b7280, 0.35, 0.7);
    [[-0.3, 0.25], [0.3, 0.25], [-0.3, -0.25], [0.3, -0.25]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, legH, 8), legMat);
      leg.position.set(lx, legH / 2, lz);
      leg.castShadow = true;
      g.add(leg);
    });

    // Cross braces
    const brace = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.66, 8), mat(0x9ca3af, 0.3, 0.7));
    brace.rotation.z = Math.PI / 2;
    brace.position.set(0, 0.12, 0.25);
    g.add(brace);
    const braceB = brace.clone();
    braceB.position.set(0, 0.12, -0.25);
    g.add(braceB);

    // Cushion
    const cushY = legH + 0.07;
    const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.13, 0.58), mat(cC, 0.5));
    cushion.position.set(0, cushY, 0.02);
    cushion.castShadow = true;
    cushion.receiveShadow = true;
    g.add(cushion);

    // Front piping
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.78, 10), mat(tC, 0.3));
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(0, cushY + 0.07, 0.3);
    g.add(pipe);

    // Side bolsters - fixed: use position.set() not Object.assign
    [-0.4, 0.4].forEach(bx => {
      const bolster = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.16, 0.56), mat(tC, 0.4));
      bolster.position.set(bx, cushY + 0.02, 0);
      g.add(bolster);
    });

    // Backrest
    const brH = 0.85, brZ = -0.28, brY = cushY + brH / 2 + 0.04, tilt = -0.17;
    const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.7, brH, 0.09), mat(bC, 0.38));
    backrest.position.set(0, brY, brZ);
    backrest.rotation.x = tilt;
    backrest.castShadow = true;
    g.add(backrest);

    // Lumbar
    const lumbar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.64, 14), mat(bC, 0.3));
    lumbar.rotation.z = Math.PI / 2;
    lumbar.position.set(0, cushY + 0.2, brZ + 0.02);
    g.add(lumbar);

    // Backrest wings
    [-0.4, 0.4].forEach(bx => {
      const wing = new THREE.Mesh(new THREE.BoxGeometry(0.1, brH, 0.12), mat(tC, 0.38));
      wing.position.set(bx, brY, brZ);
      wing.rotation.x = tilt;
      g.add(wing);
    });

    // Headrest
    const hrY = cushY + brH + 0.14, hrZ = brZ - 0.01;
    const hrMat = mat(tC, 0.28, 0.05, isSel ? 0x22d3ee : 0, isSel ? 0.25 : 0);
    const hr = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.28, 0.11), hrMat);
    hr.position.set(0, hrY, hrZ);
    hr.rotation.x = tilt;
    hr.castShadow = true;
    g.add(hr);

    [-0.3, 0.3].forEach(hx => {
      const hw = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.26, 0.09), hrMat);
      hw.position.set(hx, hrY, hrZ + 0.02);
      hw.rotation.x = tilt;
      g.add(hw);
    });

    // Armrests - fixed: use position.set() not Object.assign
    [-0.44, 0.44].forEach(ax => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 8), mat(0x6b7280, 0.4, 0.6));
      post.position.set(ax, cushY + 0.11, 0);
      g.add(post);

      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.05, 0.4), mat(0x374151, 0.65));
      pad.position.set(ax, cushY + 0.235, -0.05);
      g.add(pad);
    });

    return { group: g, cushion, backrest, headrest: hr };
  };

  // -- Seated person ----------------------------------------------------------
  const VARIANTS = [
    { skin: 0xf5cba7, shirt: 0x1e3a8a, pants: 0x1f2937, hair: 0x1a0a00 },
    { skin: 0xd4956a, shirt: 0x064e3b, pants: 0x1e293b, hair: 0x2c1a00 },
    { skin: 0x8d5524, shirt: 0x7c2d12, pants: 0x111827, hair: 0x0a0a0a },
    { skin: 0xfddbb4, shirt: 0x4c1d95, pants: 0x0f172a, hair: 0xb5860d },
    { skin: 0xc68642, shirt: 0x1e3a5f, pants: 0x1e293b, hair: 0x2c1503 },
    { skin: 0xffe0bd, shirt: 0x831843, pants: 0x111827, hair: 0x8b0000 },
  ];

  const makePerson = (variant) => {
    const g = new THREE.Group();
    const { skin, shirt, pants, hair } = VARIANTS[variant % VARIANTS.length];
    const m = (col, rough = 0.55) => new THREE.MeshStandardMaterial({ color: col, roughness: rough });
    const hipY = 0.56, torsoH = 0.5, torsoY = hipY + torsoH / 2 + 0.02, headY = torsoY + torsoH / 2 + 0.23;

    // Hips - fixed
    const hips = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.17, 0.19, 10), m(pants));
    hips.position.set(0, hipY, 0);
    g.add(hips);

    // Thighs, shins, shoes - fixed
    [-0.1, 0.1].forEach(tx => {
      const th = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.075, 0.42, 10), m(pants));
      th.rotation.x = Math.PI / 2;
      th.position.set(tx, hipY - 0.04, 0.21);
      th.castShadow = true;
      g.add(th);

      const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.36, 10), m(pants));
      sh.rotation.x = 0.12;
      sh.position.set(tx, hipY - 0.23, 0.42);
      sh.castShadow = true;
      g.add(sh);

      // Shoe - fixed
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.065, 0.19), m(0x111827, 0.5));
      shoe.position.set(tx, hipY - 0.41, 0.53);
      g.add(shoe);
    });

    // Torso
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, torsoH, 10), m(shirt, 0.5));
    torso.rotation.x = -0.15;
    torso.position.set(0, torsoY, -0.04);
    torso.castShadow = true;
    g.add(torso);

    // Shoulders
    [-0.21, 0.21].forEach(sx => {
      const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 10), m(shirt, 0.5));
      shoulder.position.set(sx, torsoY + 0.17, -0.02);
      shoulder.scale.set(1.1, 0.85, 0.9);
      g.add(shoulder);
    });

    // Neck - fixed
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.075, 0.12, 10), m(skin));
    neck.position.set(0, torsoY + torsoH / 2 + 0.01, -0.02);
    g.add(neck);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 20), m(skin));
    head.scale.set(1, 1.1, 0.94);
    head.position.set(0, headY, -0.03);
    head.castShadow = true;
    g.add(head);

    // Hair cap
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 16), m(hair, 0.85));
    hairCap.scale.set(1, 0.58, 1);
    hairCap.position.set(0, headY + 0.1, -0.04);
    g.add(hairCap);

    // Side hair + ears
    [-0.18, 0.18].forEach(hx => {
      const hf = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), m(hair, 0.85));
      hf.scale.set(0.65, 1.1, 0.78);
      hf.position.set(hx, headY, -0.05);
      g.add(hf);

      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.033, 8, 8), m(skin));
      ear.scale.set(0.6, 1, 0.65);
      ear.position.set(hx, headY, -0.03);
      g.add(ear);
    });

    // Eyes
    const eyeM = new THREE.MeshStandardMaterial({ color: 0x080808 });
    [-0.06, 0.06].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), eyeM);
      eye.position.set(ex, headY + 0.02, 0.16);
      g.add(eye);
    });

    // Nose
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.027, 8, 8), m(skin));
    nose.scale.set(0.8, 0.7, 1.3);
    nose.position.set(0, headY - 0.02, 0.175);
    g.add(nose);

    // Arms
    const uaGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.32, 10);
    [-0.27, 0.27].forEach((ax, idx) => {
      const ua = new THREE.Mesh(uaGeo, m(shirt, 0.5));
      ua.rotation.z = idx === 0 ? 0.35 : -0.35;
      ua.rotation.x = 0.4;
      ua.position.set(ax, torsoY + 0.06, 0.06);
      g.add(ua);

      const fa = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.04, 0.28, 10), m(skin));
      fa.rotation.z = idx === 0 ? 0.15 : -0.15;
      fa.rotation.x = 1.0;
      fa.position.set(ax * 1.1, torsoY - 0.09, 0.2);
      g.add(fa);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.053, 10, 10), m(skin));
      hand.scale.set(1.1, 0.72, 0.9);
      hand.position.set(ax * 1.15, torsoY - 0.2, 0.3);
      g.add(hand);
    });

    return g;
  };

  // -- Seat number badge ------------------------------------------------------
  const makeBadgeCanvas = (sn, isTaken, isSel) => {
    const cv = document.createElement('canvas'); cv.width = cv.height = 128;
    const ctx = cv.getContext('2d');
    ctx.beginPath(); ctx.arc(64, 64, 40, 0, Math.PI * 2);
    ctx.fillStyle = isTaken ? '#7f1d1d' : isSel ? '#0c4a6e' : '#1e3a8a'; ctx.fill();
    ctx.beginPath(); ctx.arc(64, 64, 33, 0, Math.PI * 2);
    ctx.fillStyle = isTaken ? '#dc2626' : isSel ? '#0891b2' : '#2563eb'; ctx.fill();
    ctx.fillStyle = '#ffffff'; ctx.font = 'bold 42px sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(sn), 64, 64);
    return cv;
  };

  const placeSeatLabel = (sn, x, z, isTaken, isSel) => {
    const cv  = makeBadgeCanvas(sn, isTaken, isSel);
    const tex = new THREE.CanvasTexture(cv);
    const badge = new THREE.Mesh(
      new THREE.PlaneGeometry(0.46, 0.46),
      new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide, transparent: true, emissive: isSel ? 0x22d3ee : 0, emissiveIntensity: isSel ? 0.3 : 0 })
    );
    badge.position.set(x, 2.0, z);
    badge.rotation.x = -0.25;
    sceneRef.current.add(badge);
    if (seatDataRef.current.has(sn)) Object.assign(seatDataRef.current.get(sn), { badge, badgeTex: tex, badgeCanvas: cv });
  };

  const placeGlowRing = (x, z, sn) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.6, 0.052, 32, 64),
      new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 1.5 })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(x, 0.01, z);
    sceneRef.current.add(ring);
    if (seatDataRef.current.has(sn)) seatDataRef.current.get(sn).ring = ring;
  };

  const placeRowNumbers = () => {
    for (let row = 0; row < rows; row++) {
      const z = ROW_Z_START + row * ROW_Z_STEP;
      const cv = document.createElement('canvas'); cv.width = 200; cv.height = 80;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = '#1e3a8a'; ctx.fillRect(0, 0, 200, 80);
      ctx.fillStyle = '#bfdbfe'; ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center'; ctx.fillText(`Row ${row + 1}`, 100, 50);
      const tex = new THREE.CanvasTexture(cv);
      const sign = new THREE.Mesh(
        new THREE.PlaneGeometry(0.88, 0.35),
        new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide })
      );
      sign.position.set(-3.3, 1.55, z);
      sign.rotation.y = Math.PI / 2;
      sceneRef.current.add(sign);
    }
  };

  const buildAllSeats = () => {
    const scene = sceneRef.current;
    for (let row = 0; row < rows; row++) {
      const z = ROW_Z_START + row * ROW_Z_STEP;
      for (let col = 0; col < 4; col++) {
        const sn = row * 4 + col + 1;
        if (sn > capacity) continue;
        const x = COL_X[col];
        const isTaken = takenSeats?.includes(sn);
        const isSel   = selectedSeat === sn;
        const { group, cushion, backrest, headrest } = makeSeat(isTaken, isSel);
        group.position.set(x, 0, z);
        group.userData = { seatNumber: sn };
        scene.add(group);
        let person = null;
        if (isTaken) {
          person = makePerson(sn);
          person.position.set(x, 0, z);
          scene.add(person);
        }
        seatDataRef.current.set(sn, { group, cushion, backrest, headrest, person, ring: null });
        placeSeatLabel(sn, x, z, isTaken, isSel);
        if (isSel && !isTaken) placeGlowRing(x, z, sn);
      }
    }
    placeRowNumbers();
  };

  // -- Lights - bright open scene ---------------------------------------------
  const addLights = () => {
    const s = sceneRef.current;

    // Very bright ambient so seats are fully visible from all angles
    s.add(new THREE.AmbientLight(0xffffff, 2.2));

    // Main top-down sun
    const sun = new THREE.DirectionalLight(0xfff8f0, 1.6);
    sun.position.set(4, 14, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.width = sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.left = -10; sun.shadow.camera.right = 10;
    sun.shadow.camera.top  =  10; sun.shadow.camera.bottom = -10;
    sun.shadow.camera.far  = 40;
    s.add(sun);

    // Soft fill from front-left (makes seats pop)
    const fill = new THREE.DirectionalLight(0xdbeafe, 0.8);
    fill.position.set(-6, 6, 8);
    s.add(fill);

    // Soft fill from back-right
    const back = new THREE.DirectionalLight(0xe0f2fe, 0.5);
    back.position.set(6, 4, -8);
    s.add(back);
  };

  // -- Seat material refresh --------------------------------------------------
  const refreshSeatAppearance = () => {
    seatDataRef.current.forEach((d, sn) => {
      const isTaken = takenSeats?.includes(sn);
      const isSel   = selectedSeat === sn;
      const col = (sn - 1) % 4, row = Math.floor((sn - 1) / 4);
      const x = COL_X[col], z = ROW_Z_START + row * ROW_Z_STEP;

      if (d.cushion)  d.cushion.material.color.setHex(isTaken ? 0x7f1d1d : isSel ? 0x164e63 : 0x1e3a8a);
      if (d.backrest) d.backrest.material.color.setHex(isTaken ? 0x991b1b : isSel ? 0x0e7490 : 0x1d4ed8);
      if (d.headrest) {
        d.headrest.material.color.setHex(isTaken ? 0xb91c1c : isSel ? 0x22d3ee : 0x3b82f6);
        d.headrest.material.emissive.setHex(isSel ? 0x22d3ee : 0);
        d.headrest.material.emissiveIntensity = isSel ? 0.25 : 0;
      }

      if (isTaken && !d.person) {
        d.person = makePerson(sn);
        d.person.position.set(x, 0, z);
        sceneRef.current.add(d.person);
      } else if (!isTaken && d.person) {
        sceneRef.current.remove(d.person);
        d.person = null;
      }

      if (d.badge && d.badgeTex && d.badgeCanvas) {
        const ctx = d.badgeCanvas.getContext('2d');
        ctx.clearRect(0, 0, 128, 128);
        ctx.beginPath(); ctx.arc(64, 64, 40, 0, Math.PI * 2);
        ctx.fillStyle = isTaken ? '#7f1d1d' : isSel ? '#0c4a6e' : '#1e3a8a'; ctx.fill();
        ctx.beginPath(); ctx.arc(64, 64, 33, 0, Math.PI * 2);
        ctx.fillStyle = isTaken ? '#dc2626' : isSel ? '#0891b2' : '#2563eb'; ctx.fill();
        ctx.fillStyle = '#fff'; ctx.font = 'bold 42px sans-serif';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(String(sn), 64, 64);
        d.badgeTex.needsUpdate = true;
        d.badge.material.emissiveIntensity = isSel ? 0.3 : 0;
      }

      if (d.ring) { sceneRef.current.remove(d.ring); d.ring = null; }
      if (isSel && !isTaken) placeGlowRing(x, z, sn);
    });
  };

  // -- Click handler ----------------------------------------------------------
  const handleClick = (e) => {
    if (!containerRef.current || !raycasterRef.current) return;
    const rect  = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width)  * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycasterRef.current.setFromCamera(mouse, cameraRef.current);
    const targets = [];
    seatDataRef.current.forEach(d => d.group && targets.push(d.group));
    const hits = raycasterRef.current.intersectObjects(targets, true);
    if (!hits.length) return;
    let obj = hits[0].object;
    while (obj.parent && !obj.userData?.seatNumber && obj.parent !== sceneRef.current) obj = obj.parent;
    const sn = obj.userData?.seatNumber;
    if (sn && !takenSeats?.includes(sn) && onSelect) onSelect(sn);
  };

  // -- Render loop ------------------------------------------------------------
  const startLoop = () => {
    startTimeRef.current = Date.now();
    const loop = () => {
      animationRef.current = requestAnimationFrame(loop);
      const t = (Date.now() - startTimeRef.current) / 1000;
      seatDataRef.current.forEach(d => {
        if (d.ring) d.ring.material.emissiveIntensity = 1.1 + 0.65 * Math.sin(t * 3.5);
      });
      controlsRef.current?.update();
      rendererRef.current?.render(sceneRef.current, cameraRef.current);
    };
    loop();
  };

  const onResize = () => {
    if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
    const W = containerRef.current.clientWidth, H = containerRef.current.clientHeight;
    cameraRef.current.aspect = W / H;
    cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(W, H);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      style={{
        width: '100%', height: '580px', borderRadius: '16px', overflow: 'hidden',
        cursor: 'grab', background: '#f0f6ff',
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        border: '1px solid #e2e8f0',
      }}
    />
  );
};

// --- Icons --------------------------------------------------------------------
const Ic = ({ d, className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d={d} />
  </svg>
);
const I = {
  bus:    'M8 6v6m0 0v6m0-6h8m0-6v6m0 6v-6M3 6h18M3 18h18M5 6V4a1 1 0 011-1h12a1 1 0 011 1v2',
  ticket: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z',
  close:  'M6 18L18 6M6 6l12 12',
  check:  'M5 13l4 4L19 7',
  clock:  'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  map:    'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z',
  seat:   'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  trash:  'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16',
  search: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0',
  arrow:  'M13 7l5 5m0 0l-5 5m5-5H6',
  back:   'M11 17l-5-5m0 0l5-5m-5 5h12',
  info:   'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  mail:   'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  bell:   'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
};

// --- Toast --------------------------------------------------------------------
const Toast = ({ msg, type, onClose }) => (
  <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border text-sm font-semibold animate-toast
    ${type === 'success' ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-400' : 'bg-rose-500/15 border-rose-400/30 text-rose-400'}`}>
    <Ic d={type === 'success' ? I.check : I.close} className="w-4 h-4" />{msg}
    <button onClick={onClose}><Ic d={I.close} className="w-3.5 h-3.5 opacity-60 hover:opacity-100" /></button>
  </div>
);

// --- Modal --------------------------------------------------------------------
const Modal = ({ onClose, children, wide = false }) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg">
    <div className={`relative rounded-3xl shadow-2xl w-full border border-white/10 bg-[#0f1117] max-h-[92vh] overflow-y-auto ${wide ? 'max-w-5xl' : 'max-w-lg'}`}>
      {children}
    </div>
  </div>
);

// -----------------------------------------------------------------------------
//  SCHEDULE CARD
// -----------------------------------------------------------------------------
const ScheduleCard = ({ schedule, onBook, hasBooked, dark }) => {
  const dep  = new Date(schedule.departureTime);
  const mins = Math.round((dep - new Date()) / 60000);
  const soon = mins > 0 && mins < 60, gone = mins < 0;
  const pct  = Math.round(((schedule.busId?.capacity || 30) - schedule.availableSeats) / (schedule.busId?.capacity || 30) * 100);

  const routeName  = schedule.routeId?.routeName  || 'Route';
  const startPoint = schedule.routeId?.startPoint || '';
  const endPoint   = schedule.routeId?.endPoint   || '';
  const startLat   = schedule.routeId?.startLat   ?? null;
  const startLng   = schedule.routeId?.startLng   ?? null;
  const endLat     = schedule.routeId?.endLat     ?? null;
  const endLng     = schedule.routeId?.endLng     ?? null;
  const hasCoords  = startLat && startLng && endLat && endLng;

  const [mapError,    setMapError]    = useState(null);
  const [mapLoading,  setMapLoading]  = useState(false);
  const mapRef        = useRef(null);
  const mapElRef      = useRef(null);
  const mapInitedRef  = useRef(false);
  const mapInitReqRef = useRef(0);

  const mapDivCallback = useCallback(async (el) => {
    mapElRef.current = el;
    if (!el || mapInitedRef.current) return;
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    if (el._leaflet_id) return;
    const reqId = ++mapInitReqRef.current;
    mapInitedRef.current = true;
    setMapLoading(true); setMapError(null);
    try {
      await loadLeaflet();
      if (reqId !== mapInitReqRef.current || !el.isConnected) { setMapLoading(false); mapInitedRef.current = false; return; }
      const L = window.L;
      if (!hasCoords) { setMapError('No map coordinates. Ask admin to update with map picker.'); setMapLoading(false); mapInitedRef.current = false; return; }
      if (el._leaflet_id) { delete el._leaflet_id; el.innerHTML = ''; }
      const map = L.map(el, { zoomControl: true, scrollWheelZoom: false })
        .setView([(startLat + endLat) / 2, (startLng + endLng) / 2], 12);
      mapRef.current = map;
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap', maxZoom: 19 }).addTo(map);
      const greenIcon = L.divIcon({ className: '', html: `<div style="width:18px;height:18px;border-radius:50%;background:#10b981;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>`, iconSize: [18, 18], iconAnchor: [9, 9] });
      const redIcon   = L.divIcon({ className: '', html: `<div style="width:18px;height:18px;border-radius:50%;background:#ef4444;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35)"></div>`, iconSize: [18, 18], iconAnchor: [9, 9] });
      L.marker([startLat, startLng], { icon: greenIcon }).addTo(map).bindPopup(`<b>Start</b><br>${startPoint}`, { closeButton: false }).openPopup();
      L.marker([endLat,   endLng  ], { icon: redIcon   }).addTo(map).bindPopup(`<b>End</b><br>${endPoint}`,     { closeButton: false });
      L.polyline([[startLat, startLng], [endLat, endLng]], { color: '#0f172a', weight: 3, opacity: 0.8, dashArray: '8 6' }).addTo(map);
      map.fitBounds([[startLat, startLng], [endLat, endLng]], { padding: [40, 40] });
      setMapLoading(false);
    } catch { setMapError('Map failed to load.'); setMapLoading(false); mapInitedRef.current = false; }
  }, [startLat, startLng, endLat, endLng, startPoint, endPoint, hasCoords]);

  useEffect(() => () => {
    mapInitReqRef.current += 1;
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    const el = mapElRef.current;
    if (el && el._leaflet_id) { delete el._leaflet_id; el.innerHTML = ''; }
    mapInitedRef.current = false;
  }, [schedule._id]);

  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-2xl
      ${dark ? 'bg-gray-900 border-white/10 hover:border-[#0f172a]/30' : 'bg-white border-[#E0E4EB] hover:border-[#06b6d4] shadow-sm'}`}>
      <div className={`h-1 w-full ${gone ? 'bg-gray-500' : soon ? 'bg-gradient-to-r from-[#FF6B35] to-[#F59E0B]' : 'bg-gradient-to-r from-[#0f172a] to-[#06b6d4]'}`} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg ${gone ? 'bg-gray-700' : soon ? 'bg-gradient-to-br from-[#FF6B35] to-[#F59E0B]' : 'bg-gradient-to-br from-[#0f172a] to-[#06b6d4]'}`}>
              <Ic d={I.bus} className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`font-extrabold text-base ${dark ? 'text-white' : 'text-gray-900'}`}>{routeName}</p>
              <p className={`text-xs font-semibold ${dark ? 'text-slate-500' : 'text-[#6B7280]'}`}>{schedule.busId?.plateNumber} - {schedule.busId?.model}</p>
            </div>
          </div>
          {soon && !gone && <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/20 animate-pulse">SOON</span>}
          {gone && <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-gray-500/15 text-[#6B7280] border border-gray-400/20">DEPARTED</span>}
        </div>

        {/* Route pill */}
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4 text-xs font-semibold ${dark ? 'bg-white/5' : 'bg-[#F5F7FA]'}`}>
          <div className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30 shrink-0" />
          <span className={dark ? 'text-slate-300' : 'text-gray-600'}>{startPoint}</span>
          <div className="flex-1 flex items-center gap-0.5">
            {[...Array(4)].map((_, i) => <div key={i} className={`flex-1 h-px ${dark ? 'bg-white/10' : 'bg-gray-200'}`} />)}
            <Ic d={I.arrow} className="w-3 h-3 text-[#0f172a] shrink-0" />
          </div>
          <span className={dark ? 'text-slate-300' : 'text-gray-600'}>{endPoint}</span>
          <div className="w-2 h-2 rounded-full bg-rose-400 ring-2 ring-rose-400/30 shrink-0" />
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label: 'Departure', val: dep.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), sub: dep.toLocaleDateString() },
            { label: 'Seats Left', val: schedule.availableSeats, sub: `of ${schedule.busId?.capacity || '?'} total`, color: schedule.availableSeats === 0 ? 'text-rose-400' : schedule.availableSeats < 5 ? 'text-[#FF6B35]' : dark ? 'text-white' : 'text-gray-900' },
          ].map(info => (
            <div key={info.label} className={`rounded-xl p-3 ${dark ? 'bg-white/5' : 'bg-[#F5F7FA]'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${dark ? 'text-slate-500' : 'text-[#6B7280]'}`}>{info.label}</p>
              <p className={`font-black text-sm ${info.color || (dark ? 'text-white' : 'text-gray-900')}`}>{info.val}</p>
              <p className={`text-[10px] ${dark ? 'text-slate-500' : 'text-[#6B7280]'}`}>{info.sub}</p>
            </div>
          ))}
        </div>

        {/* Occupancy bar */}
        <div className="mb-2">
          <div className={`h-2 rounded-full overflow-hidden ${dark ? 'bg-white/10' : 'bg-gray-100'}`}>
            <div className={`h-full rounded-full transition-all duration-700 ${pct > 80 ? 'bg-gradient-to-r from-rose-400 to-rose-600' : pct > 50 ? 'bg-gradient-to-r from-[#FF6B35] to-[#F59E0B]' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`} style={{ width: `${pct}%` }} />
          </div>
          <p className={`text-[10px] mt-1 font-semibold ${dark ? 'text-slate-500' : 'text-[#6B7280]'}`}>{pct}% occupied</p>
        </div>
      </div>

      {/* Route Map */}
      <div className={`border-t ${dark ? 'border-white/10' : 'border-[#E0E4EB]'}`}>
        <div className={`px-5 py-3 ${dark ? 'bg-white/5' : 'bg-[#F5F7FA]'}`}>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#6B7280] mb-2">
            <svg className="w-3.5 h-3.5 text-[#0f172a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Route Map</span>
            {hasCoords  && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400">Precise</span>}
            {!hasCoords && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FF6B35]/15 text-[#FF6B35]">No coords</span>}
          </div>
          {mapLoading && (
            <div className="flex flex-col items-center justify-center gap-3" style={{ height: 220 }}>
              <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid #0f172a', borderTopColor: 'transparent' }} />
              <p className="text-xs text-[#6B7280] font-medium">Loading map...</p>
            </div>
          )}
          {mapError && !mapLoading && (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <svg className="w-7 h-7 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-xs text-rose-400 font-semibold">{mapError}</p>
            </div>
          )}
          <div ref={mapDivCallback} style={{ height: 220, width: '100%', borderRadius: 10, display: mapError ? 'none' : 'block' }} />
          {!mapLoading && !mapError && hasCoords && (
            <div className="flex items-center justify-between mt-2 text-[10px] font-semibold text-[#6B7280]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />{startPoint}</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />{endPoint}</div>
              </div>
              <span>OpenStreetMap</span>
            </div>
          )}
        </div>
      </div>

      {/* Book button */}
      <div className="p-5 pt-3">
        {hasBooked ? (
          <div className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-xs font-bold text-center">Already Booked</div>
        ) : schedule.availableSeats === 0 ? (
          <div className="w-full py-3 rounded-xl bg-rose-500/10 border border-rose-400/20 text-rose-400 text-xs font-bold text-center">Fully Booked</div>
        ) : gone ? (
          <div className="w-full py-3 rounded-xl bg-gray-500/10 border border-gray-400/20 text-[#6B7280] text-xs font-bold text-center">Already Departed</div>
        ) : (
          <button onClick={() => onBook(schedule)} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0f172a] to-[#06b6d4] hover:from-[#06b6d4] hover:to-[#0f172a] text-white text-sm font-bold shadow-lg shadow-[#0f172a]/25 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
            <Ic d={I.ticket} className="w-4 h-4" /> Book Seat
          </button>
        )}
      </div>
    </div>
  );
};

// -----------------------------------------------------------------------------
//  MAIN STUDENT DASHBOARD
// -----------------------------------------------------------------------------
export default function StudentShuttleDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [dark, setDark]   = useState(false);
  const [tab, setTab]     = useState('schedules');
  const [toast, setToast] = useState(null);
  const [loading, setLoading]   = useState(false);
  const [search, setSearch]     = useState('');
  const [schedules, setSchedules]   = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [takenSeats, setTakenSeats] = useState([]);
  const [bookingSchedule, setBookingSchedule] = useState(null);
  const [selectedSeat, setSelectedSeat]       = useState(null);
  const [confirming, setConfirming]   = useState(false);
  const [is3DVisible, setIs3DVisible] = useState(false);
  const prevBookingsRef = useRef([]);
  const [newlyConfirmed, setNewlyConfirmed] = useState([]);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  const fetchSchedules  = async () => { try { const r = await axios.get('/shuttles/schedules'); setSchedules(r.data); } catch {} };
  const fetchMyBookings = async () => {
    try {
      const r = await axios.get('/shuttles/my-bookings');
      const fresh = r.data || [];
      const prev  = prevBookingsRef.current;
      const just  = fresh.filter(b => { const o = prev.find(p => p._id === b._id); return o && o.paymentStatus === 'Pending' && b.paymentStatus === 'Confirmed'; });
      if (just.length) { just.forEach(b => showToast(`Booking for ${b.scheduleId?.routeId?.routeName || 'your trip'} confirmed!`)); setNewlyConfirmed(p => [...p, ...just.map(b => b._id)]); }
      prevBookingsRef.current = fresh;
      setMyBookings(fresh);
    } catch {}
  };
  const fetchTakenSeats = async id => { try { const r = await axios.get(`/shuttles/seats/${id}`); setTakenSeats(r.data.takenSeats || []); } catch { setTakenSeats([]); } };

  useEffect(() => { fetchSchedules(); fetchMyBookings(); const i = setInterval(fetchMyBookings, 30000); return () => clearInterval(i); }, []);

  const openBooking = async schedule => {
    setBookingSchedule(schedule); setSelectedSeat(null); setConfirming(false); setIs3DVisible(false);
    await fetchTakenSeats(schedule._id);
    setTimeout(() => setIs3DVisible(true), 150);
  };

  const handleConfirmBook = async () => {
    if (!selectedSeat) return showToast('Please select a seat first', 'error');
    setLoading(true);
    try {
      await axios.post('/shuttles/reserve', { scheduleId: bookingSchedule._id, seatNumber: selectedSeat });
      showToast(`Seat ${selectedSeat} booked! Waiting for admin confirmation.`);
      setBookingSchedule(null); setSelectedSeat(null); setConfirming(false); setIs3DVisible(false);
      fetchSchedules(); fetchMyBookings();
    } catch (err) { showToast(err.response?.data?.msg || 'Booking failed', 'error'); }
    setLoading(false);
  };

  const cancelBooking = async id => {
    if (!window.confirm('Cancel this booking?')) return;
    try { await axios.delete(`/shuttles/cancel/${id}`); showToast('Booking cancelled'); fetchMyBookings(); fetchSchedules(); }
    catch (err) { showToast(err.response?.data?.msg || 'Error', 'error'); }
  };

  const logout = () => { localStorage.clear(); window.location.href = '/login'; };

  const filteredSchedules = schedules.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.routeId?.routeName?.toLowerCase().includes(q) || s.routeId?.startPoint?.toLowerCase().includes(q) || s.routeId?.endPoint?.toLowerCase().includes(q) || s.busId?.plateNumber?.toLowerCase().includes(q);
  });

  const myBookedIds    = myBookings.map(b => b.scheduleId?._id).filter(Boolean);
  const pendingCount   = myBookings.filter(b => b.paymentStatus === 'Pending').length;
  const confirmedCount = myBookings.filter(b => b.paymentStatus === 'Confirmed').length;

  const D = dark;
  const bg      = D ? 'bg-gray-950' : 'bg-[#F5F7FA]';
  const surface = D ? 'bg-gray-900' : 'bg-white';
  const border  = D ? 'border-white/10' : 'border-[#E0E4EB]';
  const text    = D ? 'text-white' : 'text-gray-900';
  const muted   = 'text-[#6B7280]';
  const inputCls = D
    ? 'bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-[#0f172a]/60 focus:ring-2 focus:ring-[#0f172a]/20'
    : 'bg-[#F5F7FA] border-[#E0E4EB] text-gray-900 placeholder-[#6B7280] focus:border-[#0f172a] focus:ring-2 focus:ring-[#0f172a]/20';

  const closeModal = () => { setBookingSchedule(null); setSelectedSeat(null); setConfirming(false); setIs3DVisible(false); };

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`}>
      <style>{`
        * { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif; }
        @keyframes toast-in { from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)} }
        .animate-toast { animation: toast-in 0.3s cubic-bezier(.22,1,.36,1); }
        @keyframes fade-up { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fade-up 0.45s cubic-bezier(.22,1,.36,1) both; }
        .d1{animation-delay:.04s}.d2{animation-delay:.08s}.d3{animation-delay:.12s}
        .d4{animation-delay:.16s}.d5{animation-delay:.20s}.d6{animation-delay:.24s}
        @keyframes confirmed-pulse {
          0%  { box-shadow: 0 0 0 0   rgba(52,211,153,.4) }
          70% { box-shadow: 0 0 0 12px rgba(52,211,153,0) }
          100%{ box-shadow: 0 0 0 0   rgba(52,211,153,0) }
        }
        .confirmed-glow { animation: confirmed-pulse 1.5s ease-out 2; }
        ::-webkit-scrollbar { width: 5px }
        ::-webkit-scrollbar-thumb { background: linear-gradient(135deg,#06b6d4,#1e293b); border-radius: 10px }
        .leaflet-container { font-family: inherit !important; z-index: 1; }
        .leaflet-popup-content-wrapper { border-radius: 10px !important; box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important; }
        .leaflet-popup-tip-container { display: none; }
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <StudentTopNav active="Shuttle" />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">

        {/* Hero */}
        <div className="relative overflow-hidden rounded-3xl p-8 fade-up" style={{ background: 'linear-gradient(135deg,#0f172a 0%,#06b6d4 40%,#1e293b 100%)' }}>
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}
              </p>
              <h1 className="text-white text-3xl font-black mb-1">{user.name?.split(' ')[0] || 'Student'}</h1>
              <p className="text-white/50 text-sm">Find your bus, pick your seat, travel smart.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {[
                { v: schedules.length, l: 'Available' },
                { v: myBookings.length, l: 'My Trips' },
                { v: schedules.reduce((a, s) => a + s.availableSeats, 0), l: 'Free Seats' },
              ].map(s => (
                <div key={s.l} className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/10 min-w-[80px]">
                  <p className="text-3xl font-black text-white">{s.v}</p>
                  <p className="text-white/50 text-[11px] font-semibold mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status bar */}
        {myBookings.length > 0 && (
          <div className={`flex items-center gap-4 flex-wrap p-4 rounded-2xl border ${surface} ${border}`}>
            <Ic d={I.bell} className="w-4 h-4 text-[#0f172a] shrink-0" />
            <span className={`text-sm font-semibold ${text}`}>Booking Status</span>
            <div className="flex gap-3 flex-wrap">
              {pendingCount > 0 && <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/20">{pendingCount} Pending</span>}
              {confirmedCount > 0 && <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-400/20"><Ic d={I.mail} className="w-3.5 h-3.5" />{confirmedCount} Confirmed</span>}
            </div>
            <span className={`ml-auto text-[11px] ${muted}`}>Auto-refreshes every 30s</span>
          </div>
        )}

        {/* Tabs */}
        <div className={`flex gap-1.5 p-1.5 rounded-2xl border w-fit ${surface} ${border}`}>
          {[{ id: 'schedules', label: 'Find a Bus', icon: I.bus }, { id: 'bookings', label: 'My Bookings', icon: I.ticket }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
                ${tab === t.id ? 'bg-gradient-to-r from-[#0f172a] to-[#06b6d4] text-white shadow-lg shadow-[#0f172a]/25' : `${muted} hover:text-white`}`}>
              <Ic d={t.icon} className="w-4 h-4" />{t.label}
              {t.id === 'bookings' && myBookings.length > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-white/20 text-white' : 'bg-[#0f172a]/20 text-[#0f172a]'}`}>{myBookings.length}</span>
              )}
              {t.id === 'bookings' && pendingCount > 0 && tab !== 'bookings' && (
                <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Find a Bus */}
        {tab === 'schedules' && (
          <div className="fade-up space-y-6">
            <div className="relative">
              <Ic d={I.search} className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${muted}`} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by route, destination or bus plate..."
                className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border text-sm outline-none transition-all ${inputCls}`} />
            </div>
            {filteredSchedules.length === 0 ? (
              <div className={`rounded-2xl border ${surface} ${border} py-20 text-center`}>
                <Ic d={I.bus} className={`w-12 h-12 mx-auto mb-3 ${muted}`} />
                <p className={`font-bold ${text}`}>No buses found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredSchedules.map((s, i) => (
                  <div key={s._id} className={`fade-up d${Math.min(i + 1, 6)}`}>
                    <ScheduleCard schedule={s} onBook={openBooking} hasBooked={myBookedIds.includes(s._id)} dark={dark} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Bookings */}
        {tab === 'bookings' && (
          <div className="fade-up space-y-5">
            <div>
              <h2 className={`text-xl font-extrabold ${text}`}>My Bookings</h2>
              <p className={`text-sm ${muted}`}>{myBookings.length} reservation{myBookings.length !== 1 ? 's' : ''}</p>
            </div>
            {myBookings.length === 0 ? (
              <div className={`rounded-2xl border ${surface} ${border} py-20 text-center`}>
                <Ic d={I.ticket} className={`w-12 h-12 mx-auto mb-3 ${muted}`} />
                <p className={`font-bold ${text}`}>No bookings yet</p>
                <button onClick={() => setTab('schedules')} className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#0f172a] to-[#06b6d4] text-white text-sm font-bold hover:opacity-90 transition-all">Find a Bus</button>
              </div>
            ) : (
              <div className="space-y-4">
                {myBookings.map((b, i) => {
                  const dep = new Date(b.scheduleId?.departureTime), gone = dep < new Date();
                  const isConfirmed = b.paymentStatus === 'Confirmed', isNew = newlyConfirmed.includes(b._id);
                  return (
                    <div key={b._id} className={`fade-up d${Math.min(i + 1, 6)} relative overflow-hidden rounded-2xl border p-5 ${surface} ${border} transition-all hover:shadow-xl ${isNew ? 'confirmed-glow' : ''}`}>
                      <div className={`absolute top-0 left-0 right-0 h-1 ${isConfirmed ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-[#FF6B35] to-[#F59E0B]'}`} />
                      <div className="flex items-start justify-between gap-4 flex-wrap pt-2">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg font-black text-xl text-white
                            ${gone ? 'bg-gradient-to-br from-gray-600 to-gray-700' : isConfirmed ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 'bg-gradient-to-br from-[#0f172a] to-[#06b6d4]'}`}>
                            {b.seatNumber}
                          </div>
                          <div>
                            <p className={`font-extrabold text-base ${text}`}>{b.scheduleId?.routeId?.routeName || 'Route'}</p>
                            <p className={`text-xs font-semibold ${muted}`}>{b.scheduleId?.busId?.plateNumber} - Seat {b.seatNumber}</p>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <span className={`text-xs font-semibold flex items-center gap-1 ${muted}`}><Ic d={I.clock} className="w-3 h-3" />{dep.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                              <span className={`text-xs font-semibold flex items-center gap-1 ${muted}`}><Ic d={I.map} className="w-3 h-3" />{b.scheduleId?.routeId?.startPoint}{' -> '}{b.scheduleId?.routeId?.endPoint}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-extrabold border ${isConfirmed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20' : 'bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/20'}`}>
                            {isConfirmed ? 'Confirmed' : 'Pending'}
                          </span>
                          {isConfirmed && <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400"><Ic d={I.mail} className="w-3 h-3" /> Email sent</span>}
                          {!isConfirmed && !gone && <span className={`text-[11px] font-semibold ${muted} text-right`}>Waiting for admin</span>}
                          {!gone && (
                            <button onClick={() => cancelBooking(b._id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-400/20 text-rose-400 text-xs font-bold transition-all">
                              <Ic d={I.trash} className="w-3.5 h-3.5" /> Cancel
                            </button>
                          )}
                          {gone && <span className={`text-xs font-semibold ${muted}`}>Completed</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* -- Booking Modal -- */}
      {bookingSchedule && (
        <Modal onClose={closeModal} wide>
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-black text-xl text-white">{confirming ? 'Confirm Booking' : '3D Seat Selection'}</h2>
                <p className="text-sm mt-0.5 text-[#6B7280]">{bookingSchedule.routeId?.routeName} - {bookingSchedule.busId?.plateNumber}</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-white/10 text-[#6B7280] hover:text-white transition-all">
                <Ic d={I.close} className="w-5 h-5" />
              </button>
            </div>

            {!confirming ? (
              <>
                {/* Info strip */}
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[
                    { icon: I.clock, val: new Date(bookingSchedule.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), sub: new Date(bookingSchedule.departureTime).toLocaleDateString(), label: 'Departure' },
                    { icon: I.map,   val: bookingSchedule.routeId?.startPoint, sub: `-> ${bookingSchedule.routeId?.endPoint}`, label: 'Route' },
                    { icon: I.seat,  val: `${bookingSchedule.availableSeats} seats`, sub: `of ${bookingSchedule.busId?.capacity} total`, label: 'Available' },
                  ].map(info => (
                    <div key={info.label} className="flex flex-col gap-1 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <Ic d={info.icon} className="w-3.5 h-3.5 text-[#06b6d4]" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">{info.label}</span>
                      </div>
                      <p className="text-sm font-black text-white leading-none">{info.val}</p>
                      <p className="text-[11px] text-[#6B7280] font-semibold">{info.sub}</p>
                    </div>
                  ))}
                  <div className="flex flex-col gap-1 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Legend</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {[['bg-blue-600', 'Free'], ['bg-red-600', 'Booked'], ['bg-cyan-400', 'Selected']].map(([c, l]) => (
                        <div key={l} className="flex items-center gap-1">
                          <div className={`w-3 h-3 rounded ${c}`} />
                          <span className="text-[9px] text-[#6B7280]">{l}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3D Seat Map */}
                {is3DVisible ? (
                  <Advanced3DSeatMap
                    capacity={bookingSchedule.busId?.capacity || 40}
                    takenSeats={takenSeats}
                    selectedSeat={selectedSeat}
                    onSelect={setSelectedSeat}
                    isVisible={is3DVisible}
                  />
                ) : (
                  <div className="w-full h-[580px] rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-14 h-14 border-4 border-[#0f172a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-slate-500 font-medium">Loading 3D Seat Map...</p>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex justify-center gap-6 text-xs text-[#6B7280]">
                  <span><strong className="text-white">Drag</strong> to rotate</span>
                  <span><strong className="text-white">Scroll</strong> to zoom</span>
                  <span><strong className="text-white">Click</strong> blue seat to select</span>
                </div>

                {selectedSeat && (
                  <div className="mt-4 p-4 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white font-black text-lg">{selectedSeat}</div>
                      <div>
                        <p className="text-cyan-400 font-bold">Seat {selectedSeat} Selected</p>
                        <p className="text-xs text-[#6B7280]">Click a different seat to change</p>
                      </div>
                    </div>
                    <Ic d={I.check} className="w-5 h-5 text-cyan-400" />
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button onClick={closeModal} className="flex-1 py-3.5 rounded-xl font-bold text-sm text-[#6B7280] hover:bg-white/5 transition-all" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    Cancel
                  </button>
                  <button
                    onClick={() => { if (!selectedSeat) return showToast('Please select a seat first', 'error'); setConfirming(true); }}
                    disabled={!selectedSeat}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#0f172a] to-[#06b6d4] text-white font-bold text-sm shadow-lg hover:opacity-90 transition-all disabled:opacity-30">
                    {selectedSeat ? `Continue with Seat ${selectedSeat}` : 'Select a seat first'}
                  </button>
                </div>
              </>
            ) : (
              /* Confirm screen */
              <div className="space-y-5">
                <div className="relative overflow-hidden rounded-3xl p-6" style={{ background: 'linear-gradient(135deg,#0f172a,#06b6d4,#1e293b)' }}>
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  <div className="relative flex items-start justify-between mb-4">
                    <div>
                      <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">SLIIT Shuttle</p>
                      <p className="text-white font-black text-2xl">{bookingSchedule.routeId?.routeName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Seat</p>
                      <p className="text-white font-black text-5xl leading-none">{selectedSeat}</p>
                    </div>
                  </div>
                  <div className="h-px my-4" style={{ backgroundImage: 'repeating-linear-gradient(90deg,rgba(255,255,255,.3) 0,rgba(255,255,255,.3) 8px,transparent 8px,transparent 16px)' }} />
                  <div className="flex items-center justify-between text-xs mb-4">
                    <div><p className="text-white/50 font-semibold">FROM</p><p className="text-white font-bold text-sm">{bookingSchedule.routeId?.startPoint}</p></div>
                    <Ic d={I.arrow} className="w-5 h-5 text-white/40" />
                    <div className="text-right"><p className="text-white/50 font-semibold">TO</p><p className="text-white font-bold text-sm">{bookingSchedule.routeId?.endPoint}</p></div>
                  </div>
                  <div className="flex gap-6 text-xs">
                    {[['BUS', bookingSchedule.busId?.plateNumber], ['DEPARTS', new Date(bookingSchedule.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })], ['DATE', new Date(bookingSchedule.departureTime).toLocaleDateString()]].map(([l, v]) => (
                      <div key={l}><p className="text-white/50 font-semibold">{l}</p><p className="text-white font-bold">{v}</p></div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl flex items-start gap-3 bg-[#FF6B35]/10 border border-[#FF6B35]/20">
                  <Ic d={I.info} className="w-4 h-4 text-[#FF6B35] shrink-0 mt-0.5" />
                  <p className="text-xs text-[#FF6B35]/90">Your booking will be <strong>Pending</strong> until the admin confirms it. You'll receive a confirmation email.</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setConfirming(false)} className="flex-1 py-3.5 rounded-xl text-[#6B7280] hover:bg-white/5 font-bold text-sm transition-all flex items-center justify-center gap-2" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Ic d={I.back} className="w-4 h-4" /> Change Seat
                  </button>
                  <button onClick={handleConfirmBook} disabled={loading}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? 'Booking...' : <><Ic d={I.check} className="w-4 h-4" />Confirm Booking</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}