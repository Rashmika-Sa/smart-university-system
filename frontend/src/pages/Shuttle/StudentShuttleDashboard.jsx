import React, { useState, useEffect, useRef } from 'react';
import axios from '../../api/axios';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import StudentTopNav from '../../components/StudentTopNav';

const Advanced3DSeatMap = ({ capacity, takenSeats, selectedSeat, onSelect, isVisible }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const seatMeshesRef = useRef(new Map());
  const raycasterRef = useRef(null);
  const animationRef = useRef(null);
  const initializedRef = useRef(false);

  const rows = Math.ceil(capacity / 4);
  const seatXPositions = [-2.3, -0.85, 0.85, 2.3];
  const seatZStart = -2.8;
  const seatZSpacing = 1.15;

  useEffect(() => {
    if (!isVisible || !containerRef.current) return;
    const timer = setTimeout(() => {
      if (!initializedRef.current && containerRef.current) {
        initThree(); createBusInterior(); createSeats(); addLights(); animate();
        initializedRef.current = true;
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (controlsRef.current) controlsRef.current.dispose();
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (rendererRef.current.domElement && containerRef.current) {
          try { containerRef.current.removeChild(rendererRef.current.domElement); } catch (e) {}
        }
      }
      initializedRef.current = false;
    };
  }, []);

  useEffect(() => { if (initializedRef.current) updateSeatMaterials(); }, [takenSeats, selectedSeat]);

  const initThree = () => {
    const container = containerRef.current;
    const width = container.clientWidth, height = container.clientHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f1119);
    scene.fog = new THREE.FogExp2(0x0f1119, 0.006);
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    camera.position.set(5, 5, 8); camera.lookAt(0, 0.4, 0);
    cameraRef.current = camera;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    controlsRef.current = new OrbitControls(camera, renderer.domElement);
    Object.assign(controlsRef.current, { enableDamping:true, dampingFactor:0.05, rotateSpeed:1.2, zoomSpeed:1.2, enableZoom:true, enablePan:true, maxPolarAngle:Math.PI/2.2, minDistance:3.5, maxDistance:12 });
    controlsRef.current.target.set(0, 0.5, 0);
    raycasterRef.current = new THREE.Raycaster();
    window.addEventListener('resize', handleResize);
  };

  const createBusInterior = () => {
    const scene = sceneRef.current;
    const add = (geo, mat, pos, rot) => { const m = new THREE.Mesh(geo, mat); if(pos) m.position.set(...pos); if(rot) { m.rotation.x=rot[0]||0; m.rotation.y=rot[1]||0; m.rotation.z=rot[2]||0; } m.castShadow=true; m.receiveShadow=true; scene.add(m); return m; };
    add(new THREE.PlaneGeometry(8.8,8.5), new THREE.MeshStandardMaterial({color:0x2a2f3f,roughness:0.4,metalness:0.3}), [0,-0.35,0], [-Math.PI/2,0,0]);
    add(new THREE.BoxGeometry(1.7,0.05,7.8), new THREE.MeshStandardMaterial({color:0x7c3aed,roughness:0.3,emissive:0x4c1d95,emissiveIntensity:0.1}), [0,-0.3,0]);
    const wallMat = new THREE.MeshStandardMaterial({color:0x4a5568,metalness:0.2,roughness:0.6});
    add(new THREE.BoxGeometry(0.15,0.8,8.5), wallMat, [-2.95,0.25,0]);
    add(new THREE.BoxGeometry(0.15,0.8,8.5), wallMat, [2.95,0.25,0]);
    const frameMat = new THREE.MeshStandardMaterial({color:0xcbd5e1,metalness:0.5});
    for(let i=-3;i<=3;i+=1.4) { add(new THREE.BoxGeometry(0.08,0.55,1.1),frameMat,[-2.9,0.65,i]); add(new THREE.BoxGeometry(0.08,0.55,1.1),frameMat,[2.9,0.65,i]); }
    const ledMat = new THREE.MeshStandardMaterial({color:0xffaa66,emissive:0xffaa66,emissiveIntensity:0.5});
    add(new THREE.BoxGeometry(0.08,0.08,7.5),ledMat,[-2.88,1.0,0]);
    add(new THREE.BoxGeometry(0.08,0.08,7.5),ledMat,[2.88,1.0,0]);
    add(new THREE.BoxGeometry(2.2,0.4,1.2),new THREE.MeshStandardMaterial({color:0x334155,metalness:0.5}),[-2.0,0.45,-3.9]);
    const sw = new THREE.Mesh(new THREE.TorusGeometry(0.42,0.07,24,48),new THREE.MeshStandardMaterial({color:0x4b5563,metalness:0.8}));
    sw.rotation.x=Math.PI/2; sw.rotation.z=Math.PI/2; sw.position.set(-2.0,0.75,-3.85); scene.add(sw);
    add(new THREE.BoxGeometry(7.2,1.4,0.1),new THREE.MeshStandardMaterial({color:0x1e293b}),[0,0.6,4.3]);
  };

  const createPerson = () => {
    const g = new THREE.Group();
    const bm = new THREE.MeshStandardMaterial({color:0x3b82f6,roughness:0.3});
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.24,0.22,0.48,8),bm); body.position.y=0.24; body.castShadow=true; g.add(body);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2,24,24),new THREE.MeshStandardMaterial({color:0xfcd34d,roughness:0.2})); head.position.y=0.52; head.castShadow=true; g.add(head);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.21,8,8),new THREE.MeshStandardMaterial({color:0x4b5563})); hair.position.y=0.66; hair.scale.set(1,0.35,1); g.add(hair);
    const am = new THREE.MeshStandardMaterial({color:0x3b82f6});
    const la = new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,0.4,6),am); la.position.set(-0.28,0.35,0); la.rotation.z=0.35; la.rotation.x=0.2; la.castShadow=true; g.add(la);
    const ra = new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.09,0.4,6),am); ra.position.set(0.28,0.35,0); ra.rotation.z=-0.35; ra.rotation.x=-0.2; ra.castShadow=true; g.add(ra);
    return g;
  };

  const createSeats = () => {
    const scene = sceneRef.current;
    for(let row=0;row<rows;row++) {
      const zPos = seatZStart + row*seatZSpacing;
      for(let sp=0;sp<4;sp++) {
        const sn = row*4+sp+1; if(sn>capacity) continue;
        const xPos=seatXPositions[sp], isLeft=sp<2;
        const isTaken=takenSeats?.includes(sn), isSel=selectedSeat===sn;
        const cc=isTaken?0xb91c1c:isSel?0x22d3ee:0x60a5fa;
        const bc=isTaken?0x7f1a1a:isSel?0x0891b2:0x2563eb;
        const sg=new THREE.Group();
        const cush=new THREE.Mesh(new THREE.BoxGeometry(0.82,0.14,0.78),new THREE.MeshStandardMaterial({color:cc,roughness:0.3})); cush.castShadow=true; cush.receiveShadow=true; sg.add(cush);
        const bo=isLeft?-0.4:0.4;
        const back=new THREE.Mesh(new THREE.BoxGeometry(0.8,0.6,0.12),new THREE.MeshStandardMaterial({color:bc,roughness:0.25})); back.position.set(0,0.36,bo); back.castShadow=true; sg.add(back);
        const hr=new THREE.Mesh(new THREE.BoxGeometry(0.55,0.1,0.1),new THREE.MeshStandardMaterial({color:0xf59e0b,emissive:isSel?0xf59e0b:0,emissiveIntensity:isSel?0.3:0})); hr.position.set(0,0.66,bo); sg.add(hr);
        sg.position.set(xPos,-0.22,zPos); sg.userData={seatNumber:sn,isTaken}; scene.add(sg);
        let person=null;
        if(isTaken) { person=createPerson(); person.position.set(xPos,-0.1,zPos+(isLeft?0.1:-0.1)); person.scale.set(0.85,0.85,0.85); scene.add(person); }
        seatMeshesRef.current.set(sn,{group:sg,cushion:cush,back,headrest:hr,person,seatNumber:sn,isTaken});
        addSeatNumberLabel(sn,xPos,zPos,isTaken,isSel);
        if(isSel&&!isTaken) addGlowRing(xPos,zPos,sn);
      }
    }
    addRowNumbers();
  };

  const addGlowRing = (x,z,sn) => {
    const ring=new THREE.Mesh(new THREE.TorusGeometry(0.62,0.06,32,64),new THREE.MeshStandardMaterial({color:0x22d3ee,emissive:0x22d3ee,emissiveIntensity:1.2}));
    ring.position.set(x,-0.12,z); ring.rotation.x=Math.PI/2; sceneRef.current.add(ring);
    if(seatMeshesRef.current.has(sn)) seatMeshesRef.current.get(sn).ring=ring;
  };

  const addSeatNumberLabel = (sn,x,z,isTaken,isSel) => {
    const canvas=document.createElement('canvas'); canvas.width=128; canvas.height=128;
    const ctx=canvas.getContext('2d');
    ctx.shadowBlur=4; ctx.shadowColor='rgba(0,0,0,0.5)';
    ctx.beginPath(); ctx.arc(64,64,34,0,2*Math.PI); ctx.fillStyle=isTaken?'#991b1b':isSel?'#0891b2':'#1e40af'; ctx.fill();
    ctx.shadowBlur=0; ctx.beginPath(); ctx.arc(64,64,30,0,2*Math.PI); ctx.fillStyle=isTaken?'#dc2626':isSel?'#06b6d4':'#3b82f6'; ctx.fill();
    ctx.fillStyle='#fff'; ctx.font='Bold 48px "DM Sans"'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(sn.toString(),64,64);
    const tex=new THREE.CanvasTexture(canvas);
    const plane=new THREE.Mesh(new THREE.PlaneGeometry(0.52,0.52),new THREE.MeshStandardMaterial({map:tex,side:THREE.DoubleSide,emissive:isSel?0x22d3ee:0,emissiveIntensity:isSel?0.4:0}));
    plane.position.set(x,0.18,z); plane.rotation.y=Math.PI/2; sceneRef.current.add(plane);
    if(seatMeshesRef.current.has(sn)) { seatMeshesRef.current.get(sn).label=plane; seatMeshesRef.current.get(sn).labelTexture=tex; }
  };

  const addRowNumbers = () => {
    for(let row=0;row<rows;row++) {
      const zPos=seatZStart+row*seatZSpacing;
      const canvas=document.createElement('canvas'); canvas.width=220; canvas.height=100;
      const ctx=canvas.getContext('2d');
      const g=ctx.createLinearGradient(0,0,220,0); g.addColorStop(0,'#7c3aed'); g.addColorStop(1,'#a855f7');
      ctx.fillStyle=g; ctx.fillRect(0,0,220,100);
      ctx.fillStyle='#fff'; ctx.font='Bold 40px "DM Sans"'; ctx.textAlign='center'; ctx.fillText(`Row ${row+1}`,110,60);
      const tex=new THREE.CanvasTexture(canvas);
      const plane=new THREE.Mesh(new THREE.PlaneGeometry(1.2,0.55),new THREE.MeshStandardMaterial({map:tex,side:THREE.DoubleSide}));
      plane.position.set(-3.05,0.28,zPos); plane.rotation.y=Math.PI/8; sceneRef.current.add(plane);
    }
  };

  const addLights = () => {
    const s=sceneRef.current;
    s.add(new THREE.AmbientLight(0x404060,0.75));
    const ml=new THREE.DirectionalLight(0xfff5e6,1.3); ml.position.set(3,6,2); ml.castShadow=true; ml.shadow.mapSize.width=ml.shadow.mapSize.height=1024; s.add(ml);
    [[0x8b5cf6,0.5,[0,1,2.5]],[0x06b6d4,0.45,[0,1.2,-3.2]],[0xffaa66,0.4,[-2.5,1,0]],[0xffaa66,0.4,[2.5,1,0]]].forEach(([c,i,p])=>{ const l=new THREE.PointLight(c,i); l.position.set(...p); s.add(l); });
  };

  const updateSeatMaterials = () => {
    seatMeshesRef.current.forEach((group,sn) => {
      const isTaken=takenSeats?.includes(sn), isSel=selectedSeat===sn;
      if(group.cushion) group.cushion.material.color.setHex(isTaken?0xb91c1c:isSel?0x22d3ee:0x60a5fa);
      if(group.back) group.back.material.color.setHex(isTaken?0x7f1a1a:isSel?0x0891b2:0x2563eb);
      if(group.headrest) group.headrest.material.emissiveIntensity=isSel?0.4:0;
      if(isTaken&&!group.person) {
        const isLeft=sn%4<=2, xPos=seatXPositions[(sn-1)%4], zPos=seatZStart+Math.floor((sn-1)/4)*seatZSpacing;
        group.person=createPerson(); group.person.position.set(xPos,-0.1,zPos+(isLeft?0.1:-0.1)); group.person.scale.set(0.85,0.85,0.85); sceneRef.current.add(group.person);
      } else if(!isTaken&&group.person) { sceneRef.current.remove(group.person); group.person=null; }
      if(group.label&&group.labelTexture) {
        const canvas=group.labelTexture.image, ctx=canvas.getContext('2d');
        ctx.clearRect(0,0,128,128);
        ctx.beginPath(); ctx.arc(64,64,34,0,2*Math.PI); ctx.fillStyle=isTaken?'#991b1b':isSel?'#0891b2':'#1e40af'; ctx.fill();
        ctx.beginPath(); ctx.arc(64,64,30,0,2*Math.PI); ctx.fillStyle=isTaken?'#dc2626':isSel?'#06b6d4':'#3b82f6'; ctx.fill();
        ctx.fillStyle='#fff'; ctx.font='Bold 48px "DM Sans"'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText(sn.toString(),64,64);
        group.labelTexture.needsUpdate=true; group.label.material.emissiveIntensity=isSel?0.4:0;
      }
      if(group.ring) { sceneRef.current.remove(group.ring); delete group.ring; }
      if(isSel&&!isTaken&&group.group) {
        const ring=new THREE.Mesh(new THREE.TorusGeometry(0.62,0.06,32,64),new THREE.MeshStandardMaterial({color:0x22d3ee,emissive:0x22d3ee,emissiveIntensity:1.2}));
        ring.position.copy(group.group.position); ring.position.y=-0.12; ring.rotation.x=Math.PI/2; sceneRef.current.add(ring); group.ring=ring;
      }
    });
  };

  const handleCanvasClick = (event) => {
    if(!containerRef.current||!raycasterRef.current||!cameraRef.current) return;
    const rect=containerRef.current.getBoundingClientRect();
    const mouse=new THREE.Vector2(((event.clientX-rect.left)/rect.width)*2-1, -((event.clientY-rect.top)/rect.height)*2+1);
    raycasterRef.current.setFromCamera(mouse,cameraRef.current);
    const objs=[]; seatMeshesRef.current.forEach(g=>{ if(g.group) objs.push(g.group); });
    const hits=raycasterRef.current.intersectObjects(objs,true);
    if(hits.length>0) {
      let h=hits[0].object;
      while(h.parent&&!h.parent.userData?.seatNumber&&h.parent!==sceneRef.current) h=h.parent;
      const sn=h.parent?.userData?.seatNumber||h.userData?.seatNumber;
      if(sn&&!takenSeats?.includes(sn)&&onSelect) onSelect(sn);
    }
  };

  const animate = () => { animationRef.current=requestAnimationFrame(animate); controlsRef.current?.update(); rendererRef.current?.render(sceneRef.current,cameraRef.current); };
  const handleResize = () => {
    if(!containerRef.current||!cameraRef.current||!rendererRef.current) return;
    const w=containerRef.current.clientWidth, h=containerRef.current.clientHeight;
    cameraRef.current.aspect=w/h; cameraRef.current.updateProjectionMatrix(); rendererRef.current.setSize(w,h);
  };

  return <div ref={containerRef} onClick={handleCanvasClick} style={{width:'100%',height:'560px',borderRadius:'24px',cursor:'grab',overflow:'hidden',boxShadow:'0 25px 45px -12px rgba(0,0,0,0.6)',background:'#0f1119'}} />;
};

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
  logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  sun:    'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z',
  moon:   'M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z',
  arrow:  'M13 7l5 5m0 0l-5 5m5-5H6',
  back:   'M11 17l-5-5m0 0l5-5m-5 5h12',
  info:   'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  refresh:'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15',
  mail:   'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  bell:   'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9',
};

