import React, { useState, useCallback } from 'react';
import { View, StyleSheet, GestureResponderEvent } from 'react-native';
import { VehicleInput } from '../physics/vehicle';

interface TouchControlsProps {
  onInputChange: (input: VehicleInput) => void;
}

/**
 * On-screen touch controls for racing.
 * Left side: steering (drag left/right)
 * Right bottom: gas (hold)
 * Right top: brake (hold)
 */
export function TouchControls({ onInputChange }: TouchControlsProps) {
  const [steer, setSteer] = useState(0);
  const [gas, setGas] = useState(0);
  const [brake, setBrake] = useState(0);

  const handleSteerMove = useCallback((e: GestureResponderEvent) => {
    const { locationX, pageX } = e.nativeEvent;
    // Map touch X position to -1..1 steering range
    // Assuming left half of screen is steering zone
    const width = 200; // Approximate zone width
    const center = width / 2;
    const steerValue = Math.max(-1, Math.min(1, (locationX - center) / center));
    setSteer(steerValue);
    onInputChange({ steer: steerValue, gas, brake });
  }, [gas, brake, onInputChange]);

  const handleSteerEnd = useCallback(() => {
    setSteer(0);
    onInputChange({ steer: 0, gas, brake });
  }, [gas, brake, onInputChange]);

  const handleGasStart = useCallback(() => {
    setGas(1);
    onInputChange({ steer, gas: 1, brake });
  }, [steer, brake, onInputChange]);

  const handleGasEnd = useCallback(() => {
    setGas(0);
    onInputChange({ steer, gas: 0, brake });
  }, [steer, brake, onInputChange]);

  const handleBrakeStart = useCallback(() => {
    setBrake(1);
    onInputChange({ steer, gas, brake: 1 });
  }, [steer, gas, onInputChange]);

  const handleBrakeEnd = useCallback(() => {
    setBrake(0);
    onInputChange({ steer, gas, brake: 0 });
  }, [steer, gas, onInputChange]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Left: Steering zone */}
      <View
        style={styles.steerZone}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderMove={handleSteerMove}
        onResponderRelease={handleSteerEnd}
        onResponderTerminate={handleSteerEnd}
      >
        <View style={[styles.steerIndicator, { left: `${50 + steer * 40}%` }]} />
      </View>

      {/* Right side controls */}
      <View style={styles.rightControls}>
        {/* Brake button (top) */}
        <View
          style={[styles.brakeButton, brake > 0 && styles.brakeActive]}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleBrakeStart}
          onResponderRelease={handleBrakeEnd}
          onResponderTerminate={handleBrakeEnd}
        />

        {/* Gas button (bottom) */}
        <View
          style={[styles.gasButton, gas > 0 && styles.gasActive]}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleGasStart}
          onResponderRelease={handleGasEnd}
          onResponderTerminate={handleGasEnd}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  steerZone: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 40,
  },
  steerIndicator: {
    position: 'absolute',
    bottom: 50,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.8)',
  },
  rightControls: {
    width: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 30,
    gap: 20,
  },
  gasButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 200, 0, 0.4)',
    borderWidth: 3,
    borderColor: 'rgba(0, 255, 0, 0.6)',
  },
  gasActive: {
    backgroundColor: 'rgba(0, 255, 0, 0.7)',
  },
  brakeButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(200, 0, 0, 0.4)',
    borderWidth: 3,
    borderColor: 'rgba(255, 0, 0, 0.6)',
  },
  brakeActive: {
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
  },
});
