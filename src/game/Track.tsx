import React, { useMemo } from 'react';
import * as THREE from 'three';
import { TRACK } from '../constants';

/**
 * Coastal racing track — procedural loop circuit.
 * Uses CatmullRom spline → extruded road + barriers.
 */
export function Track() {
  const { roadMesh, barrierLeftMesh, barrierRightMesh, groundMesh } = useMemo(() => {
    // Define track points (coastal loop)
    const trackPoints = getTrackPoints();
    const curve = new THREE.CatmullRomCurve3(trackPoints, true, 'catmullrom', 0.5);

    // Road surface
    const roadShape = new THREE.Shape();
    const halfWidth = TRACK.WIDTH / 2;
    roadShape.moveTo(-halfWidth, 0);
    roadShape.lineTo(halfWidth, 0);
    roadShape.lineTo(halfWidth, 0.1);
    roadShape.lineTo(-halfWidth, 0.1);
    roadShape.closePath();

    const roadExtrudeSettings: THREE.ExtrudeGeometryOptions = {
      steps: 200,
      bevelEnabled: false,
      extrudePath: curve,
    };
    const roadGeo = new THREE.ExtrudeGeometry(roadShape, roadExtrudeSettings);

    // Barriers
    const barrierShape = new THREE.Shape();
    barrierShape.moveTo(0, 0);
    barrierShape.lineTo(0.3, 0);
    barrierShape.lineTo(0.3, TRACK.BARRIER_HEIGHT);
    barrierShape.lineTo(0, TRACK.BARRIER_HEIGHT);
    barrierShape.closePath();

    // Offset barrier curves
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
    const groundGeo = new THREE.PlaneGeometry(500, 500);
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
      {/* Sand ground */}
      <mesh geometry={groundMesh} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#f4d03f" roughness={0.9} />
      </mesh>

      {/* Road */}
      <mesh geometry={roadMesh} position={[0, 0, 0]}>
        <meshStandardMaterial color="#333333" roughness={0.8} />
      </mesh>

      {/* Barriers */}
      <mesh geometry={barrierLeftMesh}>
        <meshStandardMaterial color="#ff4444" metalness={0.3} />
      </mesh>
      <mesh geometry={barrierRightMesh}>
        <meshStandardMaterial color="#ffffff" metalness={0.3} />
      </mesh>

      {/* Decorative elements - palm trees along track */}
      <TrackScenery />
    </group>
  );
}

/** Palm trees and rocks scattered along the coast */
function TrackScenery() {
  const trees = useMemo(() => {
    const positions: Array<[number, number, number]> = [];
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2;
      const radius = 80 + Math.random() * 30;
      positions.push([
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius,
      ]);
    }
    return positions;
  }, []);

  return (
    <group>
      {trees.map((pos, i) => (
        <group key={i} position={pos}>
          {/* Trunk */}
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[0.2, 0.3, 6, 8]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          {/* Leaves */}
          <mesh position={[0, 6.5, 0]}>
            <sphereGeometry args={[2, 8, 6]} />
            <meshStandardMaterial color="#228B22" />
          </mesh>
        </group>
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
    // Irregular oval with some variation for interesting curves
    const rx = 60 + Math.sin(angle * 3) * 15;
    const rz = 45 + Math.cos(angle * 2) * 10;
    const x = Math.cos(angle) * rx;
    const z = Math.sin(angle) * rz;
    const y = Math.sin(angle * 4) * 0.5; // Slight elevation changes
    points.push(new THREE.Vector3(x, y, z));
  }

  return points;
}