const Toast = ({ msg, type, onClose }) => (
  <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border text-sm font-semibold animate-toast
    ${type==='success'?'bg-emerald-500/15 border-emerald-400/30 text-emerald-400':'bg-rose-500/15 border-rose-400/30 text-rose-400'}`}>
    <Ic d={type==='success'?I.check:I.close} className="w-4 h-4" />{msg}
    <button onClick={onClose}><Ic d={I.close} className="w-3.5 h-3.5 opacity-60 hover:opacity-100" /></button>
  </div>
);

const Modal = ({ onClose, children, wide=false }) => (
  <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-lg">
    <div className={`relative rounded-3xl shadow-2xl w-full border border-white/10 bg-[#0f1117] max-h-[92vh] overflow-y-auto ${wide?'max-w-5xl':'max-w-lg'}`}>
      {children}
    </div>
  </div>
);

const ScheduleCard = ({ schedule, onBook, hasBooked, dark }) => {
  const dep=new Date(schedule.departureTime);
  const mins=Math.round((dep-new Date())/60000);
  const soon=mins>0&&mins<60, gone=mins<0;
  const pct=Math.round(((schedule.busId?.capacity||30)-schedule.availableSeats)/(schedule.busId?.capacity||30)*100);
  return (
    <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl
      ${dark?'bg-gray-900 border-white/10 hover:border-violet-400/30':'bg-white border-gray-200 hover:border-violet-300 shadow-sm'}`}>
      <div className={`h-1 w-full ${gone?'bg-gray-500':soon?'bg-gradient-to-r from-amber-400 to-orange-500':'bg-gradient-to-r from-violet-500 to-cyan-500'}`} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-lg ${gone?'bg-gray-700':soon?'bg-gradient-to-br from-amber-400 to-orange-500':'bg-gradient-to-br from-violet-500 to-cyan-500'}`}>
              <Ic d={I.bus} className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className={`font-extrabold text-base ${dark?'text-white':'text-gray-900'}`}>{schedule.routeId?.routeName||'Route'}</p>
              <p className={`text-xs font-semibold ${dark?'text-slate-500':'text-gray-400'}`}>{schedule.busId?.plateNumber} · {schedule.busId?.model}</p>
            </div>
          </div>
          {soon&&!gone&&<span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/15 text-amber-400 border border-amber-400/20 animate-pulse">SOON</span>}
          {gone&&<span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-gray-500/15 text-gray-400 border border-gray-400/20">DEPARTED</span>}
        </div>
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-xl mb-4 text-xs font-semibold ${dark?'bg-white/5':'bg-gray-50'}`}>
          <div className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-400/30 shrink-0" />
          <span className={dark?'text-slate-300':'text-gray-600'}>{schedule.routeId?.startPoint}</span>
          <div className="flex-1 flex items-center gap-0.5">
            {[...Array(4)].map((_,i)=><div key={i} className={`flex-1 h-px ${dark?'bg-white/10':'bg-gray-200'}`}/>)}
            <Ic d={I.arrow} className="w-3 h-3 text-violet-400 shrink-0" />
          </div>
          <span className={dark?'text-slate-300':'text-gray-600'}>{schedule.routeId?.endPoint}</span>
          <div className="w-2 h-2 rounded-full bg-rose-400 ring-2 ring-rose-400/30 shrink-0" />
        </div>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {[
            { label:'Departure', val:dep.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}), sub:dep.toLocaleDateString() },
            { label:'Seats Left', val:schedule.availableSeats, sub:`of ${schedule.busId?.capacity||'?'} total`, color: schedule.availableSeats===0?'text-rose-400':schedule.availableSeats<5?'text-amber-400':dark?'text-white':'text-gray-900' },
          ].map(info=>(
            <div key={info.label} className={`rounded-xl p-3 ${dark?'bg-white/5':'bg-gray-50'}`}>
              <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${dark?'text-slate-500':'text-gray-400'}`}>{info.label}</p>
              <p className={`font-black text-sm ${info.color||( dark?'text-white':'text-gray-900')}`}>{info.val}</p>
              <p className={`text-[10px] ${dark?'text-slate-500':'text-gray-400'}`}>{info.sub}</p>
            </div>
          ))}
        </div>
        <div className="mb-4">
          <div className={`h-2 rounded-full overflow-hidden ${dark?'bg-white/10':'bg-gray-100'}`}>
            <div className={`h-full rounded-full transition-all duration-700 ${pct>80?'bg-gradient-to-r from-rose-400 to-rose-600':pct>50?'bg-gradient-to-r from-amber-400 to-orange-500':'bg-gradient-to-r from-emerald-400 to-teal-500'}`} style={{width:`${pct}%`}} />
          </div>
          <p className={`text-[10px] mt-1 font-semibold ${dark?'text-slate-500':'text-gray-400'}`}>{pct}% occupied</p>
        </div>
        {hasBooked ? <div className="w-full py-3 rounded-xl bg-emerald-500/10 border border-emerald-400/20 text-emerald-400 text-xs font-bold text-center">✓ Already Booked</div>
        : schedule.availableSeats===0 ? <div className="w-full py-3 rounded-xl bg-rose-500/10 border border-rose-400/20 text-rose-400 text-xs font-bold text-center">Fully Booked</div>
        : gone ? <div className="w-full py-3 rounded-xl bg-gray-500/10 border border-gray-400/20 text-gray-400 text-xs font-bold text-center">Already Departed</div>
        : <button onClick={()=>onBook(schedule)} className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 hover:from-violet-400 hover:to-cyan-400 text-white text-sm font-bold shadow-lg shadow-violet-500/25 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
            <Ic d={I.ticket} className="w-4 h-4" /> Book Seat
          </button>}
      </div>
    </div>
  );
};

