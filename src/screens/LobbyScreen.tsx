import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation';
import { joinRoom, setReady, leaveRoom, onRoomUpdate, RoomInfo } from '../network/matchmaking';
import { disconnectSocket } from '../network/socket';

type Props = NativeStackScreenProps<RootStackParamList, 'Lobby'>;

export function LobbyScreen({ navigation }: Props) {
  const [room, setRoom] = useState<RoomInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    async function join() {
      try {
        const r = await joinRoom('Player');
        setRoom(r);
        setLoading(false);

        unsubscribe = onRoomUpdate((updated) => {
          setRoom(updated);
          // If race starts, navigate to Race screen
          if (updated.state === 'countdown' || updated.state === 'racing') {
            navigation.replace('Race', { mode: 'multiplayer' });
          }
        });
      } catch (err: any) {
        setError(err.message || 'Failed to connect');
        setLoading(false);
      }
    }

    join();

    return () => {
      unsubscribe?.();
      leaveRoom();
    };
  }, []);

  const handleReady = () => {
    setReady();
    setIsReady(true);
  };

  const handleBack = () => {
    disconnectSocket();
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#ffcc00" />
        <Text style={styles.loadingText}>Finding a race...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.button} onPress={handleBack}>
          <Text style={styles.buttonText}>BACK</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>LOBBY</Text>
      <Text style={styles.roomId}>Room: {room?.id?.slice(0, 8)}</Text>

      {/* Player list */}
      <View style={styles.playerList}>
        {room?.players.map((player) => (
          <View key={player.id} style={styles.playerRow}>
            <Text style={styles.playerName}>{player.name}</Text>
            <Text style={[styles.readyBadge, player.ready && styles.readyBadgeActive]}>
              {player.ready ? '✓ READY' : 'WAITING'}
            </Text>
          </View>
        ))}
        {/* Empty slots */}
        {Array.from({ length: (room?.maxPlayers || 4) - (room?.players.length || 0) }).map((_, i) => (
          <View key={`empty-${i}`} style={styles.playerRow}>
            <Text style={styles.emptySlot}>— Empty slot —</Text>
          </View>
        ))}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {!isReady && (
          <TouchableOpacity style={styles.readyButton} onPress={handleReady}>
            <Text style={styles.buttonText}>READY!</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.buttonText}>LEAVE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a2e',
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 5,
  },
  roomId: {
    fontSize: 14,
    color: '#888',
    marginBottom: 30,
  },
  playerList: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  playerName: {
    fontSize: 18,
    color: '#ffffff',
  },
  readyBadge: {
    fontSize: 14,
    color: '#888',
    fontWeight: 'bold',
  },
  readyBadgeActive: {
    color: '#00ff00',
  },
  emptySlot: {
    fontSize: 16,
    color: '#444',
    fontStyle: 'italic',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  readyButton: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#00cc00',
    borderRadius: 10,
    alignItems: 'center',
  },
  backButton: {
    width: '100%',
    paddingVertical: 16,
    backgroundColor: '#555',
    borderRadius: 10,
    alignItems: 'center',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 40,
    backgroundColor: '#ff4400',
    borderRadius: 10,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  loadingText: {
    color: '#aaa',
    marginTop: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#ff4444',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 10,
  },
});
