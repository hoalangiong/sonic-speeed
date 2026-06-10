import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

interface MinimapProps {
  playerPosition: { x: number; z: number };
  aiCount: number;
}

/**
 * Top-down minimap showing track outline + car positions.
 */
export function Minimap({ playerPosition, aiCount }: MinimapProps) {
  const [aiPositions, setAiPositions] = useState<Array<{ x: number; z: number }>>([]);

  // Poll AI positions
  useEffect(() => {
    const interval = setInterval(() => {
      const positions: Array<{ x: number; z: number }> = [];
      for (let i = 0; i < aiCount; i++) {
        const ai = (global as any)[`__AI_CAR_${i}__`];
        if (ai) positions.push({ x: ai.x, z: ai.z });
      }
      setAiPositions(positions);
    }, 200); // Update 5 times per second
    return () => clearInterval(interval);
  }, [aiCount]);

  // Map world coords to minimap coords
  // Track spans roughly -90 to 90 in X, -70 to 70 in Z
  const mapSize = 100;
  const scale = mapSize / 200; // world range ~200 units

  const toMiniX = (x: number) => (x * scale) + mapSize / 2;
  const toMiniY = (z: number) => (z * scale) + mapSize / 2;

  return (
    <View style={styles.container}>
      {/* Track outline (simplified oval) */}
      <View style={styles.trackOutline} />

      {/* Player dot (yellow) */}
      <View
        style={[
          styles.playerDot,
          {
            left: toMiniX(playerPosition.x) - 4,
            top: toMiniY(playerPosition.z) - 4,
          },
        ]}
      />

      {/* AI dots (red) */}
      {aiPositions.map((ai, i) => (
        <View
          key={i}
          style={[
            styles.aiDot,
            {
              left: toMiniX(ai.x) - 3,
              top: toMiniY(ai.z) - 3,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 15,
    width: 100,
    height: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  trackOutline: {
    position: 'absolute',
    top: 15,
    left: 10,
    width: 80,
    height: 70,
    borderRadius: 35,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  playerDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffcc00',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  aiDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ff3333',
  },
});
