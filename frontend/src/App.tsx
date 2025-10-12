import 'react-native-gesture-handler';
import React from 'react';
import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Assets as NavigationAssets } from '@react-navigation/elements';
import { Asset } from 'expo-asset';
import { createURL } from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';

import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import { Navigation } from './navigation'; 
import '@/global.css';

Asset.loadAsync([
  ...NavigationAssets,
  require('./assets/newspaper.png'),
  require('./assets/bell.png'),
]);

SplashScreen.preventAutoHideAsync();

const prefix = createURL('/');

export default function App() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <GluestackUIProvider mode="light">
      <ThemeProvider value={theme}>
        <Navigation
          linking={{
            enabled: true,
            prefixes: [prefix],
          }}
          onReady={() => {
            SplashScreen.hideAsync();
          }}
        />
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
