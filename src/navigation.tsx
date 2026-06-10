import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainMenuScreen } from './screens/MainMenuScreen';
import { MapSelectScreen, MapId } from './screens/MapSelectScreen';
import { LobbyScreen } from './screens/LobbyScreen';
import { RaceScreen } from './screens/RaceScreen';
import { ResultsScreen } from './screens/ResultsScreen';

export type RootStackParamList = {
  MainMenu: undefined;
  MapSelect: undefined;
  Lobby: undefined;
  Race: { mode: 'solo' | 'multiplayer'; map?: MapId };
  Results: { results?: Array<{ id: string; time: number }> };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainMenu"
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}
      >
        <Stack.Screen name="MainMenu" component={MainMenuScreen} />
        <Stack.Screen name="MapSelect" component={MapSelectScreen} />
        <Stack.Screen name="Lobby" component={LobbyScreen} />
        <Stack.Screen name="Race" component={RaceScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
