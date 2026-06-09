import { useState, useEffect, useRef } from 'react';
import { Accelerometer } from 'expo-sensors';

/**
 * Optional accelerometer-based steering.
 * Returns tilt value from -1 (left) to 1 (right).
 */
export function useAccelerometer(enabled: boolean = false) {
  const [steer, setSteer] = useState(0);
  const subscription = useRef<ReturnType<typeof Accelerometer.addListener> | null>(null);

  useEffect(() => {
    if (!enabled) {
      setSteer(0);
      return;
    }

    Accelerometer.setUpdateInterval(16); // ~60fps

    subscription.current = Accelerometer.addListener(({ x }) => {
      // x axis maps to left/right tilt
      // Clamp to -1..1, apply dead zone
      const deadZone = 0.05;
      const sensitivity = 2.5;
      let value = x * sensitivity;

      if (Math.abs(value) < deadZone) value = 0;
      value = Math.max(-1, Math.min(1, value));

      setSteer(value);
    });

    return () => {
      subscription.current?.remove();
      subscription.current = null;
    };
  }, [enabled]);

  return steer;
}
