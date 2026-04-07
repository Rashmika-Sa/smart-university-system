import React, { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import StudentTopNav from '../../components/StudentTopNav';

// ─────────────────────────────────────────────────────────────────────────────
//  ADVANCED 3D SEAT MAP
// ─────────────────────────────────────────────────────────────────────────────
const Advanced3DSeatMap = ({ capacity, takenSeats, selectedSeat, onSelect, isVisible }) => {
  const containerRef   = useRef(null);
  const sceneRef       = useRef(null);
  const cameraRef      = useRef(null);
  const rendererRef    = useRef(null);
  const controlsRef    = useRef(null);
  const seatDataRef    = useRef(new Map());
  const raycasterRef   = useRef(null);
  const animationRef   = useRef(null);
  const clockRef       = useRef(new THREE.Clock());
  const initializedRef = useRef(false);

  // ── Layout
  // Bus travels along +Z. Front of bus = high +Z. Seats face +Z (toward front).
  // 4 columns: left pair (cols 0,1) and right pair (cols 2,3) with aisle at X=0.
  const COL_X       = [-2.1, -1.15, 1.15, 2.1];
  const ROW_Z_START =  3.2;   // first row closest to driver
  const ROW_Z_STEP  = -1.35;  // step toward back of bus
  const rows        = Math.ceil(capacity / 4);

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isVisible || !containerRef.current) return;
    const t = setTimeout(() => {
      if (!initializedRef.current && containerRef.current) {
        initThree(); buildBusShell(); buildAllSeats(); addLights(); startLoop();
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

  // ── THREE setup ────────────────────────────────────────────────────────────
  const initThree = () => {
    const el = containerRef.current;
    const W = el.clientWidth, H = el.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080c14);
    scene.fog = new THREE.FogExp2(0x080c14, 0.032);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(40, W / H, 0.1, 200);
    // Angled view from driver's-right side so you see seatbacks & headrests clearly
    camera.position.set(8, 7, 1);
    camera.lookAt(0, 1.2, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(W, H);
    renderer.shadowMap.enabled  = true;
    renderer.shadowMap.type     = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping        = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    el.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ctrl = new OrbitControls(camera, renderer.domElement);
    ctrl.enableDamping  = true;  ctrl.dampingFactor  = 0.07;
    ctrl.rotateSpeed    = 0.85;  ctrl.zoomSpeed      = 1.1;
    ctrl.maxPolarAngle  = Math.PI / 2.05;
    ctrl.minDistance    = 3;     ctrl.maxDistance    = 20;
    ctrl.target.set(0, 1, 0);
    controlsRef.current = ctrl;

    raycasterRef.current = new THREE.Raycaster();
    window.addEventListener('resize', onResize);
  };

  // ── Bus interior shell ─────────────────────────────────────────────────────
  const buildBusShell = () => {
    const s = sceneRef.current;
    const busLen = rows * 1.35 + 4.5;
    const halfLen = busLen / 2;
    // We'll centre the bus along Z so midpoint is roughly at z=0
    const zMid = ROW_Z_START + (rows - 1) * ROW_Z_STEP / 2;

    const add = (geo, mat, x = 0, y = 0, z = 0, rx = 0) => {
      const m = new THREE.Mesh(geo, mat);
      m.position.set(x, y, z); m.rotation.x = rx;
      m.castShadow = true; m.receiveShadow = true;
      s.add(m); return m;
    };

    // Floor
    add(new THREE.PlaneGeometry(7, busLen), new THREE.MeshStandardMaterial({ color: 0x16202e, roughness: 0.6, metalness: 0.12 }), 0, 0, zMid, -Math.PI / 2);

    // Aisle rubber runner
    add(new THREE.BoxGeometry(1.7, 0.02, busLen), new THREE.MeshStandardMaterial({ color: 0x3b0764, roughness: 0.5, emissive: 0x1e0340, emissiveIntensity: 0.1 }), 0, 0.01, zMid);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x2d3a4a, metalness: 0.1, roughness: 0.8 });
    add(new THREE.BoxGeometry(0.1, 2.4, busLen), wallMat, -3.4, 1.2, zMid);
    add(new THREE.BoxGeometry(0.1, 2.4, busLen), wallMat,  3.4, 1.2, zMid);

    // Ceiling
    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(7, busLen), new THREE.MeshStandardMaterial({ color: 0x1e2a38, roughness: 0.9 }));
    ceil.position.set(0, 2.4, zMid); ceil.rotation.x = Math.PI / 2; s.add(ceil);

    // Window frames
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, metalness: 0.55, roughness: 0.3 });
    for (let row = 0; row < rows; row++) {
      const z = ROW_Z_START + row * ROW_Z_STEP;
      add(new THREE.BoxGeometry(0.07, 1.1, 0.07), frameMat, -3.38, 1.5, z);
      add(new THREE.BoxGeometry(0.07, 1.1, 0.07), frameMat,  3.38, 1.5, z);
    }
    // Horizontal window rail
    add(new THREE.BoxGeometry(0.05, 0.05, busLen), frameMat, -3.38, 2.08, zMid);
    add(new THREE.BoxGeometry(0.05, 0.05, busLen), frameMat,  3.38, 2.08, zMid);

    // Warm LED strips on walls
    const ledW = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xfbbf24, emissiveIntensity: 0.8 });
    add(new THREE.BoxGeometry(0.04, 0.04, busLen), ledW, -3.37, 2.2, zMid);
    add(new THREE.BoxGeometry(0.04, 0.04, busLen), ledW,  3.37, 2.2, zMid);

    // Cool ceiling strip
    add(new THREE.BoxGeometry(0.04, 0.04, busLen), new THREE.MeshStandardMaterial({ color: 0x7dd3fc, emissive: 0x7dd3fc, emissiveIntensity: 0.5 }), 0, 2.38, zMid);

    // Front wall (windshield end)
    const frontZ = ROW_Z_START + 1.9;
    add(new THREE.BoxGeometry(7, 2.4, 0.1), new THREE.MeshStandardMaterial({ color: 0x0f172a }), 0, 1.2, frontZ);

    // Back wall
    const backZ = ROW_Z_START + (rows - 1) * ROW_Z_STEP - 1.4;
    add(new THREE.BoxGeometry(7, 2.4, 0.1), new THREE.MeshStandardMaterial({ color: 0x0f172a }), 0, 1.2, backZ);

    // Driver dash
    add(new THREE.BoxGeometry(2.2, 0.45, 1.1), new THREE.MeshStandardMaterial({ color: 0x0d1117, metalness: 0.5 }), -1.7, 0.45, frontZ - 0.9);

    // Steering wheel
    const sw = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.048, 20, 48), new THREE.MeshStandardMaterial({ color: 0x374151, metalness: 0.8 }));
    sw.rotation.x = Math.PI / 2; sw.position.set(-1.7, 0.85, frontZ - 0.65); s.add(sw);
  };

  // ── Build one realistic bus seat ───────────────────────────────────────────
  // Seat faces +Z (toward front of bus). Origin = floor under seat center.
  const makeSeat = (isTaken, isSel) => {
    const g = new THREE.Group();

    // Colours
    const cC = isTaken ? 0x7f1d1d : isSel ? 0x164e63 : 0x1e3a8a; // cushion
    const bC = isTaken ? 0x991b1b : isSel ? 0x0e7490 : 0x1d4ed8; // backrest body
    const tC = isTaken ? 0xb91c1c : isSel ? 0x22d3ee : 0x3b82f6; // trim / headrest

    const mat = (col, rough = 0.45, metal = 0.04, emCol = 0, emInt = 0) =>
      new THREE.MeshStandardMaterial({ color: col, roughness: rough, metalness: metal, emissive: emCol, emissiveIntensity: emInt });

    // ── Legs ──────────────────────────────────────────────────────────────
    const legMat  = mat(0x374151, 0.35, 0.7);
    const legH    = 0.42;
    [[-0.3, 0.25], [0.3, 0.25], [-0.3, -0.25], [0.3, -0.25]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, legH, 8), legMat);
      leg.position.set(lx, legH / 2, lz); leg.castShadow = true; g.add(leg);
    });
    // Cross brace
    const bMat = mat(0x4b5563, 0.3, 0.7);
    const brace = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.66, 8), bMat);
    brace.rotation.z = Math.PI / 2; brace.position.set(0, 0.12, 0.25); g.add(brace);
    const braceB = brace.clone(); braceB.position.z = -0.25; g.add(braceB);

    // ── Cushion (seat pan) ─────────────────────────────────────────────────
    const cushY = legH + 0.07;
    const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.13, 0.58), mat(cC, 0.5));
    cushion.position.set(0, cushY, 0.02); cushion.castShadow = true; cushion.receiveShadow = true; g.add(cushion);

    // Front piping
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.78, 10), mat(tC, 0.3));
    pipe.rotation.z = Math.PI / 2; pipe.position.set(0, cushY + 0.07, 0.3); g.add(pipe);

    // Side bolsters on cushion
    [-0.4, 0.4].forEach(bx => {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.16, 0.56), mat(tC, 0.4));
      b.position.set(bx, cushY + 0.02, 0); g.add(b);
    });

    // ── Backrest ────────────────────────────────────────────────────────────
    // Bottom of backrest sits at rear of cushion, tilted ~10° backward
    const brH    = 0.85;          // height of main panel
    const brZ    = -0.28;         // z of backrest (rear of cushion)
    const brY    = cushY + brH / 2 + 0.04;
    const tilt   = -0.17;         // radians recline

    const backrest = new THREE.Mesh(new THREE.BoxGeometry(0.7, brH, 0.09), mat(bC, 0.38));
    backrest.position.set(0, brY, brZ);
    backrest.rotation.x = tilt;
    backrest.castShadow = true; g.add(backrest);

    // Lumbar bulge
    const lumbar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.64, 14), mat(bC, 0.3));
    lumbar.rotation.z = Math.PI / 2; lumbar.position.set(0, cushY + 0.2, brZ + 0.02); g.add(lumbar);

    // Backrest side wings
    [-0.4, 0.4].forEach(bx => {
      const w = new THREE.Mesh(new THREE.BoxGeometry(0.1, brH, 0.12), mat(tC, 0.38));
      w.position.set(bx, brY, brZ); w.rotation.x = tilt; g.add(w);
    });

    // ── Headrest ────────────────────────────────────────────────────────────
    const hrY  = cushY + brH + 0.14;
    const hrZ  = brZ - 0.01;
    const hrMat = mat(tC, 0.28, 0.05, isSel ? 0x22d3ee : 0, isSel ? 0.25 : 0);
    const hr   = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.28, 0.11), hrMat);
    hr.position.set(0, hrY, hrZ); hr.rotation.x = tilt; hr.castShadow = true; g.add(hr);

    // Headrest ears
    [-0.3, 0.3].forEach(hx => {
      const hw = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.26, 0.09), hrMat);
      hw.position.set(hx, hrY, hrZ + 0.02); hw.rotation.x = tilt; g.add(hw);
    });

    // ── Armrests ────────────────────────────────────────────────────────────
    [-0.44, 0.44].forEach(ax => {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 8), mat(0x374151, 0.4, 0.6));
      post.position.set(ax, cushY + 0.11, 0); g.add(post);
      const pad = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.05, 0.4), mat(0x111827, 0.65));
      pad.position.set(ax, cushY + 0.235, -0.05); g.add(pad);
    });

    return { group: g, cushion, backrest, headrest: hr };
  };

  // ── Seated human figure ────────────────────────────────────────────────────
  // Person faces +Z. Origin at floor. They sit on the cushion at y≈0.56.
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

    // Sitting geometry: hips at y=0.56 (on cushion top), torso rises, head at ~1.6
    const hipY   = 0.56;
    const torsoH = 0.5;
    const torsoY = hipY + torsoH / 2 + 0.02;
    const headY  = torsoY + torsoH / 2 + 0.23;

    // Hips
    const hips = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.17, 0.19, 10), m(pants));
    hips.position.set(0, hipY, 0); g.add(hips);

    // Thighs – horizontal toward front (+Z)
    [-0.1, 0.1].forEach(tx => {
      const th = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.075, 0.42, 10), m(pants));
      th.rotation.x = Math.PI / 2;
      th.position.set(tx, hipY - 0.04, 0.21);
      th.castShadow = true; g.add(th);

      // Shin hangs down from knee (knee at z≈0.42)
      const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.36, 10), m(pants));
      sh.rotation.x = 0.12;
      sh.position.set(tx, hipY - 0.23, 0.42);
      sh.castShadow = true; g.add(sh);

      // Shoe
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.065, 0.19), m(0x111827, 0.5));
      shoe.position.set(tx, hipY - 0.41, 0.53); g.add(shoe);
    });

    // Torso (slightly reclined into backrest)
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.19, torsoH, 10), m(shirt, 0.5));
    torso.rotation.x = -0.15;
    torso.position.set(0, torsoY, -0.04);
    torso.castShadow = true; g.add(torso);

    // Shoulders
    [-0.21, 0.21].forEach(sx => {
      const sh = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 10), m(shirt, 0.5));
      sh.position.set(sx, torsoY + 0.17, -0.02); sh.scale.set(1.1, 0.85, 0.9); g.add(sh);
    });

    // Neck
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.075, 0.12, 10), m(skin));
    neck.position.set(0, torsoY + torsoH / 2 + 0.01, -0.02); g.add(neck);

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 20, 20), m(skin));
    head.scale.set(1, 1.1, 0.94);
    head.position.set(0, headY, -0.03);
    head.castShadow = true; g.add(head);

    // Hair cap
    const hairCap = new THREE.Mesh(new THREE.SphereGeometry(0.19, 16, 16), m(hair, 0.85));
    hairCap.scale.set(1, 0.58, 1); hairCap.position.set(0, headY + 0.1, -0.04); g.add(hairCap);
    // Side hair
    [-0.18, 0.18].forEach(hx => {
      const hf = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), m(hair, 0.85));
      hf.scale.set(0.65, 1.1, 0.78); hf.position.set(hx, headY, -0.05); g.add(hf);
    });

    // Ears
    [-0.18, 0.18].forEach(ex => {
      const ear = new THREE.Mesh(new THREE.SphereGeometry(0.033, 8, 8), m(skin));
      ear.scale.set(0.6, 1, 0.65); ear.position.set(ex, headY, -0.03); g.add(ear);
    });

    // Eyes
    const eyeM = new THREE.MeshStandardMaterial({ color: 0x080808 });
    [-0.06, 0.06].forEach(ex => {
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), eyeM);
      eye.position.set(ex, headY + 0.02, 0.16); g.add(eye);
    });

    // Nose
    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.027, 8, 8), m(skin));
    nose.scale.set(0.8, 0.7, 1.3); nose.position.set(0, headY - 0.02, 0.175); g.add(nose);

    // Arms resting on armrests
    const uaGeo = new THREE.CylinderGeometry(0.055, 0.05, 0.32, 10);
    [-0.27, 0.27].forEach((ax, idx) => {
      const ua = new THREE.Mesh(uaGeo, m(shirt, 0.5));
      ua.rotation.z = idx === 0 ? 0.35 : -0.35; ua.rotation.x = 0.4;
      ua.position.set(ax, torsoY + 0.06, 0.06); g.add(ua);

      const fa = new THREE.Mesh(new THREE.CylinderGeometry(0.044, 0.04, 0.28, 10), m(skin));
      fa.rotation.z = idx === 0 ? 0.15 : -0.15; fa.rotation.x = 1.0;
      fa.position.set(ax * 1.1, torsoY - 0.09, 0.2); g.add(fa);

      const hand = new THREE.Mesh(new THREE.SphereGeometry(0.053, 10, 10), m(skin));
      hand.scale.set(1.1, 0.72, 0.9); hand.position.set(ax * 1.15, torsoY - 0.2, 0.3); g.add(hand);
    });

    return g;
  };

  // ── Seat number badge ──────────────────────────────────────────────────────
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
    // Float above headrest, tilt for readability from typical view angle
    badge.position.set(x, 2.0, z);
    badge.rotation.x = -0.25;
    sceneRef.current.add(badge);

    if (seatDataRef.current.has(sn)) {
      Object.assign(seatDataRef.current.get(sn), { badge, badgeTex: tex, badgeCanvas: cv });
    }
  };

  // ── Glow ring ──────────────────────────────────────────────────────────────
  const placeGlowRing = (x, z, sn) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.6, 0.052, 32, 64),
      new THREE.MeshStandardMaterial({ color: 0x22d3ee, emissive: 0x22d3ee, emissiveIntensity: 1.5 })
    );
    ring.rotation.x = Math.PI / 2; ring.position.set(x, 0.01, z);
    sceneRef.current.add(ring);
    if (seatDataRef.current.has(sn)) seatDataRef.current.get(sn).ring = ring;
  };

  // ── Row number signs ───────────────────────────────────────────────────────
  const placeRowNumbers = () => {
    for (let row = 0; row < rows; row++) {
      const z = ROW_Z_START + row * ROW_Z_STEP;
      const cv = document.createElement('canvas'); cv.width = 200; cv.height = 80;
      const ctx = cv.getContext('2d');
      ctx.fillStyle = '#1e3a8a'; ctx.fillRect(0, 0, 200, 80);
      ctx.fillStyle = '#bfdbfe'; ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'center'; ctx.fillText(`Row ${row + 1}`, 100, 50);
      const tex = new THREE.CanvasTexture(cv);
      const sign = new THREE.Mesh(new THREE.PlaneGeometry(0.88, 0.35), new THREE.MeshStandardMaterial({ map: tex, side: THREE.DoubleSide }));
      sign.position.set(-3.3, 1.55, z); sign.rotation.y = Math.PI / 2;
      sceneRef.current.add(sign);
    }
  };

  // ── Build all seats ────────────────────────────────────────────────────────
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

  // ── Lights ─────────────────────────────────────────────────────────────────
  const addLights = () => {
    const s = sceneRef.current;
    s.add(new THREE.AmbientLight(0x8090b0, 0.72));

    const sun = new THREE.DirectionalLight(0xfff5e0, 1.6);
    sun.position.set(6, 10, 4); sun.castShadow = true;
    sun.shadow.mapSize.width = sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.left = -10; sun.shadow.camera.right = 10;
    sun.shadow.camera.top  =  10; sun.shadow.camera.bottom = -10;
    sun.shadow.camera.far  = 35;
    s.add(sun);

    // Warm LEDs at ceiling level, spaced along bus
    const zStart = ROW_Z_START, zEnd = ROW_Z_START + (rows - 1) * ROW_Z_STEP;
    for (let z = zStart; z >= zEnd; z -= 2.5) {
      const pl = new THREE.PointLight(0xffcc88, 0.55, 7); pl.position.set(0, 2.2, z); s.add(pl);
    }
    // Fill light from right
    const fill = new THREE.DirectionalLight(0x8ba4d4, 0.4); fill.position.set(-6, 3, 0); s.add(fill);
    // Aisle glow
    const ag = new THREE.PointLight(0x7c3aed, 0.28, 5); ag.position.set(0, 0.05, ROW_Z_START + (rows - 1) * ROW_Z_STEP / 2); s.add(ag);
  };

  // ── Refresh materials on state change ─────────────────────────────────────
  const refreshSeatAppearance = () => {
    seatDataRef.current.forEach((d, sn) => {
      const isTaken = takenSeats?.includes(sn);
      const isSel   = selectedSeat === sn;
      const col     = (sn - 1) % 4;
      const row     = Math.floor((sn - 1) / 4);
      const x = COL_X[col], z = ROW_Z_START + row * ROW_Z_STEP;

      if (d.cushion)  d.cushion.material.color.setHex(isTaken ? 0x7f1d1d : isSel ? 0x164e63 : 0x1e3a8a);
      if (d.backrest) d.backrest.material.color.setHex(isTaken ? 0x991b1b : isSel ? 0x0e7490 : 0x1d4ed8);
      if (d.headrest) {
        d.headrest.material.color.setHex(isTaken ? 0xb91c1c : isSel ? 0x22d3ee : 0x3b82f6);
        d.headrest.material.emissive.setHex(isSel ? 0x22d3ee : 0);
        d.headrest.material.emissiveIntensity = isSel ? 0.25 : 0;
      }

      // Person
      if (isTaken && !d.person) {
        d.person = makePerson(sn); d.person.position.set(x, 0, z); sceneRef.current.add(d.person);
      } else if (!isTaken && d.person) {
        sceneRef.current.remove(d.person); d.person = null;
      }

      // Badge
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

      // Ring
      if (d.ring) { sceneRef.current.remove(d.ring); d.ring = null; }
      if (isSel && !isTaken) placeGlowRing(x, z, sn);
    });
  };

  // ── Click handler ──────────────────────────────────────────────────────────
  const handleClick = (e) => {
    if (!containerRef.current || !raycasterRef.current) return;
    const rect  = containerRef.current.getBoundingClientRect();
    const mouse = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width)  * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1
    );
    raycasterRef.current.setFromCamera(mouse, cameraRef.current);
    const targets = []; seatDataRef.current.forEach(d => d.group && targets.push(d.group));
    const hits = raycasterRef.current.intersectObjects(targets, true);
    if (!hits.length) return;
    let obj = hits[0].object;
    while (obj.parent && !obj.userData?.seatNumber && obj.parent !== sceneRef.current) obj = obj.parent;
    const sn = obj.userData?.seatNumber;
    if (sn && !takenSeats?.includes(sn) && onSelect) onSelect(sn);
  };

  // ── Render loop ────────────────────────────────────────────────────────────
  const startLoop = () => {
    const loop = () => {
      animationRef.current = requestAnimationFrame(loop);
      const t = clockRef.current.getElapsedTime();
      seatDataRef.current.forEach(d => { if (d.ring) d.ring.material.emissiveIntensity = 1.1 + 0.65 * Math.sin(t * 3.5); });
      controlsRef.current?.update();
      rendererRef.current?.render(sceneRef.current, cameraRef.current);
    };
    loop();
  };

  const onResize = () => {
    if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
    const W = containerRef.current.clientWidth, H = containerRef.current.clientHeight;
    cameraRef.current.aspect = W / H; cameraRef.current.updateProjectionMatrix();
    rendererRef.current.setSize(W, H);
  };

  return (
    <div ref={containerRef} onClick={handleClick}
      style={{ width: '100%', height: '590px', borderRadius: '20px', overflow: 'hidden', cursor: 'grab', background: '#080c14', boxShadow: '0 30px 55px -10px rgba(0,0,0,0.8)' }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  ICON HELPERS
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
//  TOAST
// ─────────────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type, onClose }) => (
  <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border text-sm font-semibold animate-toast
    ${type === 'success' ? 'bg-emerald-500/15 border-emerald-400/30 text-emerald-400' : 'bg-rose-500/15 border-rose-400/30 text-rose-400'}`}>
    <Ic d={type === 'success' ? I.check : I.close} className="w-4 h-4" />{msg}
    <button onClick={onClose}><Ic d={I.close} className="w-3.5 h-3.5 opacity-60 hover:opacity-100" /></button>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
//  MODAL
// ─────────────────────────────────────────────────────────────────────────────
const Modal = ({ onClose, children, wide = false }) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg">
    <div className={`relative rounded-3xl shadow-2xl w-full border border-white/10 bg-[#0f1117] max-h-[92vh] overflow-y-auto ${wide ? 'max-w-5xl' : 'max-w-lg'}`}>
      {children}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
//  SCHEDULE CARD
// ─────────────────────────────────────────────────────────────────────────────
const ScheduleCard = ({ schedule, onBook, hasBooked, dark }) => {
  const dep  = new Date(schedule.departureTime);
  const mins = Math.round((dep - new Date()) / 60000);
  const soon = mins > 0 && mins < 60, gone = mins < 0;
  const pct  = Math.round(((schedule.busId?.capacity || 30) - schedule.availableSeats) / (schedule.busId?.capacity || 30) * 100);
  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl
    ${dark ? 'bg-gray-900 border-white/10 hover:border-[#1B4D89]/30' : 'bg-white border-[#E0E4EB] hover:border-[#2A5F9E] shadow-sm'}`}>
      <div className={`h-1 w-full ${gone ? 'bg-gray-500' : soon ? 'bg-gradient-to-r from-[#FF6B35] to-[#F59E0B]' : 'bg-gradient-to-r from-[#1B4D89] to-[#2A5F9E]'}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg ${gone ? 'bg-gray-700' : soon ? 'bg-gradient-to-br from-[#FF6B35] to-[#F59E0B]' : 'bg-gradient-to-br from-[#1B4D89] to-[#2A5F9E]'}`}>
              <Ic d={I.bus} className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`font-extrabold text-base ${dark ? 'text-white' : 'text-gray-900'}`}>{schedule.routeId?.routeName || 'Route'}</p>
              <p className={`text-xs font-semibold ${dark ? 'text-slate-500' : 'text-[#6B7280]'}`}>{schedule.busId?.plateNumber} - {schedule.busId?.model}</p>
            </div>
          </div>
          {soon && !gone && <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-[#FF6B35]/15 text-[#FF6B35] border border-[#FF6B35]/20 animate-pulse">SOON</span>}
          {gone && <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-gray-500/15 text-[#6B7280] border border-gray-400/20">DEPARTED</span>}
        </div>
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4 text-xs font-semibold ${dark ? 'bg-white/5' : 'bg-[#F5F7FA]'}`}>
          <div className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30 shrink-0" />
          <span className={dark ? 'text-slate-300' : 'text-gray-600'}>{schedule.routeId?.startPoint}</span>
          <div className="flex-1 flex items-center gap-0.5">
            {[...Array(4)].map((_, i) => <div key={i} className={`flex-1 h-px ${dark ? 'bg-white/10' : 'bg-gray-200'}`} />)}
            <Ic d={I.arrow} className="w-3 h-3 text-[#1B4D89] shrink-0" />
          </div>
          <span className={dark ? 'text-slate-300' : 'text-gray-600'}>{schedule.routeId?.endPoint}</span>
          <div className="w-2 h-2 rounded-full bg-rose-400 ring-2 ring-rose-400/30 shrink-0" />
        </div>
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
        <div className="mb-4">
          <div className={`h-2 rounded-full overflow-hidden ${dark ? 'bg-white/10' : 'bg-gray-100'}`}>
            <div className={`h-full rounded-full transition-all duration-700 ${pct > 80 ? 'bg-gradient-to-r from-rose-400 to-rose-600' : pct > 50 ? 'bg-gradient-to-r from-[#FF6B35] to-[#F59E0B]' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`} style={{ width: `${pct}%` }} />
          </div>
          <p className={`text-[10px] mt-1 font-semibold ${dark ? 'text-slate-500' : 'text-[#6B7280]'}`}>{pct}% occupied</p>
        </div>
        {hasBooked
          ? <div className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-xs font-bold text-center">Already Booked</div>
          : schedule.availableSeats === 0
            ? <div className="w-full py-3 rounded-xl bg-rose-500/10 border border-rose-400/20 text-rose-400 text-xs font-bold text-center">Fully Booked</div>
            : gone
              ? <div className="w-full py-3 rounded-xl bg-gray-500/10 border border-gray-400/20 text-[#6B7280] text-xs font-bold text-center">Already Departed</div>
              : <button onClick={() => onBook(schedule)} className="w-full py-3 rounded-xl bg-gradient-to-r from-[#1B4D89] to-[#2A5F9E] hover:from-[#2A5F9E] hover:to-[#1B4D89] text-white text-sm font-bold shadow-lg shadow-[#1B4D89]/25 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                  <Ic d={I.ticket} className="w-4 h-4" /> Book Seat
                </button>}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  MAIN DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export default function StudentShuttleDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [dark, setDark]               = useState(false);
  const [tab, setTab]                 = useState('schedules');
  const [toast, setToast]             = useState(null);
  const [loading, setLoading]         = useState(false);
  const [search, setSearch]           = useState('');
  const [schedules, setSchedules]     = useState([]);
  const [myBookings, setMyBookings]   = useState([]);
  const [takenSeats, setTakenSeats]   = useState([]);
  const [bookingSchedule, setBookingSchedule] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [confirming, setConfirming]   = useState(false);
  const [is3DVisible, setIs3DVisible] = useState(false);
  const prevBookingsRef               = useRef([]);
  const [newlyConfirmed, setNewlyConfirmed] = useState([]);

  const showToast = (msg, type = 'success') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };
  const fetchSchedules  = async () => { try { const r = await axios.get('/shuttles/schedules'); setSchedules(r.data); } catch {} };
  const fetchMyBookings = async () => {
    try {
      const r = await axios.get('/shuttles/my-bookings'); const fresh = r.data || [];
      const prev = prevBookingsRef.current;
      const just = fresh.filter(b => { const o = prev.find(p => p._id === b._id); return o && o.paymentStatus === 'Pending' && b.paymentStatus === 'Confirmed'; });
      if (just.length) { just.forEach(b => showToast(`Booking for ${b.scheduleId?.routeId?.routeName || 'your trip'} confirmed!`)); setNewlyConfirmed(p => [...p, ...just.map(b => b._id)]); }
      prevBookingsRef.current = fresh; setMyBookings(fresh);
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
    if (!search) return true; const q = search.toLowerCase();
    return s.routeId?.routeName?.toLowerCase().includes(q) || s.routeId?.startPoint?.toLowerCase().includes(q) || s.routeId?.endPoint?.toLowerCase().includes(q) || s.busId?.plateNumber?.toLowerCase().includes(q);
  });

  const myBookedIds    = myBookings.map(b => b.scheduleId?._id).filter(Boolean);
  const pendingCount   = myBookings.filter(b => b.paymentStatus === 'Pending').length;
  const confirmedCount = myBookings.filter(b => b.paymentStatus === 'Confirmed').length;
  const D = dark;
  const bg       = D ? 'bg-gray-950' : 'bg-[#F5F7FA]';
  const surface  = D ? 'bg-gray-900' : 'bg-white';
  const border   = D ? 'border-white/10' : 'border-[#E0E4EB]';
  const text     = D ? 'text-white' : 'text-gray-900';
  const muted    = 'text-[#6B7280]';
  const inputCls = D
    ? 'bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-[#1B4D89]/60 focus:ring-2 focus:ring-[#1B4D89]/20'
    : 'bg-[#F5F7FA] border-[#E0E4EB] text-gray-900 placeholder-[#6B7280] focus:border-[#1B4D89] focus:ring-2 focus:ring-[#1B4D89]/20';
  const closeModal = () => { setBookingSchedule(null); setSelectedSeat(null); setConfirming(false); setIs3DVisible(false); };

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`}>
      <style>{`
        * { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, Arial, sans-serif; }
        @keyframes toast-in { from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)} }
        .animate-toast { animation: toast-in 0.3s cubic-bezier(.22,1,.36,1); }
        @keyframes fade-up { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fade-up 0.45s cubic-bezier(.22,1,.36,1) both; }
        .d1{animation-delay:.04s}.d2{animation-delay:.08s}.d3{animation-delay:.12s}.d4{animation-delay:.16s}.d5{animation-delay:.20s}.d6{animation-delay:.24s}
        @keyframes confirmed-pulse { 0%{box-shadow:0 0 0 0 rgba(52,211,153,.4)}70%{box-shadow:0 0 0 12px rgba(52,211,153,0)}100%{box-shadow:0 0 0 0 rgba(52,211,153,0)} }
        .confirmed-glow { animation: confirmed-pulse 1.5s ease-out 2; }
        ::-webkit-scrollbar{width:5px}::-webkit-scrollbar-thumb{background:linear-gradient(135deg,#2A5F9E,#143A6B);border-radius:10px}
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      <StudentTopNav dark={dark} onToggleDark={() => setDark(!dark)} onLogout={logout} user={user} role="student" />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-3xl p-8 fade-up" style={{ background: 'linear-gradient(135deg,#1B4D89 0%,#2A5F9E 40%,#143A6B 100%)' }}>
          <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}</p>
              <h1 className="text-white text-3xl font-black mb-1">{user.name?.split(' ')[0] || 'Student'}</h1>
              <p className="text-white/50 text-sm">Find your bus, pick your seat, travel smart.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {[{ v: schedules.length, l: 'Available' }, { v: myBookings.length, l: 'My Trips' }, { v: schedules.reduce((a, s) => a + s.availableSeats, 0), l: 'Free Seats' }].map(s => (
                <div key={s.l} className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/10 min-w-[80px]">
                  <p className="text-3xl font-black text-white">{s.v}</p>
                  <p className="text-white/50 text-[11px] font-semibold mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {myBookings.length > 0 && (
          <div className={`flex items-center gap-4 flex-wrap p-4 rounded-2xl border ${surface} ${border}`}>
            <Ic d={I.bell} className="w-4 h-4 text-[#1B4D89] shrink-0" />
            <span className={`text-sm font-semibold ${text}`}>Booking Status</span>
            <div className="flex gap-3 flex-wrap">
              {pendingCount > 0 && <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#FF6B35]/10 text-[#FF6B35] border border-[#FF6B35]/20">{pendingCount} Pending</span>}
              {confirmedCount > 0 && <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-400/20"><Ic d={I.mail} className="w-3.5 h-3.5" />{confirmedCount} Confirmed</span>}
            </div>
            <span className={`ml-auto text-[11px] ${muted}`}>Auto-refreshes every 30s</span>
          </div>
        )}

        <div className={`flex gap-1.5 p-1.5 rounded-2xl border w-fit ${surface} ${border}`}>
          {[{ id: 'schedules', label: 'Find a Bus', icon: I.bus }, { id: 'bookings', label: 'My Bookings', icon: I.ticket }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${tab === t.id ? 'bg-gradient-to-r from-[#1B4D89] to-[#2A5F9E] text-white shadow-lg shadow-[#1B4D89]/25' : `${muted} hover:text-white`}`}>
              <Ic d={t.icon} className="w-4 h-4" />{t.label}
              {t.id === 'bookings' && myBookings.length > 0 && <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-white/20 text-white' : 'bg-[#1B4D89]/20 text-[#1B4D89]'}`}>{myBookings.length}</span>}
              {t.id === 'bookings' && pendingCount > 0 && tab !== 'bookings' && <span className="w-2 h-2 rounded-full bg-[#FF6B35] animate-pulse" />}
            </button>
          ))}
        </div>

        {tab === 'schedules' && (
          <div className="fade-up space-y-6">
            <div className="relative">
              <Ic d={I.search} className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${muted}`} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by route, destination or bus plate..."
                className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border text-sm outline-none transition-all ${inputCls}`} />
            </div>
            {filteredSchedules.length === 0
              ? <div className={`rounded-2xl border ${surface} ${border} py-20 text-center`}><Ic d={I.bus} className={`w-12 h-12 mx-auto mb-3 ${muted}`} /><p className={`font-bold ${text}`}>No buses found</p></div>
              : <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {filteredSchedules.map((s, i) => <div key={s._id} className={`fade-up d${Math.min(i + 1, 6)}`}><ScheduleCard schedule={s} onBook={openBooking} hasBooked={myBookedIds.includes(s._id)} dark={dark} /></div>)}
                </div>}
          </div>
        )}

        {tab === 'bookings' && (
          <div className="fade-up space-y-5">
            <div><h2 className={`text-xl font-extrabold ${text}`}>My Bookings</h2><p className={`text-sm ${muted}`}>{myBookings.length} reservation{myBookings.length !== 1 ? 's' : ''}</p></div>
            {myBookings.length === 0
              ? <div className={`rounded-2xl border ${surface} ${border} py-20 text-center`}>
                  <Ic d={I.ticket} className={`w-12 h-12 mx-auto mb-3 ${muted}`} />
                  <p className={`font-bold ${text}`}>No bookings yet</p>
                  <button onClick={() => setTab('schedules')} className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#1B4D89] to-[#2A5F9E] text-white text-sm font-bold hover:opacity-90 transition-all">Find a Bus</button>
                </div>
              : <div className="space-y-4">
                  {myBookings.map((b, i) => {
                    const dep = new Date(b.scheduleId?.departureTime), gone = dep < new Date();
                    const isConfirmed = b.paymentStatus === 'Confirmed', isNew = newlyConfirmed.includes(b._id);
                    return (
                      <div key={b._id} className={`fade-up d${Math.min(i + 1, 6)} relative overflow-hidden rounded-2xl border p-5 ${surface} ${border} transition-all hover:shadow-xl ${isNew ? 'confirmed-glow' : ''}`}>
                        <div className={`absolute top-0 left-0 right-0 h-1 ${isConfirmed ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : 'bg-gradient-to-r from-[#FF6B35] to-[#F59E0B]'}`} />
                        <div className="flex items-start justify-between gap-4 flex-wrap pt-2">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg font-black text-xl text-white ${gone ? 'bg-gradient-to-br from-gray-600 to-gray-700' : isConfirmed ? 'bg-gradient-to-br from-emerald-500 to-teal-500' : 'bg-gradient-to-br from-[#1B4D89] to-[#2A5F9E]'}`}>{b.seatNumber}</div>
                            <div>
                              <p className={`font-extrabold text-base ${text}`}>{b.scheduleId?.routeId?.routeName || 'Route'}</p>
                              <p className={`text-xs font-semibold ${muted}`}>{b.scheduleId?.busId?.plateNumber} - Seat {b.seatNumber}</p>
                              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                <span className={`text-xs font-semibold flex items-center gap-1 ${muted}`}><Ic d={I.clock} className="w-3 h-3" />{dep.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                                <span className={`text-xs font-semibold flex items-center gap-1 ${muted}`}><Ic d={I.map} className="w-3 h-3" />{b.scheduleId?.routeId?.startPoint} → {b.scheduleId?.routeId?.endPoint}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-extrabold border ${isConfirmed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20' : 'bg-[#FF6B35]/10 text-[#FF6B35] border-[#FF6B35]/20'}`}>{isConfirmed ? 'Confirmed' : 'Pending'}</span>
                            {isConfirmed && <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400"><Ic d={I.mail} className="w-3 h-3" /> Email sent</span>}
                            {!isConfirmed && !gone && <span className={`text-[11px] font-semibold ${muted} text-right`}>Waiting for admin</span>}
                            {!gone && <button onClick={() => cancelBooking(b._id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-400/20 text-rose-400 text-xs font-bold transition-all"><Ic d={I.trash} className="w-3.5 h-3.5" /> Cancel</button>}
                            {gone && <span className={`text-xs font-semibold ${muted}`}>Completed</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>}
          </div>
        )}
      </main>

      {bookingSchedule && (
        <Modal onClose={closeModal} wide>
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-black text-xl text-white">{confirming ? 'Confirm Booking' : '3D Seat Selection'}</h2>
                <p className="text-sm mt-0.5 text-[#6B7280]">{bookingSchedule.routeId?.routeName} - {bookingSchedule.busId?.plateNumber}</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-white/10 text-[#6B7280] hover:text-white transition-all"><Ic d={I.close} className="w-5 h-5" /></button>
            </div>

            {!confirming ? (
              <>
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[
                    { icon: I.clock, val: new Date(bookingSchedule.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), sub: new Date(bookingSchedule.departureTime).toLocaleDateString(), label: 'Departure' },
                    { icon: I.map,   val: bookingSchedule.routeId?.startPoint, sub: `→ ${bookingSchedule.routeId?.endPoint}`, label: 'Route' },
                    { icon: I.seat,  val: `${bookingSchedule.availableSeats} seats`, sub: `of ${bookingSchedule.busId?.capacity} total`, label: 'Available' },
                  ].map(info => (
                    <div key={info.label} className="flex flex-col gap-1 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <div className="flex items-center gap-1.5 mb-0.5"><Ic d={info.icon} className="w-3.5 h-3.5 text-[#2A5F9E]" /><span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">{info.label}</span></div>
                      <p className="text-sm font-black text-white leading-none">{info.val}</p>
                      <p className="text-[11px] text-[#6B7280] font-semibold">{info.sub}</p>
                    </div>
                  ))}
                  <div className="flex flex-col gap-1 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Legend</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {[['bg-blue-700', 'Free'], ['bg-red-700', 'Booked'], ['bg-cyan-500', 'Selected']].map(([c, l]) => (
                        <div key={l} className="flex items-center gap-1"><div className={`w-3 h-3 rounded ${c}`} /><span className="text-[9px] text-[#6B7280]">{l}</span></div>
                      ))}
                    </div>
                  </div>
                </div>

                {is3DVisible
                  ? <Advanced3DSeatMap capacity={bookingSchedule.busId?.capacity || 40} takenSeats={takenSeats} selectedSeat={selectedSeat} onSelect={setSelectedSeat} isVisible={is3DVisible} />
                  : <div className="w-full h-[590px] rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 flex items-center justify-center">
                      <div className="text-center"><div className="w-14 h-14 border-4 border-[#1B4D89] border-t-transparent rounded-full animate-spin mx-auto mb-4" /><p className="text-[#6B7280] font-medium">Loading 3D Seat Map…</p></div>
                    </div>}

                <div className="mt-4 flex justify-center gap-6 text-xs text-[#6B7280]">
                  <span><strong className="text-white">Drag</strong> to rotate</span>
                  <span><strong className="text-white">Scroll</strong> to zoom</span>
                  <span><strong className="text-white">Click</strong> blue seat to select</span>
                </div>

                {selectedSeat && (
                  <div className="mt-4 p-4 rounded-xl bg-cyan-500/10 border border-cyan-400/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center text-white font-black text-lg">{selectedSeat}</div>
                      <div><p className="text-cyan-400 font-bold">Seat {selectedSeat} Selected</p><p className="text-xs text-[#6B7280]">Click a different seat to change</p></div>
                    </div>
                    <Ic d={I.check} className="w-5 h-5 text-cyan-400" />
                  </div>
                )}

                <div className="mt-6 flex gap-3">
                  <button onClick={closeModal} className="flex-1 py-3.5 rounded-xl font-bold text-sm text-[#6B7280] hover:bg-white/5 transition-all" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>Cancel</button>
                  <button onClick={() => { if (!selectedSeat) return showToast('Please select a seat first', 'error'); setConfirming(true); }} disabled={!selectedSeat}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-[#1B4D89] to-[#2A5F9E] text-white font-bold text-sm shadow-lg hover:opacity-90 transition-all disabled:opacity-30">
                    {selectedSeat ? `Continue with Seat ${selectedSeat} →` : 'Select a seat first'}
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-5">
                <div className="relative overflow-hidden rounded-3xl p-6" style={{ background: 'linear-gradient(135deg,#1B4D89,#2A5F9E,#143A6B)' }}>
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
                  <div className="relative flex items-start justify-between mb-4">
                    <div><p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">SLIIT Shuttle</p><p className="text-white font-black text-2xl">{bookingSchedule.routeId?.routeName}</p></div>
                    <div className="text-right"><p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Seat</p><p className="text-white font-black text-5xl leading-none">{selectedSeat}</p></div>
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
                    {loading ? 'Booking…' : <><Ic d={I.check} className="w-4 h-4" />Confirm Booking</>}
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