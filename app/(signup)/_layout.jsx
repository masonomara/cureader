import { Tabs, usePathname, router } from "expo-router";
import { useColorScheme, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";

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
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0.17,
    },
    headerButtonText: {
      flexDirection: "row",
      flexWrap: "nowrap",
      color: `${Colors[colorScheme || "light"].buttonActive}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0.17,
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
          title: "Sign up",
          headerTitle: () => (
            <Image
              style={{ width: 200, height: 36 }}
              source={require("../../assets/images/pin.png")}
              contentFit="contain"
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
