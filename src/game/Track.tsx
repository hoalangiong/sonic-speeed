import React, { useMemo } from 'react';
import * as THREE from 'three';
import { TRACK } from '../constants';

/**
 * Coastal racing track — procedural loop circuit.
 * Realistic asphalt road, metal barriers, rich scenery.
 */
export function Track() {
  const { roadMesh, barrierLeftMesh, barrierRightMesh, groundMesh } = useMemo(() => {
    const trackPoints = getTrackPoints();
    const curve = new THREE.CatmullRomCurve3(trackPoints, true, 'catmullrom', 0.5);

    // Road surface
    const roadShape = new THREE.Shape();
    const halfWidth = TRACK.WIDTH / 2;
    roadShape.moveTo(-halfWidth, 0);
    roadShape.lineTo(halfWidth, 0);
    roadShape.lineTo(halfWidth, 0.15);
    roadShape.lineTo(-halfWidth, 0.15);
    roadShape.closePath();

    const roadGeo = new THREE.ExtrudeGeometry(roadShape, {
      steps: 200,
      bevelEnabled: false,
      extrudePath: curve,
    });

    // Barriers
    const barrierShape = new THREE.Shape();
    barrierShape.moveTo(0, 0);
    barrierShape.lineTo(0.3, 0);
    barrierShape.lineTo(0.3, TRACK.BARRIER_HEIGHT);
    barrierShape.lineTo(0, TRACK.BARRIER_HEIGHT);
    barrierShape.closePath();

    const leftBarrierPoints: THREE.Vector3[] = [];
    const rightBarrierPoints: THREE.Vector3[] = [];
    const numSamples = 200;

    for (let i = 0; i <= numSamples; i++) {
      const t = i / numSamples;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();

      leftBarrierPoints.push(point.clone().add(normal.clone().multiplyScalar(halfWidth + 0.5)));
      rightBarrierPoints.push(point.clone().add(normal.clone().multiplyScalar(-(halfWidth + 0.5))));
    }

    const leftCurve = new THREE.CatmullRomCurve3(leftBarrierPoints, true);
    const rightCurve = new THREE.CatmullRomCurve3(rightBarrierPoints, true);

    const leftBarrierGeo = new THREE.ExtrudeGeometry(barrierShape, {
      steps: 200,
      bevelEnabled: false,
      extrudePath: leftCurve,
    });
    const rightBarrierGeo = new THREE.ExtrudeGeometry(barrierShape, {
      steps: 200,
      bevelEnabled: false,
      extrudePath: rightCurve,
    });

    // Beach/ground
    const groundGeo = new THREE.PlaneGeometry(500, 500, 32, 32);
    groundGeo.rotateX(-Math.PI / 2);

    return {
      roadMesh: roadGeo,
      barrierLeftMesh: leftBarrierGeo,
      barrierRightMesh: rightBarrierGeo,
      groundMesh: groundGeo,
    };
  }, []);

  return (
    <group>
      {/* Sandy beach ground */}
      <mesh geometry={groundMesh} position={[0, -0.05, 0]}>
        <meshStandardMaterial
          color="#c2956b"
          roughness={0.95}
          metalness={0}
        />
      </mesh>

      {/* Asphalt road — dark with slight sheen */}
      <mesh geometry={roadMesh} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#2a2a2a"
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      {/* Road center line */}
      <RoadMarkings />

      {/* Metal barriers — realistic silver/red */}
      <mesh geometry={barrierLeftMesh}>
        <meshStandardMaterial color="#cc2222" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh geometry={barrierRightMesh}>
        <meshStandardMaterial color="#dddddd" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Scenery */}
      <TrackScenery />
    </group>
  );
}

