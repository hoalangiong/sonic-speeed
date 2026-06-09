import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, GestureResponderEvent, LayoutChangeEvent } from 'react-native';
import { VehicleInput } from '../physics/vehicle';

interface TouchControlsProps {
  onInputChange: (input: VehicleInput) => void;
}

/**
 * On-screen touch controls for racing.
 * Uses refs to avoid stale closure issues.
 * Left side: steering (drag left/right)
 * Right bottom: gas (hold)
 * Right top: brake (hold)
 */
export function TouchControls({ onInputChange }: TouchControlsProps) {
  // Use refs to always have current values in callbacks
  const inputRef = useRef<VehicleInput>({ steer: 0, gas: 0, brake: 0 });
  const steerZoneWidth = useRef(300);
  const onInputChangeRef = useRef(onInputChange);
  onInputChangeRef.current = onInputChange;

  const emit = useCallback(() => {
    onInputChangeRef.current({ ...inputRef.current });
  }, []);

  // Steering
  const handleSteerLayout = useCallback((e: LayoutChangeEvent) => {
    steerZoneWidth.current = e.nativeEvent.layout.width;
  }, []);

  const handleSteerMove = useCallback((e: GestureResponderEvent) => {
    const { locationX } = e.nativeEvent;
    const width = steerZoneWidth.current;
    const center = width / 2;
    const steerValue = Math.max(-1, Math.min(1, (locationX - center) / center));
    inputRef.current.steer = steerValue;
    emit();
  }, [emit]);

  const handleSteerEnd = useCallback(() => {
    inputRef.current.steer = 0;
    emit();
  }, [emit]);

  // Gas
  const handleGasStart = useCallback(() => {
    inputRef.current.gas = 1;
    emit();
  }, [emit]);

  const handleGasEnd = useCallback(() => {
    inputRef.current.gas = 0;
    emit();
  }, [emit]);

  // Brake
  const handleBrakeStart = useCallback(() => {
    inputRef.current.brake = 1;
    emit();
  }, [emit]);

  const handleBrakeEnd = useCallback(() => {
    inputRef.current.brake = 0;
    emit();
  }, [emit]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Left: Steering zone */}
      <View
        style={styles.steerZone}
        onLayout={handleSteerLayout}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderMove={handleSteerMove}
        onResponderRelease={handleSteerEnd}
        onResponderTerminate={handleSteerEnd}
      />

      {/* Right side controls */}
      <View style={styles.rightControls}>
        {/* Brake button (top) */}
        <View
          style={styles.brakeButton}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleBrakeStart}
          onResponderRelease={handleBrakeEnd}
          onResponderTerminate={handleBrakeEnd}
        />

        {/* Gas button (bottom) */}
        <View
          style={styles.gasButton}
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
  },
  rightControls: {
    width: 140,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 30,
    gap: 20,
  },
  gasButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(0, 200, 0, 0.5)',
    borderWidth: 3,
    borderColor: 'rgba(0, 255, 0, 0.8)',
  },
  brakeButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(200, 0, 0, 0.5)',
    borderWidth: 3,
    borderColor: 'rgba(255, 0, 0, 0.8)',
  },
});
