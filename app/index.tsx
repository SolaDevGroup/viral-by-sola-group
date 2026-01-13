import { useEffect } from "react";
import { router } from "expo-router";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
const ONBOARDING_KEY = "hasSeenOnboarding";
const TOKEN_KEY = "token";
export default function Index() {
  useEffect(() => {
    const decideRoute = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);
        const token = await AsyncStorage.getItem(TOKEN_KEY);
        if (hasSeenOnboarding !== "true") {
          router.replace("/onboarding");
          return;
        }

        // if (!token) {
        //   router.replace("/registration");
        //   return;
        // }

        router.replace("/(tabs)/home");
      } catch (error) {
        router.replace("/onboarding");
      }
    };

    const timer = setTimeout(() => {
      decideRoute();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.logoPill}>
        <Text style={styles.logoText}>V</Text>
      </View>
      <ActivityIndicator size="small" color="#37B874" style={styles.loader} />
      <View style={styles.footer}>
        <Text style={styles.fromText}>from</Text>
        <Text style={styles.brandText}>Sola Group</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  logoPill: {
    width: 80,
    height: 130,
    borderRadius: 40,
    backgroundColor: "#37B874",
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 48,
    fontWeight: "700" as const,
    fontFamily: "Poppins_700Bold",
    color: "#FFFFFF",
  },
  loader: {
    marginTop: 30,
  },
  footer: {
    position: "absolute",
    bottom: 100,
    alignItems: "center",
  },
  fromText: {
    fontSize: 14,
    color: "rgba(18, 18, 18, 0.48)",
  },
  brandText: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: "#37B874",
    marginTop: 4,
  },
});
