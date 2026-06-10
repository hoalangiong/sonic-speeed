import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HUDProps {
  speed: number;
  position: number;
  lap: number;
  totalLaps: number;
  nitro: number;
  nitroActive: boolean;
  driftScore: number;
  driftMultiplier: number;
  isDrifting: boolean;
  money?: number;
}

/**
 * Drive X style HUD:
 * - Bottom center: speed + RPM bar
 * - Top right: money, fuel/nitro
 * - Center: drift popup
 */
export function HUD({
  speed, position, lap, totalLaps,
  nitro, nitroActive,
  driftScore, driftMultiplier, isDrifting,
  money = 0,
}: HUDProps) {
  const rpm = Math.min(100, (speed / 300) * 100);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* === TOP RIGHT: Money + Nitro gauge === */}
      <View style={styles.topRight}>
        <View style={styles.moneyBox}>
          <Text style={styles.moneyIcon}>💰</Text>
          <Text style={styles.moneyText}>${money.toLocaleString()}</Text>
        </View>
        <View style={styles.fuelBox}>
          <Text style={styles.fuelIcon}>⚡</Text>
          <Text style={styles.fuelText}>{Math.round(nitro)}%</Text>
        </View>
        <View style={styles.lapBox}>
          <Text style={styles.lapText}>LAP {lap}/{totalLaps}</Text>
        </View>
      </View>

      {/* === TOP LEFT: Position === */}
      <View style={styles.topLeft}>
        <View style={styles.posBox}>
          <Text style={styles.posText}>{position}</Text>
          <Text style={styles.posSuffix}>{getOrdinal(position)}</Text>
        </View>
      </View>

      {/* === BOTTOM CENTER: Speedometer + RPM === */}
      <View style={styles.speedPanel}>
        {/* RPM Bar */}
        <View style={styles.rpmBarBg}>
          <View style={[
            styles.rpmBarFill,
            { width: `${rpm}%` },
            rpm > 80 && styles.rpmRedline,
            nitroActive && styles.rpmNitro,
          ]} />
        </View>
        {/* Speed number */}
        <View style={styles.speedRow}>
          <Text style={[styles.speedValue, nitroActive && styles.speedNitro]}>
            {String(Math.round(speed)).padStart(3, '0')}
          </Text>
          <Text style={styles.speedUnit}>km/h</Text>
        </View>
      </View>

      {/* === DRIFT POPUP === */}
      {isDrifting && (
        <View style={styles.driftPopup}>
          <Text style={styles.driftText}>DRIFT!</Text>
          <Text style={styles.driftMulti}>x{driftMultiplier}</Text>
          <Text style={styles.driftPts}>+{Math.round(driftScore)}</Text>
        </View>
      )}
    </View>
  );
}

function getOrdinal(n: number): string {
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
  },
  // Top right panel
  topRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    gap: 6,
    alignItems: 'flex-end',
  },
  moneyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20,20,30,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  moneyIcon: {
    fontSize: 14,
  },
  moneyText: {
    color: '#44dd44',
    fontWeight: 'bold',
    fontSize: 14,
  },
  fuelBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20,20,30,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  fuelIcon: {
    fontSize: 14,
  },
  fuelText: {
    color: '#00ccff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  lapBox: {
    backgroundColor: 'rgba(20,20,30,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  lapText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
  // Top left
  topLeft: {
    position: 'absolute',
    top: 10,
    left: 80,
  },
  posBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(20,20,30,0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  posText: {
    color: '#ffcc00',
    fontSize: 24,
    fontWeight: 'bold',
  },
  posSuffix: {
    color: '#ffcc00',
    fontSize: 12,
    marginTop: 2,
  },
  // Bottom center speedometer
  speedPanel: {
    position: 'absolute',
    bottom: 15,
    alignSelf: 'center',
    left: '30%',
    right: '30%',
    alignItems: 'center',
  },
  rpmBarBg: {
    width: 160,
    height: 10,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 5,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  rpmBarFill: {
    height: '100%',
    backgroundColor: '#44cc44',
    borderRadius: 5,
  },
  rpmRedline: {
    backgroundColor: '#ff4444',
  },
  rpmNitro: {
    backgroundColor: '#00ccff',
  },
  speedRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 2,
  },
  speedValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    fontFamily: 'monospace',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  speedNitro: {
    color: '#00ddff',
    textShadowColor: '#0066ff',
    textShadowRadius: 8,
  },
  speedUnit: {
    color: '#aaaaaa',
    fontSize: 12,
    marginBottom: 6,
    marginLeft: 3,
  },
  // Drift popup
  driftPopup: {
    position: 'absolute',
    top: '35%',
    alignSelf: 'center',
    alignItems: 'center',
  },
  driftText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff8800',
    textShadowColor: '#ff4400',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  driftMulti: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#ffcc00',
  },
  driftPts: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
