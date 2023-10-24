import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, usePathname } from "expo-router";
import { useColorScheme, Image } from "react-native";

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
        name="index"
        options={{
          headerStyle: {
            shadowColor: "transparent", // Remove shadow on iOS
          },
          tabBarStyle: {
            display: "none",
          },
          href: null,
          tabBarButton: null,
          title: "Log In",
          headerTitle: (props) => ( // App Logo
          <Image
            style={{ width: 200, height: 36 }}
            source={require('../../assets/images/pin.png')}
            resizeMode='contain'
          />
        ),
        headerTitleStyle: { flex: 1, textAlign: 'center' },
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
          headerTitle: (props) => ( // App Logo
          <Image
            style={{ width: 200, height: 36 }}
            source={require('../../assets/images/pin.png')}
            resizeMode='contain'
          />
        ),
        headerTitleStyle: { flex: 1, textAlign: 'center' },
        }}
      />
    </Tabs>
  );
}