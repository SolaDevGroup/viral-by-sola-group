import { Tabs, router } from "expo-router";
import { Home, Search, PlusCircle, User } from "lucide-react-native";
import React from "react";
import Svg, { Defs, LinearGradient, Stop, Path } from "react-native-svg";
import Colors from "@/constants/colors";
import { useApp } from "@/contexts/AppContext";

const ShoppingBagOutline = ({ size, color }: { size: number; color: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <Path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <Path d="M3 6h18" />
    <Path d="M16 10a4 4 0 0 1-8 0" />
  </Svg>
);

const ShoppingBagFilled = ({ size }: { size: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24">
    <Defs>
      <LinearGradient id="shopGradient" x1="50%" y1="0%" x2="50%" y2="100%" gradientTransform="rotate(-27)">
        <Stop offset="0%" stopColor="#37B874" />
        <Stop offset="100%" stopColor="#12FFAA" />
      </LinearGradient>
    </Defs>
    <Path
      d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6zM3 6h18M16 10a4 4 0 0 1-8 0"
      fill="url(#shopGradient)"
      stroke="url(#shopGradient)"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export default function TabLayout() {
  const { isDarkMode, accentColor } = useApp();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: accentColor,
        tabBarInactiveTintColor: theme.textTertiary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.border,
          borderTopWidth: 1,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
        listeners={{
          tabPress: (e) => {
            const currentPath = router.canGoBack() ? '' : '/';
            if (currentPath === '/' || currentPath === '' || currentPath === '/home') {
              e.preventDefault();
              router.setParams({ showFeedSelector: 'true' });
            }
          },
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: "Create",
          tabBarIcon: ({ color, size }) => <PlusCircle color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          title: "Shop",
          tabBarIcon: ({ color, size, focused }) => 
            focused ? (
              <ShoppingBagFilled size={size} />
            ) : (
              <ShoppingBagOutline size={size} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
