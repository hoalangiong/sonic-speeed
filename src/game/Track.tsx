import React, { useMemo } from 'react';
import * as THREE from 'three';
import { TRACK } from '../constants';

/**
 * Drive X style track — long highway with gentle curves,
 * 2 lanes, yellow center line, white edge lines, trees + poles.
 */
export function Track() {
  const { roadGeo, groundGeo } = useMemo(() => {
    const trackPoints = getTrackPoints();
    const curve = new THREE.CatmullRomCurve3(trackPoints, true, 'catmullrom', 0.5);

    // Road surface
    const roadShape = new THREE.Shape();
    const halfWidth = TRACK.WIDTH / 2;
    roadShape.moveTo(-halfWidth, 0);
    roadShape.lineTo(halfWidth, 0);
    roadShape.lineTo(halfWidth, 0.12);
    roadShape.lineTo(-halfWidth, 0.12);
    roadShape.closePath();

    const roadGeo = new THREE.ExtrudeGeometry(roadShape, {
      steps: 300,
      bevelEnabled: false,
      extrudePath: curve,
    });

    const groundGeo = new THREE.PlaneGeometry(600, 600, 16, 16);
    groundGeo.rotateX(-Math.PI / 2);

    return { roadGeo, groundGeo };
  }, []);

  return (
    <group>
      {/* Ground — grass/dirt */}
      <mesh geometry={groundGeo} position={[0, -0.1, 0]}>
        <meshStandardMaterial color="#4a7a3a" roughness={0.95} metalness={0} />
      </mesh>

      {/* Road — dark asphalt */}
      <mesh geometry={roadGeo}>
        <meshStandardMaterial color="#3a3a3a" roughness={0.65} metalness={0.05} />
      </mesh>

      {/* Road markings */}
      <RoadMarkings />

      {/* Roadside scenery — trees, poles, barriers */}
      <RoadsideScenery />
    </group>
  );
}

