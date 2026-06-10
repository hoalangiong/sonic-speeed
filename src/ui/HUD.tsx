import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HUDProps {
  speed: number;
  position: number;
  lap: number;
  totalLaps: number;
  nitro: number;          // 0-100
  nitroActive: boolean;
  driftScore: number;
  driftMultiplier: number;
  isDrifting: boolean;
}

/**
 * Heads-up display overlay showing race info, nitro bar, drift score.
 */
export function HUD({
  speed, position, lap, totalLaps,
  nitro, nitroActive,
  driftScore, driftMultiplier, isDrifting,
}: HUDProps) {
  return (
    <View style={styles.container} pointerEvents="none">
      {/* Speed */}
      <View style={styles.speedContainer}>
        <Text style={[styles.speedValue, nitroActive && styles.speedNitro]}>
          {Math.round(speed)}
        </Text>
        <Text style={styles.speedUnit}>km/h</Text>
      </View>

      {/* Nitro Bar */}
      <View style={styles.nitroBarContainer}>
        <View style={styles.nitroBarBg}>
          <View
            style={[
              styles.nitroBarFill,
              { width: `${nitro}%` },
              nitroActive && styles.nitroBarActive,
            ]}
          />
        </View>
        <Text style={styles.nitroLabel}>NITRO</Text>
      </View>

      {/* Drift Score */}
      {isDrifting && (
        <View style={styles.driftContainer}>
          <Text style={styles.driftText}>DRIFT!</Text>
          <Text style={styles.driftMultiplier}>x{driftMultiplier}</Text>
          <Text style={styles.driftScore}>+{Math.round(driftScore)}</Text>
        </View>
      )}

      {/* Position */}
      <View style={styles.positionContainer}>
        <Text style={styles.positionValue}>{position}</Text>
        <Text style={styles.positionSuffix}>{getOrdinalSuffix(position)}</Text>
      </View>

      {/* Lap counter */}
      <View style={styles.lapContainer}>
        <Text style={styles.lapText}>LAP {lap}/{totalLaps}</Text>
      </View>
    </View>
  );
}

function getOrdinalSuffix(n: number): string {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
  },
  speedContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  speedValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  speedNitro: {
    color: '#00ddff',
    textShadowColor: '#0088ff',
    textShadowRadius: 10,
  },
  speedUnit: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 8,
    marginLeft: 4,
  },
  // Nitro bar
  nitroBarContainer: {
    position: 'absolute',
    bottom: 85,
    left: 20,
    width: 150,
  },
  nitroBarBg: {
    height: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0,150,255,0.5)',
    overflow: 'hidden',
  },
  nitroBarFill: {
    height: '100%',
    backgroundColor: '#0099ff',
    borderRadius: 6,
  },
  nitroBarActive: {
    backgroundColor: '#00ffff',
  },
  nitroLabel: {
    fontSize: 10,
    color: '#88ccff',
    marginTop: 2,
    fontWeight: 'bold',
  },
  // Drift score
  driftContainer: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    left: '35%',
    alignItems: 'center',
  },
  driftText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ff8800',
    textShadowColor: '#ff4400',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  driftMultiplier: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffcc00',
    textShadowColor: '#ff8800',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  driftScore: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  // Position
  positionContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  positionValue: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#ffcc00',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  positionSuffix: {
    fontSize: 20,
    color: '#ffcc00',
    marginTop: 8,
  },
  // Lap
  lapContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  lapText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
