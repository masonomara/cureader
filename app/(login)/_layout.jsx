import { Tabs, usePathname, router } from "expo-router";
import { useColorScheme, Image, Text, TouchableOpacity } from "react-native";

import Colors from "../../constants/Colors";

export default function AuthLayout() {
  const colorScheme = useColorScheme();

  const styles = {
    headerButton: {
      height: 44,
      width: 80,
      flexDirection: "row",
      padding: 0,
      alignItems: "center",
      justifyContent: "flex-end",
      marginRight: 16,
      textAlign: "right",
      color: `${Colors[colorScheme || "light"].buttonActive}`,
      // borderWidth: 1,
      // borderColor: 'red',
      lineHeight: 44,
      letterSpacing: -0.051,
      fontWeight: "500",
      fontFamily: "InterMedium",
      fontSize: 17,
    },
    headerButtonText: {
      letterSpacing: -0.051,
      fontWeight: "500",
      fontFamily: "InterMedium",
      fontSize: 17,
      color: `${Colors[colorScheme || "light"].buttonActive}`,
      flexDirection: "row",
      flexWrap: "nowrap",
    },
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme || "light"].text,
        tabBarStyle: {
          display: usePathname() === "example" ? "none" : "flex",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerStyle: {
            shadowColor: "transparent", // Remove shadow on iOS
            backgroundColor: Colors[colorScheme || "light"].background,
          },
          tabBarStyle: {
            display: "none",
          },
          href: null,
          tabBarButton: null,
          title: "Log In",
          headerTitle: () => (
            <Image
              style={{ width: 200, height: 36 }}
              source={require("../../assets/images/pin.png")}
              resizeMode="contain"
            />
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.replace("(login)/signup")}
            >
              <Text style={styles.headerButtonText}>Sign up</Text>
            </TouchableOpacity>
          ),
          headerTitleStyle: { flex: 1, textAlign: "center" },
        }}
      />
      <Tabs.Screen
        name="signup"
        options={{
          headerStyle: {
            shadowColor: "transparent", // Remove shadow on iOS
            backgroundColor: Colors[colorScheme || "light"].background,
          },
          tabBarStyle: {
            display: "none",
          },
          href: null,
          tabBarButton: null,
          title: "Sign up",
          headerTitle: () => (
            <Image
              style={{ width: 200, height: 36 }}
              source={require("../../assets/images/pin.png")}
              resizeMode="contain"
            />
          ),
          headerRight: () => (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.replace("(login)")}
            >
              <Text style={styles.headerButtonText}>Log in</Text>
            </TouchableOpacity>
          ),
          headerTitleStyle: { flex: 1, textAlign: "center" },
        }}
      />
    </Tabs>
  );
}
