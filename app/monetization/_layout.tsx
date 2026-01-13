import { Stack } from "expo-router";

export default function MonetizationLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="subscription-pricing" />
      <Stack.Screen name="loyalty-badges" />
      <Stack.Screen name="regional-pricing" />
      <Stack.Screen name="earnings-calculator" />
    </Stack>
  );
}
