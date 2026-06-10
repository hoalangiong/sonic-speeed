import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, GestureResponderEvent, LayoutChangeEvent, Text } from 'react-native';
import { VehicleInput } from '../physics/vehicle';

interface TouchControlsProps {
  onInputChange: (input: VehicleInput) => void;
  onNitroPress?: () => void;
  nitroAvailable?: boolean;
}

/**
 * On-screen touch controls for racing.
 * Uses refs to avoid stale closure issues.
 * Left side: steering | Right: gas/brake/nitro
 */
export function TouchControls({ onInputChange, onNitroPress, nitroAvailable = false }: TouchControlsProps) {
  const inputRef = useRef<VehicleInput>({ steer: 0, gas: 0, brake: 0, nitro: false });
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

  // Nitro
  const handleNitroPress = useCallback(() => {
    if (onNitroPress) onNitroPress();
  }, [onNitroPress]);

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
        {/* Nitro button (top) */}
        <View
          style={[styles.nitroButton, nitroAvailable && styles.nitroAvailable]}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleNitroPress}
        >
          <Text style={styles.nitroText}>N₂O</Text>
        </View>

        {/* Brake button (middle) */}
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
    width: 130,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
    gap: 12,
  },
  nitroButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(0, 100, 200, 0.3)',
    borderWidth: 3,
    borderColor: 'rgba(0, 150, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nitroAvailable: {
    backgroundColor: 'rgba(0, 150, 255, 0.6)',
    borderColor: 'rgba(0, 200, 255, 1)',
  },
  nitroText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  gasButton: {
    width: 85,
    height: 85,
    borderRadius: 42,
    backgroundColor: 'rgba(0, 200, 0, 0.5)',
    borderWidth: 3,
    borderColor: 'rgba(0, 255, 0, 0.8)',
  },
  brakeButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(200, 0, 0, 0.5)',
    borderWidth: 3,
    borderColor: 'rgba(255, 0, 0, 0.8)',
  },
});
