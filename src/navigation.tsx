import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainMenuScreen } from './screens/MainMenuScreen';
import { LobbyScreen } from './screens/LobbyScreen';
import { RaceScreen } from './screens/RaceScreen';
import { ResultsScreen } from './screens/ResultsScreen';

export type RootStackParamList = {
  MainMenu: undefined;
  Lobby: undefined;
  Race: { mode: 'solo' | 'multiplayer' };
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
        <Stack.Screen name="Lobby" component={LobbyScreen} />
        <Stack.Screen name="Race" component={RaceScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
