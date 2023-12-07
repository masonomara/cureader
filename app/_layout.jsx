import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { supabase } from "../config/initSupabase.js";
import { Text, useColorScheme } from "react-native";
import { AuthProvider, useAuth } from "../provider/AuthProvider.jsx";

import Colors from "../constants/Colors";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(home)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    InterRegular: require("../assets/fonts/Inter/Inter-Regular.ttf"),
    InterMedium: require("../assets/fonts/Inter/Inter-Medium.ttf"),
    InterSemiBold: require("../assets/fonts/Inter/Inter-SemiBold.ttf"),
    InterBold: require("../assets/fonts/Inter/Inter-Bold.ttf"),
    NotoSerifRegular: require("../assets/fonts/NotoSerif/NotoSerif-Regular.ttf"),
    NotoSerifMedium: require("../assets/fonts/NotoSerif/NotoSerif-Medium.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Remove spash screen on font load
  useEffect(() => {
    if (loaded) {
    }
  }, [loaded]);

  // Error catcher
  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const colorScheme = useColorScheme();

  {
    /*

  const { session, initialized } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;
    const inHomeGroup = segments[0] === "(home)";
    if (session && !inHomeGroup) {
      router.replace("(home)");
    } else if (!session && inHomeGroup) {
      router.replace("(login)");
    }
  }, [session, initialized]);

*/
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session ? session.user : null);
        console.log("Session 1:", session || "N/A 1");
        SplashScreen.hideAsync();
      }

      // Listen for changes in the authentication state
      else
        supabase.auth.onAuthStateChange((_event, session) => {
          if (session) {
            // If a session is present, navigate to the main screen
            setSession(session);
            setUser(session ? session.user : null);
            console.log("Session 2:", session || "N/A 2");
            router.replace("(home)");
            SplashScreen.hideAsync();
          } else {
            // If a session is not present, navigate to the login screen
            setTimeout(() => {
              console.log("Session 3:", session || "N/A 3");
              SplashScreen.hideAsync();
            }, 500);
          }
        });
    });
  }, []);

  useEffect(() => {
    // Listen for changes in the authentication state
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setSession(session);
        setUser(session ? session.user : null);
        console.log("Session 5:", session || "N/A 5");
        // If a session is present, navigate to the main screen
        router.replace("(home)");
      } else {
        // If a session is not present, navigate to the login screen
        console.log("Session 6:", session || "N/A 6");
        router.replace("(login)");
      }
    });
  }, []);

  return (
    // <AuthProvider>
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Text>APP.JS-------</Text>
      <Stack>
        <Stack.Screen name="(home)" options={{ headerShown: false }} />
        <Stack.Screen name="(login)" options={{ headerShown: false }} />
        <Stack.Screen name="(signup)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
        <Stack.Screen
          name="addChannel"
          options={{ presentation: "modal", title: "Add Channel" }}
        />
        <Stack.Screen
          name="feedChannel"
          options={({ route }) => ({
            title: route.params.title || "Default Title",
            headerStyle: {
              headerTransparent: true,
              shadowColor: "transparent", // Remove shadow on iOS
              backgroundColor: Colors[colorScheme || "light"].background,
            },
            headerTintColor: Colors[colorScheme || "light"].colorPrimary, // Set header tint color
            headerBackTitle: "Explore",
            headerTitleStyle: {
              color: Colors[colorScheme || "light"].textHigh, // Set header title color
            },
          })}
        />
      </Stack>
    </ThemeProvider>
    // </AuthProvider>
  );
}
