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
 * Drive X layout:
 * BOTTOM LEFT: ◀ ▶ steering
 * BOTTOM RIGHT: ▲ gas, ▼ brake/reverse
 * TOP LEFT: THOÁT button
 * TOP RIGHT: N₂O
 */
export function TouchControls({ onInputChange, onNitroPress, onExitPress, nitroAvailable = false }: TouchControlsProps) {
  const inputRef = useRef<VehicleInput>({ steer: 0, gas: 0, brake: 0, nitro: false });
  const onInputChangeRef = useRef(onInputChange);
  onInputChangeRef.current = onInputChange;

  const emit = useCallback(() => {
    onInputChangeRef.current({ ...inputRef.current });
  }, []);

  // Steer left
  const handleLeftStart = useCallback(() => { inputRef.current.steer = -1; emit(); }, [emit]);
  const handleLeftEnd = useCallback(() => { inputRef.current.steer = 0; emit(); }, [emit]);

  // Steer right
  const handleRightStart = useCallback(() => { inputRef.current.steer = 1; emit(); }, [emit]);
  const handleRightEnd = useCallback(() => { inputRef.current.steer = 0; emit(); }, [emit]);

  // Gas
  const handleGasStart = useCallback(() => { inputRef.current.gas = 1; inputRef.current.brake = 0; emit(); }, [emit]);
  const handleGasEnd = useCallback(() => { inputRef.current.gas = 0; emit(); }, [emit]);

  // Brake/Reverse
  const handleBrakeStart = useCallback(() => { inputRef.current.brake = 1; inputRef.current.gas = 0; emit(); }, [emit]);
  const handleBrakeEnd = useCallback(() => { inputRef.current.brake = 0; emit(); }, [emit]);

  // Nitro
  const handleNitroPress = useCallback(() => { if (onNitroPress) onNitroPress(); }, [onNitroPress]);

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* TOP LEFT — Exit */}
      <TouchableOpacity style={styles.exitBtn} onPress={onExitPress}>
        <Text style={styles.exitText}>THOÁT</Text>
      </TouchableOpacity>

      {/* TOP RIGHT — Nitro */}
      <View
        style={[styles.nitroBtn, nitroAvailable && styles.nitroBtnActive]}
        onStartShouldSetResponder={() => true}
        onResponderGrant={handleNitroPress}
      >
        <Text style={styles.nitroText}>⚡N₂O</Text>
      </View>

      {/* BOTTOM LEFT — Steering ◀ ▶ */}
      <View style={styles.bottomLeft}>
        <View
          style={styles.steerBtnLeft}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleLeftStart}
          onResponderRelease={handleLeftEnd}
          onResponderTerminate={handleLeftEnd}
        >
          <Text style={styles.arrowYellow}>◀</Text>
        </View>
        <View
          style={styles.steerBtnRight}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleRightStart}
          onResponderRelease={handleRightEnd}
          onResponderTerminate={handleRightEnd}
        >
          <Text style={styles.arrowYellow}>▶</Text>
        </View>
      </View>

      {/* BOTTOM RIGHT — Gas ▲ / Brake ▼ */}
      <View style={styles.bottomRight}>
        <View
          style={styles.gasBtn}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleGasStart}
          onResponderRelease={handleGasEnd}
          onResponderTerminate={handleGasEnd}
        >
          <Text style={styles.arrowWhite}>▲</Text>
        </View>
        <View
          style={styles.brakeBtn}
          onStartShouldSetResponder={() => true}
          onResponderGrant={handleBrakeStart}
          onResponderRelease={handleBrakeEnd}
          onResponderTerminate={handleBrakeEnd}
        >
          <Text style={styles.arrowWhite}>▼</Text>
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
  },
  // Top left exit
  exitBtn: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: '#e63946',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exitText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // Top right nitro
  nitroBtn: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 55,
    height: 55,
    borderRadius: 28,
    backgroundColor: 'rgba(20,20,30,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,120,255,0.4)',
  },
  nitroBtnActive: {
    backgroundColor: 'rgba(0,100,255,0.7)',
    borderColor: '#00ccff',
  },
  nitroText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  // Bottom left — steering
  bottomLeft: {
    position: 'absolute',
    bottom: 25,
    left: 20,
    flexDirection: 'row',
    gap: 15,
  },
  steerBtnLeft: {
    width: 75,
    height: 75,
    borderRadius: 18,
    backgroundColor: 'rgba(20,20,30,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(240,200,50,0.5)',
  },
  steerBtnRight: {
    width: 75,
    height: 75,
    borderRadius: 18,
    backgroundColor: 'rgba(20,20,30,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(240,200,50,0.5)',
  },
  arrowYellow: {
    fontSize: 32,
    color: '#f0c830',
  },
  // Bottom right — gas/brake
  bottomRight: {
    position: 'absolute',
    bottom: 25,
    right: 20,
    gap: 12,
    alignItems: 'center',
  },
  gasBtn: {
    width: 80,
    height: 80,
    borderRadius: 18,
    backgroundColor: 'rgba(0,180,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(0,255,0,0.7)',
  },
  brakeBtn: {
    width: 80,
    height: 80,
    borderRadius: 18,
    backgroundColor: 'rgba(200,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,0,0,0.7)',
  },
  arrowWhite: {
    fontSize: 34,
    color: '#ffffff',
  },
});
