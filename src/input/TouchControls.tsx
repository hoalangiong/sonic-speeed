import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { VehicleInput } from '../physics/vehicle';

interface TouchControlsProps {
  onInputChange: (input: VehicleInput) => void;
  onNitroPress?: () => void;
  onExitPress?: () => void;
  nitroAvailable?: boolean;
}

/**
 * Drive X style controls layout:
 * LEFT TOP: ∧ ∨ (gas/reverse)
 * LEFT BOTTOM: ◀ ▶ (steering)
 * RIGHT: menu buttons + nitro
 */
export function TouchControls({ onInputChange, onNitroPress, onExitPress, nitroAvailable = false }: TouchControlsProps) {
  const inputRef = useRef<VehicleInput>({ steer: 0, gas: 0, brake: 0, nitro: false });
  const onInputChangeRef = useRef(onInputChange);
  onInputChangeRef.current = onInputChange;

  const emit = useCallback(() => {
    onInputChangeRef.current({ ...inputRef.current });
  }, []);

  // Gas (up)
  const handleGasStart = useCallback(() => {
    inputRef.current.gas = 1;
    inputRef.current.brake = 0;
    emit();
  }, [emit]);
  const handleGasEnd = useCallback(() => {
    inputRef.current.gas = 0;
    emit();
  }, [emit]);

  // Reverse (down)
  const handleReverseStart = useCallback(() => {
    inputRef.current.brake = 1;
    inputRef.current.gas = 0;
    emit();
  }, [emit]);
  const handleReverseEnd = useCallback(() => {
    inputRef.current.brake = 0;
    emit();
  }, [emit]);

  // Steer left
  const handleLeftStart = useCallback(() => {
    inputRef.current.steer = -1;
    emit();
  }, [emit]);
  const handleLeftEnd = useCallback(() => {
    inputRef.current.steer = 0;
    emit();
  }, [emit]);

  // Steer right
  const handleRightStart = useCallback(() => {
    inputRef.current.steer = 1;
    emit();
  }, [emit]);
  const handleRightEnd = useCallback(() => {
    inputRef.current.steer = 0;
    emit();
  }, [emit]);

  // Nitro
  const handleNitroPress = useCallback(() => {
    if (onNitroPress) onNitroPress();
  }, [onNitroPress]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* === LEFT SIDE === */}
      <View style={styles.leftSide}>
        {/* Gas / Reverse — top left */}
        <View style={styles.verticalButtons}>
          <View
            style={styles.btnDark}
            onStartShouldSetResponder={() => true}
            onResponderGrant={handleGasStart}
            onResponderRelease={handleGasEnd}
            onResponderTerminate={handleGasEnd}
          >
            <Text style={styles.chevron}>∧</Text>
          </View>
          <View
            style={styles.btnDark}
            onStartShouldSetResponder={() => true}
            onResponderGrant={handleReverseStart}
            onResponderRelease={handleReverseEnd}
            onResponderTerminate={handleReverseEnd}
          >
            <Text style={styles.chevron}>∨</Text>
          </View>
        </View>

        {/* Exit button */}
        <TouchableOpacity style={styles.exitButton} onPress={onExitPress}>
          <Text style={styles.exitText}>THOÁT</Text>
        </TouchableOpacity>

        {/* Steering — bottom left */}
        <View style={styles.steeringButtons}>
          <View
            style={styles.steerBtn}
            onStartShouldSetResponder={() => true}
            onResponderGrant={handleLeftStart}
            onResponderRelease={handleLeftEnd}
            onResponderTerminate={handleLeftEnd}
          >
            <Text style={styles.steerChevron}>❮</Text>
          </View>
          <View
            style={styles.steerBtn}
            onStartShouldSetResponder={() => true}
            onResponderGrant={handleRightStart}
            onResponderRelease={handleRightEnd}
            onResponderTerminate={handleRightEnd}
          >
            <Text style={styles.steerChevron}>❯</Text>
          </View>
        </View>
      </View>

      {/* === RIGHT SIDE === */}
      <View style={styles.rightSide}>
        {/* Nitro button */}
        <View
          style={[styles.nitroBtn, nitroAvailable && styles.nitroBtnActive]}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleNitroPress}
        >
          <Text style={styles.nitroIcon}>⚡</Text>
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
  },
  // Left side
  leftSide: {
    justifyContent: 'space-between',
    paddingLeft: 15,
    paddingVertical: 15,
  },
  verticalButtons: {
    gap: 8,
  },
  btnDark: {
    width: 65,
    height: 65,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 30, 40, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  chevron: {
    fontSize: 28,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  exitButton: {
    backgroundColor: '#e63946',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  exitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  steeringButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  steerBtn: {
    width: 70,
    height: 70,
    borderRadius: 16,
    backgroundColor: 'rgba(30, 30, 40, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  steerChevron: {
    fontSize: 30,
    color: '#f0c040',
    fontWeight: 'bold',
  },
  // Right side
  rightSide: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingRight: 15,
    paddingBottom: 20,
  },
  nitroBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(30, 30, 40, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0, 150, 255, 0.4)',
  },
  nitroBtnActive: {
    backgroundColor: 'rgba(0, 100, 255, 0.7)',
    borderColor: '#00ccff',
  },
  nitroIcon: {
    fontSize: 24,
  },
});
