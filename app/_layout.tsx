// template
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState, Component, ReactNode, ErrorInfo } from "react";
import { View, ActivityIndicator, Text, StyleSheet, TouchableOpacity } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppProvider } from "@/contexts/AppContext";
import { ContentProvider } from "@/contexts/ContentContext";
import {
  useFonts,
  Poppins_100Thin,
  Poppins_200ExtraLight,
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  Poppins_800ExtraBold,
  Poppins_900Black,
} from "@expo-google-fonts/poppins";

SplashScreen.preventAutoHideAsync().catch(() => {
  console.log('[RootLayout] SplashScreen.preventAutoHideAsync failed');
});

const queryClient = new QueryClient();

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Error info:', errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={errorStyles.container}>
          <Text style={errorStyles.title}>Something went wrong</Text>
          <Text style={errorStyles.message}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </Text>
          <TouchableOpacity style={errorStyles.button} onPress={this.handleRetry}>
            <Text style={errorStyles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}

const errorStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600' as const,
    color: '#121212',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: 'rgba(18, 18, 18, 0.64)',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#37B874',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600' as const,
  },
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="auth" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="splash" />
      <Stack.Screen name="index" />
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
    </Stack>
  );
}

function LoadingScreen() {
  return (
    <View style={loadingStyles.container}>
      <View style={loadingStyles.logoContainer}>
        <View style={loadingStyles.logoPill}>
          <Text style={loadingStyles.logoText}>V</Text>
        </View>
      </View>
      <ActivityIndicator size="large" color="#37B874" style={loadingStyles.spinner} />
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
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 40,
  },
  logoPill: {
    width: 80,
    height: 130,
    borderRadius: 40,
    backgroundColor: '#37B874',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 48,
    fontWeight: '700' as const,
    color: '#FFFFFF',
  },
  spinner: {
    marginTop: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  fromText: {
    fontSize: 14,
    color: 'rgba(18, 18, 18, 0.48)',
  },
  brandText: {
    fontSize: 20,
    fontWeight: '600' as const,
    color: '#37B874',
    marginTop: 4,
  },
});

export default function RootLayout() {
  const [appReady, setAppReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    Poppins_100Thin,
    Poppins_200ExtraLight,
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
    Poppins_800ExtraBold,
    Poppins_900Black,
  });

  useEffect(() => {
    console.log('[RootLayout] Font status:', { fontsLoaded, fontError: fontError?.message });
    
    if (fontsLoaded || fontError) {
      console.log('[RootLayout] Fonts ready or errored, hiding splash');
      SplashScreen.hideAsync().catch((e) => {
        console.log('[RootLayout] hideAsync error:', e);
      });
      setAppReady(true);
    }
  }, [fontsLoaded, fontError]);

  console.log('[RootLayout] Render - appReady:', appReady, 'fontsLoaded:', fontsLoaded);

  if (!appReady) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppProvider>
            <ContentProvider>
              <RootLayoutNav />
            </ContentProvider>
          </AppProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
