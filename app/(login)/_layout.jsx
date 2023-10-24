import { Stack } from "expo-router";
import Colors from "../../constants/Colors";
import { Pressable, useColorScheme } from "react-native";

export default function AuthLayout() {
  const colorScheme = useColorScheme();

  return (
    <Stack
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme || "light"].tint,
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="signup" />
    </Stack>
  );
}
