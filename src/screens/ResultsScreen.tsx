import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Results'>;

export function ResultsScreen({ navigation, route }: Props) {
  const results = route.params?.results || [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏁 RACE COMPLETE</Text>

      {/* Results list */}
      <View style={styles.resultsList}>
        {results.length > 0 ? (
          results.map((result: any, index: number) => (
            <View key={result.id || index} style={styles.resultRow}>
              <Text style={[styles.position, index === 0 && styles.winner]}>
                {index + 1}
              </Text>
              <Text style={styles.playerName}>{result.id?.slice(0, 8) || 'You'}</Text>
              <Text style={styles.time}>{formatTime(result.time)}</Text>
            </View>
          ))
        ) : (
          <View style={styles.resultRow}>
            <Text style={[styles.position, styles.winner]}>1</Text>
            <Text style={styles.playerName}>You</Text>
            <Text style={styles.time}>Free Drive</Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('MainMenu')}
      >
        <Text style={styles.buttonText}>MAIN MENU</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonPlay]}
        onPress={() => navigation.navigate('Lobby')}
      >
        <Text style={styles.buttonText}>RACE AGAIN</Text>
      </TouchableOpacity>
    </View>
  );
}

function formatTime(ms: number): string {
  if (!ms) return '--:--';
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const millis = Math.floor((ms % 1000) / 10);
  return `${min}:${sec.toString().padStart(2, '0')}.${millis.toString().padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a2e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffcc00',
    marginBottom: 40,
  },
  resultsList: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  position: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#888',
    width: 40,
  },
  winner: {
    color: '#ffcc00',
  },
  playerName: {
    flex: 1,
    fontSize: 18,
    color: '#ffffff',
  },
  time: {
    fontSize: 16,
    color: '#87CEEB',
    fontFamily: 'monospace',
  },
  button: {
    width: '80%',
    paddingVertical: 16,
    backgroundColor: '#555',
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonPlay: {
    backgroundColor: '#ff4400',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
});
