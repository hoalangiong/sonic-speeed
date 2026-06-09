import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber/native';
import * as THREE from 'three';
import { CAMERA } from '../constants';

/**
 * 3rd person chase camera that smoothly follows the player car.
 * Attaches to the default camera and updates each frame.
 */
export function ChaseCamera() {
  const { camera } = useThree();
  const targetPosition = useRef(new THREE.Vector3(0, 2, 10));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame(() => {
    // Get car transform from global store (set by Car component)
    const carState = (global as any).__SONIC_CAR_STATE__;
    if (!carState) return;

    const { position, quaternion } = carState;

    // Calculate forward direction from quaternion
    const forward = new THREE.Vector3(0, 0, -1);
    const quat = new THREE.Quaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
    forward.applyQuaternion(quat);

    // Desired camera position: behind and above the car
    const desiredPos = new THREE.Vector3(
      position.x - forward.x * CAMERA.OFFSET_BEHIND,
      position.y + CAMERA.OFFSET_ABOVE,
      position.z - forward.z * CAMERA.OFFSET_BEHIND,
    );

    // Desired look-at: ahead of the car
    const desiredLookAt = new THREE.Vector3(
      position.x + forward.x * CAMERA.LOOK_AHEAD,
      position.y + 1,
      position.z + forward.z * CAMERA.LOOK_AHEAD,
    );

    // Smooth interpolation (damping)
    targetPosition.current.lerp(desiredPos, CAMERA.DAMPING);
    targetLookAt.current.lerp(desiredLookAt, CAMERA.DAMPING);

    camera.position.copy(targetPosition.current);
    camera.lookAt(targetLookAt.current);
  });

  return null; // This component only controls the camera, no visual output
}
