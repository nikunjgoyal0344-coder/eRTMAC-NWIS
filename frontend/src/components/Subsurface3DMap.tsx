import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Compass,
  Layers,
  Target,
  Eye,
  Maximize2,
  Minimize2,
  AlertTriangle,
  MapPin
} from 'lucide-react';
import {
  WellSummary,
  FormationLayer,
  DrillingEvent,
  SurveyPoint
} from '../types';

interface Subsurface3DMapProps {
  wells: WellSummary[];
  formations: FormationLayer[];
  events: DrillingEvent[];
  trajectories: Record<string, SurveyPoint[]>;
  activeDepth: number;
  radiusKm: number;
  onRadiusChange: (r: number) => void;
  selectedWellId: string;
  onSelectWell: (wellId: string) => void;
  onSelectEvent?: (evt: DrillingEvent) => void;
}

export const Subsurface3DMap: React.FC<Subsurface3DMapProps> = ({
  wells,
  formations,
  events,
  trajectories,
  activeDepth,
  radiusKm,
  onRadiusChange,
  selectedWellId,
  onSelectWell,
  onSelectEvent
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [cameraPreset, setCameraPreset] = useState<'STRATA' | 'BIT_FOCUS' | 'SURFACE' | 'PROFILE'>('STRATA');
  const [showStrata, setShowStrata] = useState<boolean>(true);
  const [strataOpacity] = useState<number>(0.24);
  const [showDangerZone, setShowDangerZone] = useState<boolean>(true);
  const [showLookaheadSphere] = useState<boolean>(true);
  const [sceneLightMode, setSceneLightMode] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hoveredItem, setHoveredItem] = useState<{
    type: 'WELL' | 'EVENT';
    title: string;
    subtitle: string;
    details: string;
    severity?: string;
    wellId?: string;
    eventObj?: DrillingEvent;
  } | null>(null);

  const cameraStateRef = useRef({
    theta: 0.72,
    phi: 1.12,
    distance: 195,
    target: new THREE.Vector3(0, -34, 0)
  });

  const H_SCALE = 1 / 90;
  const V_SCALE = 1 / 50;

  const applyPreset = (preset: 'STRATA' | 'BIT_FOCUS' | 'SURFACE' | 'PROFILE') => {
    setCameraPreset(preset);
    if (preset === 'STRATA') {
      cameraStateRef.current = {
        theta: 0.68,
        phi: 1.15,
        distance: 195,
        target: new THREE.Vector3(0, -38, 0)
      };
    } else if (preset === 'BIT_FOCUS') {
      const bitY = -activeDepth * V_SCALE;
      cameraStateRef.current = {
        theta: 0.45,
        phi: 1.32,
        distance: 68,
        target: new THREE.Vector3(2, bitY, 2)
      };
    } else if (preset === 'SURFACE') {
      cameraStateRef.current = {
        theta: 0.0,
        phi: 0.18,
        distance: 230,
        target: new THREE.Vector3(0, 0, 0)
      };
    } else if (preset === 'PROFILE') {
      cameraStateRef.current = {
        theta: 1.57,
        phi: 1.52,
        distance: 185,
        target: new THREE.Vector3(0, -42, 0)
      };
    }
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 900;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    const bgHex = sceneLightMode ? 0xeef4ff : 0x0b1528;
    scene.background = new THREE.Color(bgHex);
    scene.fog = new THREE.FogExp2(bgHex, sceneLightMode ? 0.0011 : 0.0016);

    const camera = new THREE.PerspectiveCamera(48, width / height, 1, 1500);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, sceneLightMode ? 1.25 : 0.9);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 1.25);
    dirLight1.position.set(120, 180, 100);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xf59e0b, 0.85);
    dirLight2.position.set(-120, -90, -80);
    scene.add(dirLight2);

    const surfaceGrid = new THREE.GridHelper(
      320,
      32,
      sceneLightMode ? 0x2563eb : 0x3b82f6,
      sceneLightMode ? 0xcbd5e1 : 0x1e293b
    );
    surfaceGrid.position.y = 0;
    scene.add(surfaceGrid);

    const radiusUnits = (radiusKm * 1000) * H_SCALE;
    const ringGeo = new THREE.RingGeometry(Math.max(0.5, radiusUnits - 0.8), radiusUnits, 96);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x3b82f6,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const radiusRing = new THREE.Mesh(ringGeo, ringMat);
    radiusRing.rotation.x = Math.PI / 2;
    radiusRing.position.y = 0.2;
    scene.add(radiusRing);

    const cylDepth = 4200 * V_SCALE;
    const cylGeo = new THREE.CylinderGeometry(radiusUnits, radiusUnits, cylDepth, 64, 1, true);
    const cylMat = new THREE.MeshBasicMaterial({
      color: 0x2563eb,
      transparent: true,
      opacity: 0.06,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const radiusCylinder = new THREE.Mesh(cylGeo, cylMat);
    radiusCylinder.position.y = -cylDepth / 2;
    scene.add(radiusCylinder);

    if (showStrata) {
      formations.forEach((f) => {
        const topY = -f.top_depth * V_SCALE;
        const botY = -f.bottom_depth * V_SCALE;
        const thickness = Math.abs(topY - botY);
        const midY = (topY + botY) / 2;

        const slabGeo = new THREE.BoxGeometry(280, Math.max(0.5, thickness - 0.3), 280);
        const slabMat = new THREE.MeshPhongMaterial({
          color: new THREE.Color(f.color),
          transparent: true,
          opacity: f.name.includes('Barail') ? strataOpacity * 1.4 : strataOpacity * 0.7,
          depthWrite: false,
          side: THREE.DoubleSide
        });
        const slab = new THREE.Mesh(slabGeo, slabMat);
        slab.position.set(0, midY, 0);
        scene.add(slab);

        const edges = new THREE.EdgesGeometry(slabGeo);
        const lineMat = new THREE.LineBasicMaterial({
          color: new THREE.Color(f.color),
          transparent: true,
          opacity: 0.45
        });
        const wire = new THREE.LineSegments(edges, lineMat);
        wire.position.copy(slab.position);
        scene.add(wire);
      });
    }

    if (showDangerZone) {
      const dzTop = -3400 * V_SCALE;
      const dzBot = -3450 * V_SCALE;
      const dzThick = Math.abs(dzTop - dzBot);
      const dzGeo = new THREE.BoxGeometry(240, Math.max(1.2, dzThick), 240);
      const dzMat = new THREE.MeshBasicMaterial({
        color: 0xef4444,
        transparent: true,
        opacity: 0.25,
        depthWrite: false,
        side: THREE.DoubleSide
      });
      const dzMesh = new THREE.Mesh(dzGeo, dzMat);
      dzMesh.position.set(0, (dzTop + dzBot) / 2, 0);
      scene.add(dzMesh);

      const dzEdges = new THREE.EdgesGeometry(dzGeo);
      const dzWire = new THREE.LineSegments(
        dzEdges,
        new THREE.LineBasicMaterial({ color: 0xf87171, transparent: true, opacity: 0.9 })
      );
      dzWire.position.copy(dzMesh.position);
      scene.add(dzWire);
    }

    const pickableObjects: THREE.Object3D[] = [];
    const pulsingMeshes: THREE.Mesh[] = [];

    wells.forEach((w) => {
      const isWithinRadius = w.well_id === 'W-101' || w.distance_km <= radiusKm;
      const isActive = w.well_id === 'W-101';
      const isSelected = w.well_id === selectedWellId;

      const pts = trajectories[w.well_id] || [];
      if (pts.length < 2) return;

      const surfaceX = pts[0].east_m * H_SCALE;
      const surfaceZ = pts[0].north_m * H_SCALE;

      const rigHeight = isActive ? 7.5 : 5.2;
      const rigGeo = new THREE.ConeGeometry(isActive ? 2.4 : 1.7, rigHeight, 4);
      const rigColor = isActive
        ? 0x10b981
        : !isWithinRadius
        ? 0x475569
        : w.risk_rating === 'CRITICAL'
        ? 0xef4444
        : w.risk_rating === 'HIGH'
        ? 0xf59e0b
        : 0x3b82f6;

      const rigMat = new THREE.MeshStandardMaterial({
        color: rigColor,
        emissive: rigColor,
        emissiveIntensity: isSelected || isActive ? 0.65 : 0.25
      });
      const rigMesh = new THREE.Mesh(rigGeo, rigMat);
      rigMesh.position.set(surfaceX, rigHeight / 2, surfaceZ);
      rigMesh.userData = {
        type: 'WELL',
        title: `${w.well_id} — ${w.well_name}`,
        subtitle: isActive ? `ACTIVE WELL • Depth: ${activeDepth} m` : `Distance: ${w.distance_km} km • Similarity: ${w.overall_similarity_pct}%`,
        details: `Formation: ${w.current_formation} | Rig: ${w.rig_name} | Risk: ${w.risk_rating}`,
        severity: w.risk_rating,
        wellId: w.well_id
      };
      scene.add(rigMesh);
      pickableObjects.push(rigMesh);

      const curveVectors: THREE.Vector3[] = [];
      const activeDrilledVectors: THREE.Vector3[] = [];

      pts.forEach((p) => {
        const vx = p.east_m * H_SCALE;
        const vy = -p.tvd * V_SCALE;
        const vz = p.north_m * H_SCALE;
        const vec = new THREE.Vector3(vx, vy, vz);
        curveVectors.push(vec);

        if (isActive && p.md <= activeDepth) {
          activeDrilledVectors.push(vec);
        }
      });

      let activeBitPosition = new THREE.Vector3(surfaceX, -activeDepth * V_SCALE, surfaceZ);
      if (isActive && curveVectors.length > 1) {
        const fullSpline = new THREE.CatmullRomCurve3(curveVectors);
        const tFraction = Math.min(1, Math.max(0.01, activeDepth / w.total_depth));
        activeBitPosition = fullSpline.getPointAt(tFraction);
        activeDrilledVectors.push(activeBitPosition);
      }

      if (isActive) {
        if (activeDrilledVectors.length >= 2) {
          const drilledCurve = new THREE.CatmullRomCurve3(activeDrilledVectors);
          const drilledTubeGeo = new THREE.TubeGeometry(drilledCurve, 64, 1.05, 12, false);
          const drilledTubeMat = new THREE.MeshStandardMaterial({
            color: 0x10b981,
            emissive: 0x059669,
            emissiveIntensity: 0.7
          });
          const drilledTube = new THREE.Mesh(drilledTubeGeo, drilledTubeMat);
          drilledTube.userData = rigMesh.userData;
          scene.add(drilledTube);
          pickableObjects.push(drilledTube);
        }

        const fullCurve = new THREE.CatmullRomCurve3(curveVectors);
        const plannedTubeGeo = new THREE.TubeGeometry(fullCurve, 64, 0.45, 8, false);
        const plannedTubeMat = new THREE.MeshBasicMaterial({
          color: 0x6ee7b7,
          transparent: true,
          opacity: 0.25,
          wireframe: true
        });
        scene.add(new THREE.Mesh(plannedTubeGeo, plannedTubeMat));

        const bitGeo = new THREE.SphereGeometry(1.9, 24, 24);
        const bitMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
        const bitMesh = new THREE.Mesh(bitGeo, bitMat);
        bitMesh.position.copy(activeBitPosition);
        scene.add(bitMesh);

        if (showLookaheadSphere) {
          const lookaheadGeo = new THREE.SphereGeometry(5.5, 32, 32);
          const isApproachingHazard = activeDepth >= 3360 && activeDepth <= 3455;
          const lookaheadMat = new THREE.MeshBasicMaterial({
            color: isApproachingHazard ? 0xf59e0b : 0x10b981,
            transparent: true,
            opacity: isApproachingHazard ? 0.35 : 0.2
          });
          const lookaheadSphere = new THREE.Mesh(lookaheadGeo, lookaheadMat);
          lookaheadSphere.position.copy(activeBitPosition);
          scene.add(lookaheadSphere);
          pulsingMeshes.push(lookaheadSphere);
        }
      } else {
        const offsetCurve = new THREE.CatmullRomCurve3(curveVectors);
        const tubeRadius = isSelected ? 0.95 : 0.65;
        const tubeGeo = new THREE.TubeGeometry(offsetCurve, 60, tubeRadius, 10, false);
        const tubeMat = new THREE.MeshStandardMaterial({
          color: rigColor,
          emissive: rigColor,
          emissiveIntensity: isSelected ? 0.6 : 0.2,
          transparent: true,
          opacity: isWithinRadius ? 0.92 : 0.25
        });
        const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
        tubeMesh.userData = rigMesh.userData;
        scene.add(tubeMesh);
        pickableObjects.push(tubeMesh);

        if (isWithinRadius) {
          const wellEvents = events.filter((e) => e.well_id === w.well_id);
          wellEvents.forEach((ev) => {
            const tFrac = Math.min(0.99, Math.max(0.05, ev.depth / w.total_depth));
            const evPos = offsetCurve.getPointAt(tFrac);

            const beaconColor =
              ev.event_type === 'MUD_LOSS'
                ? 0xef4444
                : ev.event_type === 'STUCK_PIPE'
                ? 0xf97316
                : ev.event_type === 'KICK'
                ? 0xa855f7
                : 0xeab308;

            const beaconGeo = new THREE.SphereGeometry(2.1, 20, 20);
            const beaconMat = new THREE.MeshStandardMaterial({
              color: beaconColor,
              emissive: beaconColor,
              emissiveIntensity: 0.9
            });
            const beaconMesh = new THREE.Mesh(beaconGeo, beaconMat);
            beaconMesh.position.copy(evPos);
            beaconMesh.userData = {
              type: 'EVENT',
              title: `${ev.well_id}: ${ev.event_type.replace('_', ' ')} @ ${ev.depth} m`,
              subtitle: `Formation: ${ev.formation} • Loss: ${ev.loss_rate_bbl_hr} bbl/hr • NPT: ${ev.npt_hours} hrs`,
              details: `Mitigation: ${ev.mitigation} | Source: ${ev.source_doc} (p.${ev.source_page})`,
              severity: ev.severity,
              wellId: ev.well_id,
              eventObj: ev
            };
            scene.add(beaconMesh);
            pickableObjects.push(beaconMesh);
            pulsingMeshes.push(beaconMesh);

            if (ev.depth >= 3390 && ev.depth <= 3460) {
              const w101Pts = trajectories['W-101'] || [];
              if (w101Pts.length > 1) {
                const w101Curve = new THREE.CatmullRomCurve3(
                  w101Pts.map((p) => new THREE.Vector3(p.east_m * H_SCALE, -p.tvd * V_SCALE, p.north_m * H_SCALE))
                );
                const w101HazardPos = w101Curve.getPointAt(Math.min(0.99, ev.depth / 3950));
                const tetherGeo = new THREE.BufferGeometry().setFromPoints([evPos, w101HazardPos]);
                const tetherMat = new THREE.LineDashedMaterial({
                  color: 0xf87171,
                  dashSize: 2,
                  gapSize: 1.5,
                  transparent: true,
                  opacity: 0.65
                });
                const tetherLine = new THREE.Line(tetherGeo, tetherMat);
                tetherLine.computeLineDistances();
                scene.add(tetherLine);
              }
            }
          });
        }
      }
    });

    let isDragging = false;
    let isRightDrag = false;
    let prevX = 0;
    let prevY = 0;
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const updateCameraPosition = () => {
      const { theta, phi, distance, target } = cameraStateRef.current;
      const clampedPhi = Math.max(0.08, Math.min(Math.PI - 0.08, phi));
      camera.position.x = target.x + distance * Math.sin(clampedPhi) * Math.cos(theta);
      camera.position.y = target.y + distance * Math.cos(clampedPhi);
      camera.position.z = target.z + distance * Math.sin(clampedPhi) * Math.sin(theta);
      camera.lookAt(target);
    };
    updateCameraPosition();

    const onPointerDown = (e: MouseEvent) => {
      isDragging = true;
      isRightDrag = e.button === 2 || e.shiftKey;
      prevX = e.clientX;
      prevY = e.clientY;
    };

    const onPointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging) {
        const dx = e.clientX - prevX;
        const dy = e.clientY - prevY;
        prevX = e.clientX;
        prevY = e.clientY;

        if (isRightDrag) {
          cameraStateRef.current.target.x -= dx * 0.18;
          cameraStateRef.current.target.y += dy * 0.18;
        } else {
          cameraStateRef.current.theta += dx * 0.0075;
          cameraStateRef.current.phi = Math.max(
            0.1,
            Math.min(Math.PI - 0.1, cameraStateRef.current.phi - dy * 0.0075)
          );
        }
        updateCameraPosition();
        return;
      }

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(pickableObjects, false);
      if (intersects.length > 0) {
        const hit = intersects[0].object;
        if (hit.userData && hit.userData.title) {
          renderer.domElement.style.cursor = 'pointer';
          setHoveredItem(hit.userData as any);
        }
      } else {
        renderer.domElement.style.cursor = 'grab';
      }
    };

    const onPointerUp = (e: MouseEvent) => {
      const moved = Math.hypot(e.clientX - prevX, e.clientY - prevY);
      isDragging = false;
      if (moved < 5) {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(pickableObjects, false);
        if (intersects.length > 0) {
          const data = intersects[0].object.userData;
          if (data?.wellId) onSelectWell(data.wellId);
          if (data?.eventObj && onSelectEvent) onSelectEvent(data.eventObj);
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraStateRef.current.distance = Math.max(
        30,
        Math.min(420, cameraStateRef.current.distance + e.deltaY * 0.12)
      );
      updateCameraPosition();
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);
    domElem.addEventListener('wheel', onWheel, { passive: false });
    domElem.addEventListener('contextmenu', (e) => e.preventDefault());

    let animId = 0;
    let clock = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      clock += 0.045;
      const scalePulse = 1 + Math.sin(clock) * 0.16;
      pulsingMeshes.forEach((m) => {
        m.scale.set(scalePulse, scalePulse, scalePulse);
      });
      updateCameraPosition();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || 900;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      domElem.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mousemove', onPointerMove);
      window.removeEventListener('mouseup', onPointerUp);
      domElem.removeEventListener('wheel', onWheel);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
    };
  }, [wells, formations, events, trajectories, activeDepth, radiusKm, selectedWellId, showStrata, strataOpacity, showDangerZone, showLookaheadSphere, sceneLightMode, isFullscreen]);

  return (
    <div
      className={`bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden flex flex-col transition-all ${
        isFullscreen ? 'fixed inset-3 z-50 shadow-2xl' : 'h-[560px] w-full'
      }`}
    >
      {/* Clean White Card Header matching Oil India UI */}
      <div className="bg-white border-b border-blue-100 px-5 py-3 flex flex-wrap items-center justify-between gap-3 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#1E3A8A]">
              3D Subsurface Reservoir & Directional Wellbore Trajectory View
            </h3>
            <p className="text-[11px] text-slate-500">
              Interactive 360° WebGL Reservoir Block • Upper Assam Basin (TVD 0 – 4,200 m)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSceneLightMode(!sceneLightMode)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition cursor-pointer ${
              sceneLightMode
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-slate-800 text-white border-slate-700'
            }`}
          >
            {sceneLightMode ? '☀️ Daylight 3D' : '🌙 Night 3D'}
          </button>
          <button
            onClick={() => applyPreset('STRATA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              cameraPreset === 'STRATA'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Subsurface Strata
          </button>
          <button
            onClick={() => applyPreset('BIT_FOCUS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              cameraPreset === 'BIT_FOCUS'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            Focus Bit ({activeDepth} m)
          </button>
          <button
            onClick={() => applyPreset('SURFACE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              cameraPreset === 'SURFACE'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            Surface Bird's-Eye
          </button>
          <button
            onClick={() => applyPreset('PROFILE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              cameraPreset === 'PROFILE'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Horizon Profile
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* WebGL Viewport with Clean Light Floating HUD Cards */}
      <div className="relative flex-1 w-full h-full">
        <div ref={mountRef} className="w-full h-full" />

        {/* Left Floating Card: Stratigraphic Layers & Radius */}
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md border border-blue-100 rounded-xl p-3.5 w-64 text-xs space-y-2.5 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
            <span className="font-extrabold text-[#1E3A8A] uppercase tracking-wider text-[11px]">
              Stratigraphic Horizons
            </span>
            <label className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showStrata}
                onChange={(e) => setShowStrata(e.target.checked)}
                className="rounded accent-blue-600"
              />
              Show Slabs
            </label>
          </div>

          <div className="space-y-1.5">
            {formations.map((f) => (
              <div
                key={f.formation_id}
                className={`flex items-center justify-between px-2.5 py-1 rounded-lg border ${
                  f.name.includes('Barail')
                    ? 'bg-red-50 border-red-300 text-red-900 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: f.color }}
                  />
                  <span className="truncate max-w-[115px]">{f.name}</span>
                </div>
                <span className="font-mono text-[10px] text-slate-500">
                  {f.top_depth}–{f.bottom_depth}m
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200 space-y-2">
            <div>
              <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                <span>Search Radius Cylinder:</span>
                <span className="font-mono font-extrabold text-blue-600">{radiusKm} km</span>
              </div>
              <input
                type="range"
                min={2}
                max={20}
                step={0.5}
                value={radiusKm}
                onChange={(e) => onRadiusChange(Number(e.target.value))}
                className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded cursor-pointer"
              />
            </div>

            <label className="flex items-center gap-1.5 text-[11px] font-bold text-red-700 cursor-pointer">
              <input
                type="checkbox"
                checked={showDangerZone}
                onChange={(e) => setShowDangerZone(e.target.checked)}
                className="accent-red-600"
              />
              3,400–3,450m Barail Loss Zone
            </label>
          </div>
        </div>

        {/* Right Floating Card: 3D Telemetry & Hover Inspector */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md border border-blue-100 rounded-xl p-3.5 w-72 text-xs space-y-2.5 shadow-lg">
          <div className="font-extrabold text-[#1E3A8A] uppercase tracking-wider text-[11px] border-b border-slate-200 pb-1.5 flex items-center justify-between">
            <span>3D Wellbore Legend</span>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-bold">
              WebGL Live
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px] font-semibold text-slate-700">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>W-101 Active String</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
              <span>50m Lookahead Cone</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
              <span>Mud Loss Peak</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block" />
              <span>Stuck Pipe Event</span>
            </div>
          </div>

          {hoveredItem ? (
            <div className="p-2.5 rounded-xl bg-blue-50/90 border border-blue-200 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-600 text-white">
                  {hoveredItem.type} INSPECTOR
                </span>
                {hoveredItem.severity && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                    {hoveredItem.severity}
                  </span>
                )}
              </div>
              <div className="font-extrabold text-[#1E3A8A] text-xs pt-0.5">{hoveredItem.title}</div>
              <div className="text-blue-700 text-[11px] font-semibold">{hoveredItem.subtitle}</div>
              <div className="text-slate-600 text-[11px] leading-snug pt-1 border-t border-blue-200/60">
                {hoveredItem.details}
              </div>
            </div>
          ) : (
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-[11px]">
              Drag to orbit 360°, Scroll to zoom into wellbore trajectories, Click any glowing incident sphere or wellhead to inspect.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