/** Road markings — dashed center line */
function RoadMarkings() {
  const marks = useMemo(() => {
    const trackPoints = getTrackPoints();
    const curve = new THREE.CatmullRomCurve3(trackPoints, true, 'catmullrom', 0.5);
    const positions: Array<{ pos: THREE.Vector3; rot: number }> = [];

    for (let i = 0; i < 60; i++) {
      const t = i / 60;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      const angle = Math.atan2(tangent.x, tangent.z);
      positions.push({ pos: point, rot: angle });
    }
    return positions;
  }, []);

  return (
    <group>
      {marks.map((mark, i) => (
        <mesh
          key={i}
          position={[mark.pos.x, 0.16, mark.pos.z]}
          rotation={[0, mark.rot, 0]}
        >
          <boxGeometry args={[0.2, 0.02, 2]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.1} />
        </mesh>
      ))}
    </group>
  );
}

/** Rich coastal scenery — palm trees, rocks, grass patches */
function TrackScenery() {
  const { trees, rocks, grass } = useMemo(() => {
    const treePositions: Array<[number, number, number]> = [];
    const rockPositions: Array<{ pos: [number, number, number]; scale: number }> = [];
    const grassPositions: Array<[number, number, number]> = [];

    // Palm trees — scattered outside track
    for (let i = 0; i < 40; i++) {
      const angle = (i / 40) * Math.PI * 2;
      const radius = 75 + Math.sin(i * 1.7) * 20 + Math.random() * 15;
      treePositions.push([
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius,
      ]);
    }

    // Rocks along coastline
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * Math.PI * 2 + 0.3;
      const radius = 100 + Math.random() * 40;
      rockPositions.push({
        pos: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius],
        scale: 0.5 + Math.random() * 2,
      });
    }

    // Grass patches near road
    for (let i = 0; i < 25; i++) {
      const angle = (i / 25) * Math.PI * 2 + 0.5;
      const radius = 68 + Math.random() * 5;
      grassPositions.push([
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius,
      ]);
    }

    return { trees: treePositions, rocks: rockPositions, grass: grassPositions };
  }, []);

  return (
    <group>
      {/* Palm trees */}
      {trees.map((pos, i) => (
        <PalmTree key={`tree-${i}`} position={pos} seed={i} />
      ))}

      {/* Rocks */}
      {rocks.map((rock, i) => (
        <mesh key={`rock-${i}`} position={rock.pos} scale={rock.scale}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#666655" roughness={0.9} metalness={0} />
        </mesh>
      ))}

      {/* Grass patches */}
      {grass.map((pos, i) => (
        <mesh key={`grass-${i}`} position={pos}>
          <coneGeometry args={[1.5, 0.8, 6]} />
          <meshStandardMaterial color="#3d6b35" roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

/** Realistic palm tree with curved trunk + leaf fronds */
function PalmTree({ position, seed }: { position: [number, number, number]; seed: number }) {
  const height = 5 + (seed % 4);
  const lean = (seed % 3) * 0.1;

  return (
    <group position={position}>
      {/* Trunk — slightly curved */}
      <mesh position={[lean * 2, height / 2, 0]} rotation={[0, 0, lean]}>
        <cylinderGeometry args={[0.15, 0.25, height, 8]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.95} />
      </mesh>
      {/* Coconut cluster */}
      <mesh position={[lean * 3, height - 0.3, 0]}>
        <sphereGeometry args={[0.25, 6, 6]} />
        <meshStandardMaterial color="#4a3520" roughness={0.8} />
      </mesh>
      {/* Leaf fronds — multiple elongated cones */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <mesh
          key={i}
          position={[
            lean * 3 + Math.cos((angle * Math.PI) / 180) * 1.5,
            height + 0.5,
            Math.sin((angle * Math.PI) / 180) * 1.5,
          ]}
          rotation={[0.8, (angle * Math.PI) / 180, 0.3]}
        >
          <coneGeometry args={[0.6, 3, 4]} />
          <meshStandardMaterial color="#1e5e1e" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}

/** Generate coastal track loop points */
function getTrackPoints(): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  const numPoints = 20;

  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * Math.PI * 2;
    const rx = 60 + Math.sin(angle * 3) * 15;
    const rz = 45 + Math.cos(angle * 2) * 10;
    const x = Math.cos(angle) * rx;
    const z = Math.sin(angle) * rz;
    const y = Math.sin(angle * 4) * 0.3;
    points.push(new THREE.Vector3(x, y, z));
  }

  return points;
}
