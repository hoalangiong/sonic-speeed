import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'MainMenu'>;

export function MainMenuScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <View style={styles.bg} />

      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>SONIC</Text>
        <Text style={styles.titleAccent}>SPEEED</Text>
        <Text style={styles.subtitle}>🏎️ Coastal Racing 🌊</Text>

        {/* Buttons */}
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Lobby')}
        >
          <Text style={styles.buttonText}>PLAY ONLINE</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => navigation.navigate('Race', { mode: 'solo' })}
        >
          <Text style={styles.buttonText}>FREE DRIVE</Text>
        </TouchableOpacity>
      </View>

      {/* Version */}
      <Text style={styles.version}>v0.1.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a2e',
  },
  bg: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0a0a2e',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  title: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 8,
  },
  titleAccent: {
    fontSize: 72,
    fontWeight: 'bold',
    color: '#ffcc00',
    letterSpacing: 4,
    marginTop: -10,
  },
  subtitle: {
    fontSize: 18,
    color: '#87CEEB',
    marginTop: 10,
    marginBottom: 60,
  },
  button: {
    width: '80%',
    paddingVertical: 18,
    backgroundColor: '#ff4400',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    elevation: 5,
    shadowColor: '#ff4400',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  buttonSecondary: {
    backgroundColor: '#0077be',
    shadowColor: '#0077be',
  },
  buttonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 2,
  },
  version: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    color: '#555',
    fontSize: 12,
  },
});
