import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';

export type MapId = 'coastal' | 'tokyo' | 'desert' | 'snow';

interface MapInfo {
  id: MapId;
  name: string;
  description: string;
  emoji: string;
  color: string;
}

const MAPS: MapInfo[] = [
  { id: 'coastal', name: 'Coastal Highway', description: 'Đường ven biển núi, hoàng hôn', emoji: '🌊', color: '#0077be' },
  { id: 'tokyo', name: 'Tokyo Night', description: 'Đường phố đêm, đèn neon rực rỡ', emoji: '🌃', color: '#6600aa' },
  { id: 'desert', name: 'Desert Storm', description: 'Sa mạc hoàng hôn, tốc độ max', emoji: '🏜️', color: '#cc6600' },
  { id: 'snow', name: 'Snow Alps', description: 'Núi tuyết, đường trơn, tuyết rơi', emoji: '❄️', color: '#4488aa' },
];

type Props = NativeStackScreenProps<RootStackParamList, 'MapSelect'>;

export function MapSelectScreen({ navigation }: Props) {
  const handleSelect = (mapId: MapId) => {
    navigation.navigate('Race', { mode: 'solo', map: mapId });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>CHỌN MAP</Text>

      <ScrollView contentContainerStyle={styles.mapList} horizontal showsHorizontalScrollIndicator={false}>
        {MAPS.map((map) => (
          <TouchableOpacity
            key={map.id}
            style={[styles.mapCard, { borderColor: map.color }]}
            onPress={() => handleSelect(map.id)}
          >
            <Text style={styles.mapEmoji}>{map.emoji}</Text>
            <Text style={styles.mapName}>{map.name}</Text>
            <Text style={styles.mapDesc}>{map.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← BACK</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a2e',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 30,
    letterSpacing: 3,
  },
  mapList: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 10,
  },
  mapCard: {
    width: 160,
    height: 180,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 16,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  mapEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  mapName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 4,
  },
  mapDesc: {
    fontSize: 11,
    color: '#aaaaaa',
    textAlign: 'center',
  },
  backButton: {
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
  },
  backText: {
    color: '#ffffff',
    fontSize: 16,
  },
});
