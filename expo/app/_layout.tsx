import { AppProvider } from "@/contexts/AppContext";
import { ContentProvider } from "@/contexts/ContentContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";

import { store } from "@/store";

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_600SemiBold_Italic,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";

import SocketProvider from "@/contexts/SocketProvider";

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_600SemiBold_Italic,
    ClashDisplay: require("../assets/fonts/ClashDisplay-Variable.ttf"),
    Holligate: require("../assets/fonts/Holligate-Signature-Demo.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SocketProvider>
            <AppProvider>
              <ContentProvider>
                <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
                  <Stack.Screen name="index" />
                  <Stack.Screen name="(tabs)" />
                  <Stack.Screen name="auth" />
                  <Stack.Screen name="onboarding" />
                  <Stack.Screen name="signup" />
                  <Stack.Screen name="splash" />
                  <Stack.Screen name="video-feed" />
                  <Stack.Screen name="live-feed" />
                  <Stack.Screen name="qr-code" />
                  <Stack.Screen name="notifications" />
                  <Stack.Screen name="insights" />
                  <Stack.Screen name="chat-insights" />
                  <Stack.Screen name="settings" />
                  <Stack.Screen name="monetization" />
                  <Stack.Screen name="profile/[userId]" />
                  <Stack.Screen name="conversation/[conversationId]" />
                  <Stack.Screen name="trim-video" />
                  <Stack.Screen name="post-video" />
                  <Stack.Screen name="imageCamera" />
                  <Stack.Screen
                    name="story-viewer"
                    options={{ animation: "fade" }}
                  />
                  <Stack.Screen name="product/[productId]" />
                  <Stack.Screen name="checkout" />

                  <Stack.Screen name="create-ad"/>
                  <Stack.Screen name="login" />
                  <Stack.Screen name="registration" />
                  <Stack.Screen name="otpverification" />
                  <Stack.Screen name="settings/account-info" />
                  <Stack.Screen name="settings/switch-account" />
                  <Stack.Screen name="settings/privacy" />
                  <Stack.Screen name="settings/security" />
                  <Stack.Screen name="settings/notifications-settings" />
                  <Stack.Screen name="settings/view-settings" />
                </Stack>
              </ContentProvider>
            </AppProvider>
          </SocketProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </Provider>
  );
}
