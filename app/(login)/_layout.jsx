import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs, Link, usePathname, router } from "expo-router";
import {
  useColorScheme,
  Image,
  Pressable,
  Text,
  StyleSheet,
  Button,
  TouchableOpacity,
} from "react-native";

import Colors from "../../constants/Colors";

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function AuthLayout() {
  const colorScheme = useColorScheme();

  const goToLogIn = () => {
    router.push("(login)");
  };

  const goToSignUp = () => {
    router.push("(login)/signup");
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme || "light"].tint,
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

const styles = StyleSheet.create({
  headerButton: {
    height: 44,
    width: 80,
    flexDirection: "row",
    padding: 0,
    alignItems: "center",
    justifyContent: "flex-end",
    marginRight: 16,
    textAlign: "right",
    color: `${Colors.light.buttonActive}`,
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
    color: `${Colors.light.buttonActive}`,
    flexDirection: "row",
    flexWrap: "nowrap",
  },
});
