import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { WellSummary, FormationLayer, DrillingEvent, SurveyPoint } from '../../types';

export interface ThreeSubsurfaceMapProps {
  wells: WellSummary[];
  activeWell: WellSummary;
  formations: FormationLayer[];
  events: DrillingEvent[];
  trajectories?: Record<string, SurveyPoint[]>;
  radiusKm: number;
  inspectedDepth: number; // Interactive depth navigator
  showTrajectories: boolean;
  showFormations: boolean;
  showIncidents: boolean;
  showTerrain: boolean;
  is2DView: boolean;
  onSelectWell: (wellId: string) => void;
  isLightMode?: boolean;
}

export const ThreeSubsurfaceMap: React.FC<ThreeSubsurfaceMapProps> = ({
  wells,
  activeWell,
  formations,
  events,
  trajectories = {},
  radiusKm,
  inspectedDepth,
  showTrajectories,
  showFormations,
  showIncidents,
  showTerrain,
  is2DView,
  onSelectWell,
  isLightMode = true,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number | null>(null);

  // Mouse interaction state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraDistanceRef = useRef(85);
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 3 });

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 900;
    const height = container.clientHeight || 520;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(isLightMode ? 0xF1F5F9 : 0x0B0F19);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, isLightMode ? 0.95 : 0.75);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.65);
    dirLight.position.set(60, 90, 60);
    scene.add(dirLight);

    rebuildScene();

    const animate = () => {
      renderer.render(scene, camera);
      frameIdRef.current = requestAnimationFrame(animate);
    };
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: w, height: h } = entry.contentRect;
        if (w > 0 && h > 0 && renderer && camera) {
          camera.aspect = w / h;
          camera.updateProjectionMatrix();
          renderer.setSize(w, h);
        }
      }
    });
    resizeObserver.observe(container);

    const handleWindowResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 520;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleWindowResize);

    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, []);

  useEffect(() => {
    if (is2DView) {
      cameraAngleRef.current = { theta: 0, phi: 0.001 };
      cameraDistanceRef.current = 90;
    } else {
      cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 3 };
      cameraDistanceRef.current = 85;
    }
    updateCameraPosition();
  }, [is2DView]);

  useEffect(() => {
    rebuildScene();
  }, [
    wells,
    activeWell,
    formations,
    events,
    trajectories,
    radiusKm,
    inspectedDepth,
    showTrajectories,
    showFormations,
    showIncidents,
    showTerrain,
    isLightMode,
  ]);

  const updateCameraPosition = () => {
    if (!cameraRef.current) return;
    const camera = cameraRef.current;
    const { theta, phi } = cameraAngleRef.current;
    const d = cameraDistanceRef.current;

    camera.position.x = d * Math.sin(phi) * Math.sin(theta);
    camera.position.y = d * Math.cos(phi);
    camera.position.z = d * Math.sin(phi) * Math.cos(theta);
    camera.lookAt(0, -18, 0);
  };

  const rebuildScene = () => {
    const scene = sceneRef.current;
    if (!scene) return;

    scene.background = new THREE.Color(isLightMode ? 0xF1F5F9 : 0x0B0F19);

    const objectsToRemove: THREE.Object3D[] = [];
    scene.traverse((child) => {
      if (
        child instanceof THREE.Mesh ||
        child instanceof THREE.Line ||
        child instanceof THREE.GridHelper ||
        child instanceof THREE.Group
      ) {
        objectsToRemove.push(child);
      }
    });
    objectsToRemove.forEach((obj) => scene.remove(obj));

    const depthScale = 0.01;
    const xyScale = 0.0035;

    // 1. Ground Surface Grid
    if (showTerrain) {
      const grid = new THREE.GridHelper(
        110,
        22,
        isLightMode ? 0x94A3B8 : 0x334155,
        isLightMode ? 0xCBD5E1 : 0x1E293B
      );
      grid.position.y = 0;
      scene.add(grid);

      // Search Radius Ring
      const ringGeometry = new THREE.RingGeometry(radiusKm * 3.5 - 0.25, radiusKm * 3.5 + 0.25, 64);
      const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x3B82F6,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
      });
      const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = 0.05;
      scene.add(ringMesh);
    }

    // 2. 3D VERTICAL DEPTH RULER PILLAR
    const depthRulerGroup = new THREE.Group();
    const rulerX = -36;
    const rulerZ = -36;
    const totalDepth = activeWell.total_depth || 3850;
    const totalDepthY = -totalDepth * depthScale;

    const rulerSpineGeo = new THREE.CylinderGeometry(0.2, 0.2, Math.abs(totalDepthY), 8);
    const rulerSpineMat = new THREE.MeshBasicMaterial({ color: 0x64748B });
    const rulerSpine = new THREE.Mesh(rulerSpineGeo, rulerSpineMat);
    rulerSpine.position.set(rulerX, totalDepthY / 2, rulerZ);
    depthRulerGroup.add(rulerSpine);

    const depthMarkers = [0, 500, 1000, 1500, 2000, 2500, 3000, 3385, 3400, 3850];
    depthMarkers.forEach((depth) => {
      const tickY = -depth * depthScale;
      const isBit = Math.abs(depth - (activeWell.current_depth || 3385)) < 15;
      const isHazard = depth === 3400;

      const tickGeo = new THREE.BoxGeometry(isBit ? 4.0 : isHazard ? 3.5 : 2.0, 0.18, 0.35);
      const tickMat = new THREE.MeshBasicMaterial({
        color: isBit ? 0x16A34A : isHazard ? 0xDC2626 : 0x475569,
      });
      const tick = new THREE.Mesh(tickGeo, tickMat);
      tick.position.set(rulerX + (isBit || isHazard ? 1.6 : 0.9), tickY, rulerZ);
      depthRulerGroup.add(tick);
    });
    scene.add(depthRulerGroup);

    // 3. DYNAMIC INTERACTIVE DEPTH SLICE PLANE & RING
    const currentSliceY = -inspectedDepth * depthScale;
    const isAtHazard = inspectedDepth >= 3400 && inspectedDepth <= 3455;

    const sliceRingGeo = new THREE.RingGeometry(24, 24.5, 64);
    const sliceRingMat = new THREE.MeshBasicMaterial({
      color: isAtHazard ? 0xDC2626 : 0x2563EB,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.85,
    });
    const sliceRing = new THREE.Mesh(sliceRingGeo, sliceRingMat);
    sliceRing.rotation.x = Math.PI / 2;
    sliceRing.position.set(0, currentSliceY, 0);
    scene.add(sliceRing);

    // Subtle horizontal slice plane sheet
    const slicePlaneGeo = new THREE.PlaneGeometry(80, 80);
    const slicePlaneMat = new THREE.MeshBasicMaterial({
      color: isAtHazard ? 0xEF4444 : 0x3B82F6,
      transparent: true,
      opacity: 0.12,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const slicePlane = new THREE.Mesh(slicePlaneGeo, slicePlaneMat);
    slicePlane.rotation.x = Math.PI / 2;
    slicePlane.position.set(0, currentSliceY, 0);
    scene.add(slicePlane);

    // 4. Stratigraphic Horizons
    if (showFormations) {
      formations.forEach((formation, idx) => {
        const horizonDepth = -formation.top_depth * depthScale;
        const horizonGeo = new THREE.PlaneGeometry(90, 90);

        let horizonColor = 0x94A3B8;
        if (formation.name.includes('Barail')) horizonColor = 0xFCA5A5;
        else if (formation.name.includes('Tipam')) horizonColor = 0xFDE68A;
        else if (formation.name.includes('Girujan')) horizonColor = 0xCBD5E1;
        else if (formation.name.includes('Kopili')) horizonColor = 0xC4B5FD;

        const horizonMat = new THREE.MeshLambertMaterial({
          color: horizonColor,
          transparent: true,
          opacity: formation.name.includes('Barail') ? 0.28 : 0.18,
          side: THREE.DoubleSide,
          depthWrite: false,
        });

        const horizonMesh = new THREE.Mesh(horizonGeo, horizonMat);
        horizonMesh.rotation.x = Math.PI / 2;
        horizonMesh.position.y = horizonDepth;
        scene.add(horizonMesh);
      });
    }

    // 5. Wells & Trajectories
    const visibleWells = wells.filter((w) => {
      if (w.well_id === activeWell.well_id) return true;
      if ((w as any).isUploaded) return true;
      return (w.distance_km || 0) <= radiusKm;
    });

    visibleWells.forEach((well) => {
      const isAct = well.well_id === activeWell.well_id;
      const isUploaded = (well as any).isUploaded;
      const wellGroup = new THREE.Group();
      (wellGroup as any).userData = { well };

      const surfaceX = (well.surface_offset_x || 0) * xyScale;
      const surfaceZ = (well.surface_offset_z || 0) * xyScale;

      const wellheadGeo = new THREE.CylinderGeometry(
        isUploaded ? 1.2 : 0.85,
        isUploaded ? 1.2 : 0.85,
        0.5,
        16
      );
      const isHighRisk = well.risk_rating === 'CRITICAL' || well.risk_rating === 'HIGH';
      const wellheadMat = new THREE.MeshLambertMaterial({
        color: isAct
          ? 0x1E3A8A
          : isUploaded
          ? 0x059669
          : isHighRisk
          ? 0xDC2626
          : 0x64748B,
      });
      const wellhead = new THREE.Mesh(wellheadGeo, wellheadMat);
      wellhead.position.set(surfaceX, 0.25, surfaceZ);
      wellGroup.add(wellhead);

      // Beacon for uploaded scanned well
      if (isUploaded) {
        const poleGeo = new THREE.CylinderGeometry(0.12, 0.12, 3.8, 8);
        const poleMat = new THREE.MeshBasicMaterial({ color: 0x059669 });
        const pole = new THREE.Mesh(poleGeo, poleMat);
        pole.position.set(surfaceX, 2.0, surfaceZ);
        wellGroup.add(pole);

        const beaconGeo = new THREE.SphereGeometry(0.75, 16, 16);
        const beaconMat = new THREE.MeshBasicMaterial({ color: 0x10B981 });
        const beacon = new THREE.Mesh(beaconGeo, beaconMat);
        beacon.position.set(surfaceX, 4.0, surfaceZ);
        wellGroup.add(beacon);
      }

      if (showTrajectories) {
        const wellTrajectory =
          trajectories[well.well_id] ||
          (well as any).trajectoryPoints ||
          [
            { tvd: 0, east_m: 0, north_m: 0 },
            { tvd: 1200, east_m: 5, north_m: 8 },
            { tvd: 2400, east_m: 25, north_m: 40 },
            { tvd: 3385, east_m: 65, north_m: 110 },
            { tvd: well.total_depth || 3850, east_m: 95, north_m: 160 },
          ];

        if (wellTrajectory && wellTrajectory.length > 0) {
          const points = wellTrajectory.map((pt: any) => {
            const dx = (pt.east_m !== undefined ? pt.east_m : pt.dx || 0) * xyScale * 0.5;
            const dy = (pt.north_m !== undefined ? pt.north_m : pt.dy || 0) * xyScale * 0.5;
            const tvd = pt.tvd || 0;
            return new THREE.Vector3(surfaceX + dx, -tvd * depthScale, surfaceZ + dy);
          });

          if (points.length >= 2) {
            const curve = new THREE.CatmullRomCurve3(points);
            const tubeGeo = new THREE.TubeGeometry(
              curve,
              40,
              isAct ? 0.38 : isUploaded ? 0.32 : 0.22,
              8,
              false
            );
            const tubeMat = new THREE.MeshLambertMaterial({
              color: isAct
                ? 0x2563EB
                : isUploaded
                ? 0x10B981
                : isHighRisk
                ? 0xEF4444
                : 0x94A3B8,
            });
            const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
            wellGroup.add(tubeMesh);
          }

          // Active Well Bit Cone
          if (isAct) {
            const bitDepth = -(activeWell.current_depth || 3385) * depthScale;
            const bitGeo = new THREE.ConeGeometry(0.75, 1.6, 12);
            const bitMat = new THREE.MeshBasicMaterial({ color: 0x16A34A });
            const bitMesh = new THREE.Mesh(bitGeo, bitMat);
            bitMesh.rotation.x = Math.PI;
            bitMesh.position.set(surfaceX, bitDepth, surfaceZ);
            wellGroup.add(bitMesh);
          }
        }
      }

      scene.add(wellGroup);
    });

    // 6. Incident Pins in 3D Space
    if (showIncidents) {
      events.forEach((inc) => {
        const parentWell = wells.find((w) => w.well_id === inc.well_id);
        if (!parentWell) return;
        if (
          parentWell.well_id !== activeWell.well_id &&
          !(parentWell as any).isUploaded &&
          (parentWell.distance_km || 0) > radiusKm
        ) {
          return;
        }

        const pinX = (parentWell.surface_offset_x || 0) * xyScale;
        const pinZ = (parentWell.surface_offset_z || 0) * xyScale;
        const pinY = -inc.depth * depthScale;

        // Pulse pin if currently inspected depth is within 40m of it
        const isNearInspected = Math.abs(inspectedDepth - inc.depth) <= 40;
        const isUploadedInc = (parentWell as any).isUploaded;

        const pinGeo = new THREE.SphereGeometry(
          isNearInspected ? 1.35 : isUploadedInc ? 0.95 : 0.7,
          16,
          16
        );
        const pinMat = new THREE.MeshBasicMaterial({
          color: isNearInspected
            ? 0xFF0000
            : isUploadedInc
            ? 0xDC2626
            : inc.event_type.includes('KICK')
            ? 0x991B1B
            : inc.event_type.includes('LOSS')
            ? 0xDC2626
            : 0xD97706,
        });
        const pinMesh = new THREE.Mesh(pinGeo, pinMat);
        pinMesh.position.set(pinX, pinY, pinZ);
        scene.add(pinMesh);

        // Highlight ring around nearby incident
        if (isNearInspected || isUploadedInc) {
          const haloGeo = new THREE.RingGeometry(1.3, 1.7, 32);
          const haloMat = new THREE.MeshBasicMaterial({
            color: 0xEF4444,
            side: THREE.DoubleSide,
          });
          const haloMesh = new THREE.Mesh(haloGeo, haloMat);
          haloMesh.rotation.x = Math.PI / 2;
          haloMesh.position.set(pinX, pinY, pinZ);
          scene.add(haloMesh);
        }
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || is2DView) return;
    const deltaX = e.clientX - previousMousePositionRef.current.x;
    const deltaY = e.clientY - previousMousePositionRef.current.y;

    cameraAngleRef.current.theta -= deltaX * 0.008;
    cameraAngleRef.current.phi = Math.max(
      0.05,
      Math.min(Math.PI / 2 - 0.05, cameraAngleRef.current.phi - deltaY * 0.008)
    );

    updateCameraPosition();
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent) => {
    cameraDistanceRef.current = Math.max(
      20,
      Math.min(180, cameraDistanceRef.current + e.deltaY * 0.06)
    );
    updateCameraPosition();
  };

  return (
    <div
      ref={mountRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      className="w-full h-full min-h-[500px] overflow-hidden relative cursor-grab active:cursor-grabbing select-none"
    />
  );
};