/** Road markings — yellow center dashes + white edge lines */
function RoadMarkings() {
  const { centerMarks, edgeMarksLeft, edgeMarksRight } = useMemo(() => {
    const trackPoints = getTrackPoints();
    const curve = new THREE.CatmullRomCurve3(trackPoints, true, 'catmullrom', 0.5);
    const halfWidth = TRACK.WIDTH / 2;

    const center: Array<{ pos: THREE.Vector3; rot: number }> = [];
    const left: Array<{ pos: THREE.Vector3; rot: number }> = [];
    const right: Array<{ pos: THREE.Vector3; rot: number }> = [];

    const numMarks = 120;
    for (let i = 0; i < numMarks; i++) {
      const t = i / numMarks;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      const angle = Math.atan2(tangent.x, tangent.z);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      // Center dashes (every other)
      if (i % 2 === 0) {
        center.push({ pos: point.clone(), rot: angle });
      }

      // Edge lines (continuous)
      const leftPos = point.clone().add(normal.clone().multiplyScalar(halfWidth - 0.3));
      const rightPos = point.clone().add(normal.clone().multiplyScalar(-(halfWidth - 0.3)));
      left.push({ pos: leftPos, rot: angle });
      right.push({ pos: rightPos, rot: angle });
    }

    return { centerMarks: center, edgeMarksLeft: left, edgeMarksRight: right };
  }, []);

  return (
    <group>
      {/* Yellow center dashes */}
      {centerMarks.map((m, i) => (
        <mesh key={`c-${i}`} position={[m.pos.x, 0.13, m.pos.z]} rotation={[0, m.rot, 0]}>
          <boxGeometry args={[0.15, 0.02, 2.5]} />
          <meshStandardMaterial color="#ddaa00" emissive="#ddaa00" emissiveIntensity={0.2} />
        </mesh>
      ))}

      {/* White left edge line */}
      {edgeMarksLeft.map((m, i) => (
        <mesh key={`l-${i}`} position={[m.pos.x, 0.13, m.pos.z]} rotation={[0, m.rot, 0]}>
          <boxGeometry args={[0.12, 0.02, 2.8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.1} />
        </mesh>
      ))}

      {/* White right edge line */}
      {edgeMarksRight.map((m, i) => (
        <mesh key={`r-${i}`} position={[m.pos.x, 0.13, m.pos.z]} rotation={[0, m.rot, 0]}>
          <boxGeometry args={[0.12, 0.02, 2.8]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.1} />
        </mesh>
      ))}
    </group>
  );
}

/** Roadside scenery — trees, power poles, guardrails */
function RoadsideScenery() {
  const { trees, poles } = useMemo(() => {
    const trackPoints = getTrackPoints();
    const curve = new THREE.CatmullRomCurve3(trackPoints, true, 'catmullrom', 0.5);
    const halfWidth = TRACK.WIDTH / 2;

    const treeItems: Array<{ pos: [number, number, number]; height: number; side: number }> = [];
    const poleItems: Array<{ pos: [number, number, number]; rot: number }> = [];

    // Trees along both sides
    for (let i = 0; i < 60; i++) {
      const t = i / 60;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      const side = i % 2 === 0 ? 1 : -1;
      const offset = halfWidth + 3 + Math.random() * 5;
      const treePos = point.clone().add(normal.clone().multiplyScalar(side * offset));

      treeItems.push({
        pos: [treePos.x, 0, treePos.z],
        height: 5 + Math.random() * 4,
        side,
      });
    }

    // Power poles — right side every ~8 segments
    for (let i = 0; i < 20; i++) {
      const t = i / 20;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const angle = Math.atan2(tangent.x, tangent.z);

      const polePos = point.clone().add(normal.clone().multiplyScalar(-(halfWidth + 2)));
      poleItems.push({ pos: [polePos.x, 0, polePos.z], rot: angle });
    }

    return { trees: treeItems, poles: poleItems };
  }, []);

  return (
    <group>
      {/* Trees — green rounded canopy */}
      {trees.map((t, i) => (
        <group key={`tree-${i}`} position={t.pos}>
          <mesh position={[0, t.height / 2, 0]}>
            <cylinderGeometry args={[0.15, 0.2, t.height, 6]} />
            <meshStandardMaterial color="#4a3520" roughness={0.9} />
          </mesh>
          <mesh position={[0, t.height + 1, 0]}>
            <sphereGeometry args={[1.5 + Math.random(), 8, 6]} />
            <meshStandardMaterial color="#2d6b2d" roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Power poles */}
      {poles.map((p, i) => (
        <group key={`pole-${i}`} position={p.pos}>
          {/* Vertical pole */}
          <mesh position={[0, 5, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 10, 6]} />
            <meshStandardMaterial color="#555555" metalness={0.5} roughness={0.6} />
          </mesh>
          {/* Cross arm */}
          <mesh position={[0, 9.5, 0]} rotation={[0, p.rot, 0]}>
            <boxGeometry args={[3, 0.1, 0.1]} />
            <meshStandardMaterial color="#444444" />
          </mesh>
          {/* Wires (simplified) */}
          <mesh position={[0, 9.3, 0]} rotation={[0, p.rot, 0]}>
            <boxGeometry args={[0.02, 0.02, 15]} />
            <meshStandardMaterial color="#222222" />
          </mesh>
        </group>
      ))}

      {/* Metal guardrails along road */}
      <GuardRails />
    </group>
  );
}

/** Metal guardrails — silver rails on both sides */
function GuardRails() {
  const rails = useMemo(() => {
    const trackPoints = getTrackPoints();
    const curve = new THREE.CatmullRomCurve3(trackPoints, true, 'catmullrom', 0.5);
    const halfWidth = TRACK.WIDTH / 2;

    const items: Array<{ pos: [number, number, number]; rot: number }> = [];

    for (let i = 0; i < 80; i++) {
      const t = i / 80;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      const angle = Math.atan2(tangent.x, tangent.z);

      const leftPos = point.clone().add(normal.clone().multiplyScalar(halfWidth + 0.3));
      items.push({ pos: [leftPos.x, 0.4, leftPos.z], rot: angle });
    }

    return items;
  }, []);

  return (
    <group>
      {rails.map((r, i) => (
        <mesh key={`rail-${i}`} position={r.pos} rotation={[0, r.rot, 0]}>
          <boxGeometry args={[0.05, 0.6, 4]} />
          <meshStandardMaterial color="#aaaaaa" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Generate Drive X style track — long highway with gentle curves.
 * NOT a tight oval — wide sweeping bends like a real highway.
 */
function getTrackPoints(): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const numPoints = 32;

  for (let i = 0; i < numPoints; i++) {
    const t = i / numPoints;
    const angle = t * Math.PI * 2;

    // Large elongated shape — more like a highway loop
    const rx = 120 + Math.sin(angle * 2) * 30;
    const rz = 80 + Math.cos(angle * 3) * 20;
    const x = Math.cos(angle) * rx;
    const z = Math.sin(angle) * rz;
    // Flat — no elevation changes (highway style)
    const y = 0;

    points.push(new THREE.Vector3(x, y, z));
  }

  return points;
}

// Export for AI opponents
export { getTrackPoints };
