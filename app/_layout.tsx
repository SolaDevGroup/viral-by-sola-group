import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider } from "@/contexts/AppContext";
import { ContentProvider } from "@/contexts/ContentContext";

const queryClient = new QueryClient();

export default function RootLayout() {

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppProvider>
          <ContentProvider>
            <Stack screenOptions={{ headerShown: false }}>
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
              <Stack.Screen name="story-viewer" options={{ animation: 'fade' }} />
              <Stack.Screen name="product/[productId]" />
              <Stack.Screen name="checkout" />
              <Stack.Screen name="create-ad" />
              <Stack.Screen name="registration" />
              <Stack.Screen name="settings/account-info" />
              <Stack.Screen name="settings/switch-account" />
              <Stack.Screen name="settings/privacy" />
              <Stack.Screen name="settings/security" />
              <Stack.Screen name="settings/notifications-settings" />
              <Stack.Screen name="settings/view-settings" />
              <Stack.Screen name="settings/pro-subscription" />
              <Stack.Screen name="banner-trim-video" />
              <Stack.Screen name="banner-crop-image" />
            </Stack>
          </ContentProvider>
        </AppProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}
