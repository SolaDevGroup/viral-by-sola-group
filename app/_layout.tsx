import { AppProvider } from "@/contexts/AppContext";
import { ContentProvider } from "@/contexts/ContentContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider } from "react-redux";

import { persistor, store } from "@/store";
import { PersistGate } from "redux-persist/integration/react";

import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_600SemiBold_Italic,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";

import colors from "@/constants/colors";
import SocketProvider from "@/contexts/SocketProvider";

SplashScreen.preventAutoHideAsync().catch(() => {});

const queryClient = new QueryClient();

function LoadingScreen() {
  return (
    <View style={loadingStyles.container}>
      <View style={loadingStyles.logoPill}>
        <Text style={loadingStyles.logoText}>V</Text>
      </View>
      <ActivityIndicator
        size="large"
        color={colors.primaryAlt}
        style={loadingStyles.spinner}
      />
      <View style={loadingStyles.footer}>
        <Text style={loadingStyles.fromText}>from</Text>
        <Text style={loadingStyles.brandText}>Sola Group</Text>
      </View>
    </View>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
    justifyContent: "center",
    alignItems: "center",
  },
  logoPill: {
    width: 80,
    height: 130,
    borderRadius: 40,
    backgroundColor: colors.primaryAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 48,
    fontWeight: "700" as const,
    fontFamily: "Poppins_700Bold",
    color: colors.white,
  },
  spinner: {
    marginTop: 30,
  },
  footer: {
    position: "absolute",
    bottom: 100,
    alignItems: "center",
  },
  fromText: {
    fontSize: 14,
    color: colors.blackOpacity48,
  },
  brandText: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: colors.primaryAlt,
    marginTop: 4,
  },
});

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
    return <LoadingScreen />;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SocketProvider>
              <AppProvider>
                <ContentProvider>
                  <Stack screenOptions={{ headerShown: false ,   gestureEnabled: false}}>
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
      </PersistGate>
    </Provider>
  );
}
