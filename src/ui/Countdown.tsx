import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface CountdownProps {
  onComplete: () => void;
}

/**
 * 3-2-1-GO countdown before race starts.
 */
export function Countdown({ onComplete }: CountdownProps) {
  const [count, setCount] = useState(3);
  const [visible, setVisible] = useState(true);
  const scale = useState(new Animated.Value(1))[0];

  useEffect(() => {
    if (count === 0) {
      // Show "GO!" briefly
      setTimeout(() => {
        setVisible(false);
        onComplete();
      }, 500);
      return;
    }

    // Pulse animation each second
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      setCount((c) => c - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [count]);

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Text style={styles.text}>
          {count > 0 ? count : 'GO!'}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  text: {
    fontSize: 120,
    fontWeight: 'bold',
    color: '#ffffff',
    textShadowColor: '#ff0000',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
});
