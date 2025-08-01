import '~/global.css';

import { Theme, ThemeProvider, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as React from 'react';
import { Platform } from 'react-native';
import { NAV_THEME } from '~/lib/constants';
import { useColorScheme } from '~/lib/useColorScheme';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '~/lib/i18n';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AuthProvider, { useAuth } from '~/lib/auth';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Toasts } from '@backpackapp-io/react-native-toast';
import * as SplashScreen from 'expo-splash-screen';
import * as Network from 'expo-network';
import { useEffect } from 'react';
import { PortalHost } from '@rn-primitives/portal';
import HabitProvider from '~/lib/habit';
import SettingsProvider from '~/lib/settings';

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const hasMounted = React.useRef(false);
  const { isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  useEffect(() => {
    Network.getNetworkStateAsync().then(({ isInternetReachable }) => {
      if (isInternetReachable) {
        SplashScreen.hideAsync();
      }
    });
  }, []);

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }

    if (Platform.OS === 'web') {
      // Adds the background color to the html element to prevent white background on overscroll.
      document.documentElement.classList.add('bg-background');
    }
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
        <SettingsProvider>
          <AuthProvider>
            <HabitProvider>
              <SafeAreaProvider>
                <GestureHandlerRootView>
                  <StatusBar style={isDarkColorScheme ? 'light' : 'dark'} />
                  <Screens />
                  <PortalHost />
                  <Toasts
                    overrideDarkMode={isDarkColorScheme}
                    globalAnimationType="spring"
                    globalAnimationConfig={{ duration: 300 }}
                  />
                </GestureHandlerRootView>
              </SafeAreaProvider>
            </HabitProvider>
          </AuthProvider>
        </SettingsProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}

const Screens = () => {
  const { user, stats } = useAuth();
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Protected guard={!!user}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false, title: t("home") }} />
        <Stack.Screen name="create" options={{ headerShown: true, title: t("newAct") }} />
        <Stack.Screen name="activity/create" options={{ headerShown: true, title: t("createAct") }} />
        <Stack.Screen name="activity/edit/[id]" options={{ headerShown: true, title: t("editAct") }} />
        <Stack.Screen name="activity/edit/habit/[id]" options={{ headerShown: true, title: t("editHabit") }} />
        <Stack.Screen name="activity/edit/todo/[id]" options={{ headerShown: true, title: t("editTodo") }} />
        <Stack.Screen name="settings/index" options={{ headerShown: true, title: t("settings") }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false, title: t("onboarding") }} />
      </Stack.Protected>
      <Stack.Protected guard={!user}>
        <Stack.Screen name="(auth)" options={{ headerShown: false, title: t("login") }} />
      </Stack.Protected>
    </Stack>
  );
}

const useIsomorphicLayoutEffect =
  Platform.OS === 'web' && typeof window === 'undefined' ? React.useEffect : React.useLayoutEffect;