import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HUDProps {
  speed: number;       // km/h
  position: number;    // race position (1st, 2nd, etc)
  lap: number;         // current lap
  totalLaps: number;   // total laps in race
}

/**
 * Heads-up display overlay showing race info.
 */
export function HUD({ speed, position, lap, totalLaps }: HUDProps) {
  return (
    <View style={styles.container} pointerEvents="none">
      {/* Speed */}
      <View style={styles.speedContainer}>
        <Text style={styles.speedValue}>{Math.round(speed)}</Text>
        <Text style={styles.speedUnit}>km/h</Text>
      </View>

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
  speedUnit: {
    fontSize: 16,
    color: '#cccccc',
    marginBottom: 8,
    marginLeft: 4,
  },
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
