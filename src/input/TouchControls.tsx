import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { VehicleInput } from '../physics/vehicle';

interface TouchControlsProps {
  onInputChange: (input: VehicleInput) => void;
  onNitroPress?: () => void;
  nitroAvailable?: boolean;
}

/**
 * D-Pad style controls:
 * LEFT SIDE: ← → arrows for steering
 * RIGHT SIDE: ↑ gas, ↓ reverse/brake
 * CENTER-RIGHT: N₂O nitro button
 */
export function TouchControls({ onInputChange, onNitroPress, nitroAvailable = false }: TouchControlsProps) {
  const inputRef = useRef<VehicleInput>({ steer: 0, gas: 0, brake: 0, nitro: false });
  const onInputChangeRef = useRef(onInputChange);
  onInputChangeRef.current = onInputChange;

  const emit = useCallback(() => {
    onInputChangeRef.current({ ...inputRef.current });
  }, []);

  // === LEFT: Steering ===
  const handleLeftStart = useCallback(() => {
    inputRef.current.steer = -1;
    emit();
  }, [emit]);

  const handleLeftEnd = useCallback(() => {
    inputRef.current.steer = 0;
    emit();
  }, [emit]);

  const handleRightStart = useCallback(() => {
    inputRef.current.steer = 1;
    emit();
  }, [emit]);

  const handleRightEnd = useCallback(() => {
    inputRef.current.steer = 0;
    emit();
  }, [emit]);

  // === RIGHT: Gas / Reverse ===
  const handleGasStart = useCallback(() => {
    inputRef.current.gas = 1;
    inputRef.current.brake = 0;
    emit();
  }, [emit]);

  const handleGasEnd = useCallback(() => {
    inputRef.current.gas = 0;
    emit();
  }, [emit]);

  const handleReverseStart = useCallback(() => {
    inputRef.current.brake = 1;
    inputRef.current.gas = 0;
    emit();
  }, [emit]);

  const handleReverseEnd = useCallback(() => {
    inputRef.current.brake = 0;
    emit();
  }, [emit]);

  // === NITRO ===
  const handleNitroPress = useCallback(() => {
    if (onNitroPress) onNitroPress();
  }, [onNitroPress]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* LEFT: Steering arrows */}
      <View style={styles.leftControls}>
        <View
          style={styles.arrowButton}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleLeftStart}
          onResponderRelease={handleLeftEnd}
          onResponderTerminate={handleLeftEnd}
        >
          <Text style={styles.arrowText}>◀</Text>
        </View>

        <View
          style={styles.arrowButton}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleRightStart}
          onResponderRelease={handleRightEnd}
          onResponderTerminate={handleRightEnd}
        >
          <Text style={styles.arrowText}>▶</Text>
        </View>
      </View>

      {/* RIGHT: Gas/Reverse + Nitro */}
      <View style={styles.rightControls}>
        {/* Nitro */}
        <View
          style={[styles.nitroButton, nitroAvailable && styles.nitroAvailable]}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleNitroPress}
        >
          <Text style={styles.nitroText}>N₂O</Text>
        </View>

        {/* Gas (up arrow) */}
        <View
          style={styles.gasButton}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleGasStart}
          onResponderRelease={handleGasEnd}
          onResponderTerminate={handleGasEnd}
        >
          <Text style={styles.arrowTextLarge}>▲</Text>
        </View>

        {/* Reverse/Brake (down arrow) */}
        <View
          style={styles.brakeButton}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleReverseStart}
          onResponderRelease={handleReverseEnd}
          onResponderTerminate={handleReverseEnd}
        >
          <Text style={styles.arrowTextLarge}>▼</Text>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  // Left: ← →
  leftControls: {
    flexDirection: 'row',
    gap: 12,
  },
  arrowButton: {
    width: 75,
    height: 75,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowText: {
    fontSize: 28,
    color: '#ffffff',
  },
  arrowTextLarge: {
    fontSize: 32,
    color: '#ffffff',
  },
  // Right: ↑ ↓ + N₂O
  rightControls: {
    alignItems: 'center',
    gap: 10,
  },
  nitroButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 100, 200, 0.3)',
    borderWidth: 2,
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
    fontSize: 12,
    fontWeight: 'bold',
  },
  gasButton: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 200, 0, 0.4)',
    borderWidth: 3,
    borderColor: 'rgba(0, 255, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brakeButton: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: 'rgba(200, 0, 0, 0.4)',
    borderWidth: 3,
    borderColor: 'rgba(255, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