export default function StudentShuttleDashboard() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [dark, setDark] = useState(false);
  const [tab, setTab] = useState('schedules');
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [takenSeats, setTakenSeats] = useState([]);
  const [bookingSchedule, setBookingSchedule] = useState(null);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [is3DVisible, setIs3DVisible] = useState(false);
  const prevBookingsRef = useRef([]);
  const [newlyConfirmed, setNewlyConfirmed] = useState([]);

  const showToast = (msg, type='success') => { setToast({msg,type}); setTimeout(()=>setToast(null),4000); };
  const fetchSchedules = async () => { try { const r=await axios.get('/shuttles/schedules'); setSchedules(r.data); } catch {} };
  const fetchMyBookings = async () => {
    try {
      const r=await axios.get('/shuttles/my-bookings'); const fresh=r.data||[];
      const prev=prevBookingsRef.current;
      const just=fresh.filter(b=>{ const o=prev.find(p=>p._id===b._id); return o&&o.paymentStatus==='Pending'&&b.paymentStatus==='Confirmed'; });
      if(just.length>0) { just.forEach(b=>showToast(`🎉 Booking for ${b.scheduleId?.routeId?.routeName||'your trip'} confirmed! Check your email.`)); setNewlyConfirmed(p=>[...p,...just.map(b=>b._id)]); }
      prevBookingsRef.current=fresh; setMyBookings(fresh);
    } catch {}
  };
  const fetchTakenSeats = async id => { try { const r=await axios.get(`/shuttles/seats/${id}`); setTakenSeats(r.data.takenSeats||[]); } catch { setTakenSeats([]); } };

  useEffect(() => { fetchSchedules(); fetchMyBookings(); const i=setInterval(()=>fetchMyBookings(),30000); return ()=>clearInterval(i); }, []);

  const openBooking = async schedule => {
    setBookingSchedule(schedule); setSelectedSeat(null); setConfirming(false); setIs3DVisible(false);
    await fetchTakenSeats(schedule._id);
    setTimeout(()=>setIs3DVisible(true),150);
  };

  const handleConfirmBook = async () => {
    if(!selectedSeat) return showToast('Please select a seat first','error');
    setLoading(true);
    try {
      await axios.post('/shuttles/reserve',{scheduleId:bookingSchedule._id,seatNumber:selectedSeat});
      showToast(`🎉 Seat ${selectedSeat} booked! Waiting for admin confirmation.`);
      setBookingSchedule(null); setSelectedSeat(null); setConfirming(false); setIs3DVisible(false);
      fetchSchedules(); fetchMyBookings();
    } catch(err) { showToast(err.response?.data?.msg||'Booking failed','error'); }
    setLoading(false);
  };

  const cancelBooking = async id => {
    if(!window.confirm('Cancel this booking?')) return;
    try { await axios.delete(`/shuttles/cancel/${id}`); showToast('Booking cancelled'); fetchMyBookings(); fetchSchedules(); }
    catch(err) { showToast(err.response?.data?.msg||'Error','error'); }
  };

  const logout = () => { localStorage.clear(); window.location.href='/login'; };
  const filteredSchedules = schedules.filter(s => {
    if(!search) return true; const q=search.toLowerCase();
    return s.routeId?.routeName?.toLowerCase().includes(q)||s.routeId?.startPoint?.toLowerCase().includes(q)||s.routeId?.endPoint?.toLowerCase().includes(q)||s.busId?.plateNumber?.toLowerCase().includes(q);
  });

  const myBookedIds=myBookings.map(b=>b.scheduleId?._id).filter(Boolean);
  const pendingCount=myBookings.filter(b=>b.paymentStatus==='Pending').length;
  const confirmedCount=myBookings.filter(b=>b.paymentStatus==='Confirmed').length;

  const D=dark;
  const bg=D?'bg-gray-950':'bg-slate-50';
  const surface=D?'bg-gray-900':'bg-white';
  const border=D?'border-white/10':'border-gray-200';
  const text=D?'text-white':'text-gray-900';
  const muted=D?'text-gray-500':'text-gray-400';
  const inputCls=D?'bg-white/5 border-white/10 text-white placeholder-gray-600 focus:border-violet-400/60 focus:ring-2 focus:ring-violet-400/20':'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20';

  const closeModal = () => { setBookingSchedule(null); setSelectedSeat(null); setConfirming(false); setIs3DVisible(false); };

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800;900&family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        h1,h2,h3,.font-display { font-family: 'Syne', sans-serif; }
        @keyframes toast-in { from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)} }
        .animate-toast { animation: toast-in 0.3s cubic-bezier(.22,1,.36,1); }
        @keyframes fade-up { from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)} }
        .fade-up { animation: fade-up 0.45s cubic-bezier(.22,1,.36,1) both; }
        .d1{animation-delay:.04s}.d2{animation-delay:.08s}.d3{animation-delay:.12s}.d4{animation-delay:.16s}.d5{animation-delay:.20s}.d6{animation-delay:.24s}
        @keyframes confirmed-pulse { 0%{box-shadow:0 0 0 0 rgba(52,211,153,0.4)}70%{box-shadow:0 0 0 12px rgba(52,211,153,0)}100%{box-shadow:0 0 0 0 rgba(52,211,153,0)} }
        .confirmed-glow { animation: confirmed-pulse 1.5s ease-out 2; }
        ::-webkit-scrollbar{width:5px}
        ::-webkit-scrollbar-thumb{background:linear-gradient(135deg,#7c3aed,#0891b2);border-radius:10px}
      `}</style>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}

      {/* SHARED HEADER */}
      <StudentTopNav dark={dark} onToggleDark={()=>setDark(!dark)} onLogout={logout} user={user} role="student" />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-3xl p-8 fade-up" style={{background:'linear-gradient(135deg,#4f46e5 0%,#7c3aed 40%,#0891b2 100%)'}}>
          <div className="absolute inset-0 opacity-[0.07]" style={{backgroundImage:"url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")"}} />
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <p className="text-white/60 text-xs font-bold uppercase tracking-widest mb-1">Good {new Date().getHours()<12?'Morning':new Date().getHours()<18?'Afternoon':'Evening'}</p>
              <h1 className="font-display text-white text-3xl font-black mb-1">{user.name?.split(' ')[0]||'Student'} 👋</h1>
              <p className="text-white/50 text-sm">Find your bus, pick your seat, travel smart.</p>
            </div>
            <div className="flex gap-3 flex-wrap">
              {[{v:schedules.length,l:'Available'},{v:myBookings.length,l:'My Trips'},{v:schedules.reduce((a,s)=>a+s.availableSeats,0),l:'Free Seats'}].map(s=>(
                <div key={s.l} className="bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/10 min-w-[80px]">
                  <p className="text-3xl font-display font-black text-white">{s.v}</p>
                  <p className="text-white/50 text-[11px] font-semibold mt-0.5">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Status bar */}
        {myBookings.length>0&&(
          <div className={`flex items-center gap-4 flex-wrap p-4 rounded-2xl border ${surface} ${border}`}>
            <Ic d={I.bell} className="w-4 h-4 text-violet-400 shrink-0" />
            <span className={`text-sm font-semibold ${text}`}>Booking Status</span>
            <div className="flex gap-3 flex-wrap">
              {pendingCount>0&&<span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-400/20">⏳ {pendingCount} Pending</span>}
              {confirmedCount>0&&<span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-400/20"><Ic d={I.mail} className="w-3.5 h-3.5" /> {confirmedCount} Confirmed</span>}
            </div>
            <span className={`ml-auto text-[11px] ${muted}`}>Auto-refreshes every 30s</span>
          </div>
        )}

        {/* TABS */}
        <div className={`flex gap-1.5 p-1.5 rounded-2xl border w-fit ${surface} ${border}`}>
          {[{id:'schedules',label:'Find a Bus',icon:I.bus},{id:'bookings',label:'My Bookings',icon:I.ticket}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${tab===t.id?'bg-gradient-to-r from-violet-500 to-cyan-500 text-white shadow-lg shadow-violet-500/25':`${muted} hover:${text}`}`}>
              <Ic d={t.icon} className="w-4 h-4" />{t.label}
              {t.id==='bookings'&&myBookings.length>0&&<span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${tab===t.id?'bg-white/20 text-white':'bg-violet-500/20 text-violet-400'}`}>{myBookings.length}</span>}
              {t.id==='bookings'&&pendingCount>0&&tab!=='bookings'&&<span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
            </button>
          ))}
        </div>

        {/* FIND A BUS */}
        {tab==='schedules'&&(
          <div className="fade-up space-y-6">
            <div className="relative">
              <Ic d={I.search} className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${muted}`} />
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by route, destination or bus plate..."
                className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border text-sm outline-none transition-all ${inputCls}`} />
            </div>
            {filteredSchedules.length===0?(
              <div className={`rounded-2xl border ${surface} ${border} py-20 text-center`}>
                <Ic d={I.bus} className={`w-12 h-12 mx-auto mb-3 ${muted}`} /><p className={`font-bold ${text}`}>No buses found</p>
              </div>
            ):(
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {filteredSchedules.map((s,i)=>(
                  <div key={s._id} className={`fade-up d${Math.min(i+1,6)}`}>
                    <ScheduleCard schedule={s} onBook={openBooking} hasBooked={myBookedIds.includes(s._id)} dark={dark} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MY BOOKINGS */}
        {tab==='bookings'&&(
          <div className="fade-up space-y-5">
            <div><h2 className={`font-display text-xl font-extrabold ${text}`}>My Bookings</h2><p className={`text-sm ${muted}`}>{myBookings.length} reservation{myBookings.length!==1?'s':''}</p></div>
            {myBookings.length===0?(
              <div className={`rounded-2xl border ${surface} ${border} py-20 text-center`}>
                <Ic d={I.ticket} className={`w-12 h-12 mx-auto mb-3 ${muted}`} />
                <p className={`font-bold ${text}`}>No bookings yet</p>
                <button onClick={()=>setTab('schedules')} className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white text-sm font-bold hover:opacity-90 transition-all">Find a Bus</button>
              </div>
            ):(
              <div className="space-y-4">
                {myBookings.map((b,i)=>{
                  const dep=new Date(b.scheduleId?.departureTime), gone=dep<new Date();
                  const isConfirmed=b.paymentStatus==='Confirmed', isNew=newlyConfirmed.includes(b._id);
                  return (
                    <div key={b._id} className={`fade-up d${Math.min(i+1,6)} relative overflow-hidden rounded-2xl border p-5 ${surface} ${border} transition-all hover:shadow-xl ${isNew?'confirmed-glow':''}`}>
                      <div className={`absolute top-0 left-0 right-0 h-1 ${isConfirmed?'bg-gradient-to-r from-emerald-400 to-teal-500':'bg-gradient-to-r from-amber-400 to-orange-500'}`} />
                      <div className="flex items-start justify-between gap-4 flex-wrap pt-2">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg font-display font-black text-xl text-white ${gone?'bg-gradient-to-br from-gray-600 to-gray-700':isConfirmed?'bg-gradient-to-br from-emerald-500 to-teal-500':'bg-gradient-to-br from-violet-500 to-cyan-500'}`}>{b.seatNumber}</div>
                          <div>
                            <p className={`font-display font-extrabold text-base ${text}`}>{b.scheduleId?.routeId?.routeName||'Route'}</p>
                            <p className={`text-xs font-semibold ${muted}`}>{b.scheduleId?.busId?.plateNumber} · Seat {b.seatNumber}</p>
                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              <span className={`text-xs font-semibold flex items-center gap-1 ${muted}`}><Ic d={I.clock} className="w-3 h-3"/>{dep.toLocaleString([],{dateStyle:'medium',timeStyle:'short'})}</span>
                              <span className={`text-xs font-semibold flex items-center gap-1 ${muted}`}><Ic d={I.map} className="w-3 h-3"/>{b.scheduleId?.routeId?.startPoint} → {b.scheduleId?.routeId?.endPoint}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className={`px-3 py-1.5 rounded-full text-xs font-extrabold border ${isConfirmed?'bg-emerald-500/10 text-emerald-400 border-emerald-400/20':'bg-amber-500/10 text-amber-400 border-amber-400/20'}`}>{isConfirmed?'✓ Confirmed':'⏳ Pending'}</span>
                          {isConfirmed&&<span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400"><Ic d={I.mail} className="w-3 h-3"/> Email sent</span>}
                          {!isConfirmed&&!gone&&<span className={`text-[11px] font-semibold ${muted} text-right`}>Waiting for admin</span>}
                          {!gone&&<button onClick={()=>cancelBooking(b._id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-400/20 text-rose-400 text-xs font-bold transition-all"><Ic d={I.trash} className="w-3.5 h-3.5"/> Cancel</button>}
                          {gone&&<span className={`text-xs font-semibold ${muted}`}>Completed</span>}
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

      {/* BOOKING MODAL */}
      {bookingSchedule&&(
        <Modal onClose={closeModal} wide>
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-display font-black text-xl text-white">{confirming?'✅ Confirm Booking':'🎨 3D Seat Selection'}</h2>
                <p className="text-sm mt-0.5 text-gray-400">{bookingSchedule.routeId?.routeName} · {bookingSchedule.busId?.plateNumber}</p>
              </div>
              <button onClick={closeModal} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all"><Ic d={I.close} className="w-5 h-5"/></button>
            </div>
            {!confirming?(
              <>
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {[
                    {icon:I.clock,val:new Date(bookingSchedule.departureTime).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}),sub:new Date(bookingSchedule.departureTime).toLocaleDateString(),label:'Departure'},
                    {icon:I.map,val:bookingSchedule.routeId?.startPoint,sub:`→ ${bookingSchedule.routeId?.endPoint}`,label:'Route'},
                    {icon:I.seat,val:`${bookingSchedule.availableSeats} seats`,sub:`of ${bookingSchedule.busId?.capacity} total`,label:'Available'},
                  ].map(info=>(
                    <div key={info.label} className="flex flex-col gap-1 p-3 rounded-xl" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)'}}>
                      <div className="flex items-center gap-1.5 mb-0.5"><Ic d={info.icon} className="w-3.5 h-3.5 text-violet-400"/><span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{info.label}</span></div>
                      <p className="text-sm font-black text-white leading-none">{info.val}</p>
                      <p className="text-[11px] text-gray-500 font-semibold">{info.sub}</p>
                    </div>
                  ))}
                  <div className="flex flex-col gap-1 p-3 rounded-xl" style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.07)'}}>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Legend</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {[['bg-blue-500','Free'],['bg-red-700','Booked'],['bg-cyan-500','Selected']].map(([c,l])=>(
                        <div key={l} className="flex items-center gap-1"><div className={`w-3 h-3 rounded ${c}`}/><span className="text-[9px] text-gray-400">{l}</span></div>
                      ))}
                    </div>
                  </div>
                </div>
                {is3DVisible&&<Advanced3DSeatMap capacity={bookingSchedule.busId?.capacity||40} takenSeats={takenSeats} selectedSeat={selectedSeat} onSelect={setSelectedSeat} isVisible={is3DVisible}/>}
                {!is3DVisible&&(
                  <div className="w-full h-[560px] rounded-2xl bg-gradient-to-br from-gray-800/50 to-gray-900/50 flex items-center justify-center">
                    <div className="text-center"><div className="w-14 h-14 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"/><p className="text-gray-400 font-medium">Loading 3D Seat Map...</p></div>
                  </div>
                )}
                <div className="mt-4 flex justify-center gap-6 text-xs text-gray-500">
                  <span>🖱️ <strong className="text-white">Drag</strong> to rotate</span>
                  <span>📌 <strong className="text-white">Scroll</strong> to zoom</span>
                  <span>👆 <strong className="text-white">Click</strong> blue seat to select</span>
                </div>
                {selectedSeat&&(
                  <div className="mt-4 p-4 rounded-xl bg-cyan-500/15 border border-cyan-400/40 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500 flex items-center justify-center text-white font-black text-lg">{selectedSeat}</div>
                      <div><p className="text-cyan-400 font-bold">Seat {selectedSeat} Selected</p><p className="text-xs text-gray-400">Click different seat to change</p></div>
                    </div>
                    <Ic d={I.check} className="w-5 h-5 text-cyan-400"/>
                  </div>
                )}
                <div className="mt-6 flex gap-3">
                  <button onClick={closeModal} className="flex-1 py-3.5 rounded-xl font-bold text-sm text-gray-400 hover:bg-white/5 transition-all" style={{border:'1px solid rgba(255,255,255,0.08)'}}>Cancel</button>
                  <button onClick={()=>{ if(!selectedSeat) return showToast('Please select a seat first','error'); setConfirming(true); }} disabled={!selectedSeat}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-bold text-sm shadow-lg hover:opacity-90 transition-all disabled:opacity-30">
                    {selectedSeat?`Continue with Seat ${selectedSeat} →`:'Select a seat first'}
                  </button>
                </div>
              </>
            ):(
              <div className="space-y-5">
                <div className="relative overflow-hidden rounded-3xl p-6" style={{background:'linear-gradient(135deg,#4f46e5,#7c3aed,#0891b2)'}}>
                  <div className="absolute inset-0 opacity-10" style={{backgroundImage:'radial-gradient(circle, white 1px, transparent 1px)',backgroundSize:'20px 20px'}} />
                  <div className="relative flex items-start justify-between mb-4">
                    <div><p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">SLIIT Shuttle</p><p className="text-white font-display font-black text-2xl">{bookingSchedule.routeId?.routeName}</p></div>
                    <div className="text-right"><p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">Seat</p><p className="text-white font-display font-black text-5xl leading-none">{selectedSeat}</p></div>
                  </div>
                  <div className="h-px my-4" style={{backgroundImage:'repeating-linear-gradient(90deg,rgba(255,255,255,0.3) 0,rgba(255,255,255,0.3) 8px,transparent 8px,transparent 16px)'}} />
                  <div className="flex items-center justify-between text-xs mb-4">
                    <div><p className="text-white/50 font-semibold">FROM</p><p className="text-white font-bold text-sm">{bookingSchedule.routeId?.startPoint}</p></div>
                    <Ic d={I.arrow} className="w-5 h-5 text-white/40"/>
                    <div className="text-right"><p className="text-white/50 font-semibold">TO</p><p className="text-white font-bold text-sm">{bookingSchedule.routeId?.endPoint}</p></div>
                  </div>
                  <div className="flex gap-6 text-xs">
                    {[['BUS',bookingSchedule.busId?.plateNumber],['DEPARTS',new Date(bookingSchedule.departureTime).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})],['DATE',new Date(bookingSchedule.departureTime).toLocaleDateString()]].map(([l,v])=>(
                      <div key={l}><p className="text-white/50 font-semibold">{l}</p><p className="text-white font-bold">{v}</p></div>
                    ))}
                  </div>
                </div>
                <div className="p-4 rounded-xl flex items-start gap-3 bg-amber-500/10 border border-amber-400/20">
                  <Ic d={I.info} className="w-4 h-4 text-amber-400 shrink-0 mt-0.5"/>
                  <p className="text-xs text-amber-400/90">Your booking will be <strong>Pending</strong> until the admin confirms it. You'll receive a confirmation email.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={()=>setConfirming(false)} className="flex-1 py-3.5 rounded-xl text-gray-400 hover:bg-white/5 font-bold text-sm transition-all flex items-center justify-center gap-2" style={{border:'1px solid rgba(255,255,255,0.08)'}}>
                    <Ic d={I.back} className="w-4 h-4"/> Change Seat
                  </button>
                  <button onClick={handleConfirmBook} disabled={loading}
                    className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-sm shadow-lg hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading?'Booking…':<><Ic d={I.check} className="w-4 h-4"/>Confirm Booking</>}
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