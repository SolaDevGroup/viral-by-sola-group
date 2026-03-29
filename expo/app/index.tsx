import { useEffect } from "react";
import { View } from "react-native";
import { router } from "expo-router";

export default function Index() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/(tabs)/home");
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  return <View style={{ flex: 1, backgroundColor: "#FFFFFF" }} />;
}
