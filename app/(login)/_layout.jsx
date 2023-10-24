import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, usePathname } from "expo-router";
import { useColorScheme } from "react-native";

import Colors from "../../constants/Colors";

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function AuthLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme || "light"].tint,
        tabBarStyle: {
          display: usePathname() === 'example' ? 'none' : 'flex',
        }
      }}
    >
      <Tabs.Screen
        name="signin"
        options={{
          headerStyle: {
            shadowColor: "transparent", // Remove shadow on iOS
          },
          href: null,
          tabBarButton: null,
          title: "Sign In",
        }}
      />
      <Tabs.Screen
        name="signup"
        options={{
          headerStyle: {
            shadowColor: "transparent", // Remove shadow on iOS
          },
          href: null,
          tabBarButton: null,
          title: "Sign up",
        }}
      />
    </Tabs>
  );
}
