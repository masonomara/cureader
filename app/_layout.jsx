import FontAwesome from "@expo/vector-icons/FontAwesome";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SerifRegular: require("../assets/fonts/SourceSerifPro/source-serif-pro.regular.ttf"),
    SerifSemiBold: require("../assets/fonts/SourceSerifPro/source-serif-pro.semibold.ttf"),
    SerifBold: require("../assets/fonts/SourceSerifPro/source-serif-pro.bold.ttf"),
    InterThin: require("../assets/fonts/Inter/Inter-Thin.ttf"),
    InterExtraLight: require("../assets/fonts/Inter/Inter-ExtraLight.ttf"),
    InterLight: require("../assets/fonts/Inter/Inter-Light.ttf"),
    InterRegular: require("../assets/fonts/Inter/Inter-Regular.ttf"),
    InterMedium: require("../assets/fonts/Inter/Inter-Medium.ttf"),
    InterSemiBold: require("../assets/fonts/Inter/Inter-SemiBold.ttf"),
    InterBold: require("../assets/fonts/Inter/Inter-Bold.ttf"),
    InterExtraBold: require("../assets/fonts/Inter/Inter-ExtraBold.ttf"),
    InterBlack: require("../assets/fonts/Inter/Inter-Black.ttf"),
    BitterThin: require("../assets/fonts/Bitter/Bitter-Thin.ttf"),
    BitterExtraLight: require("../assets/fonts/Bitter/Bitter-ExtraLight.ttf"),
    BitterLight: require("../assets/fonts/Bitter/Bitter-Light.ttf"),
    BitterRegular: require("../assets/fonts/Bitter/Bitter-Regular.ttf"),
    BitterMedium: require("../assets/fonts/Bitter/Bitter-Medium.ttf"),
    BitterSemiBold: require("../assets/fonts/Bitter/Bitter-SemiBold.ttf"),
    BitterBold: require("../assets/fonts/Bitter/Bitter-Bold.ttf"),
    BitterExtraBold: require("../assets/fonts/Bitter/Bitter-ExtraBold.ttf"),
    BitterBlack: require("../assets/fonts/Bitter/Bitter-Black.ttf"),
    NotoSerifThin: require("../assets/fonts/NotoSerif/NotoSerif-Thin.ttf"),
    NotoSerifExtraLight: require("../assets/fonts/NotoSerif/NotoSerif-ExtraLight.ttf"),
    NotoSerifLight: require("../assets/fonts/NotoSerif/NotoSerif-Light.ttf"),
    NotoSerifRegular: require("../assets/fonts/NotoSerif/NotoSerif-Regular.ttf"),
    NotoSerifMedium: require("../assets/fonts/NotoSerif/NotoSerif-Medium.ttf"),
    NotoSerifSemiBold: require("../assets/fonts/NotoSerif/NotoSerif-SemiBold.ttf"),
    NotoSerifBold: require("../assets/fonts/NotoSerif/NotoSerif-Bold.ttf"),
    NotoSerifExtraBold: require("../assets/fonts/NotoSerif/NotoSerif-ExtraBold.ttf"),
    NotoSerifBlack: require("../assets/fonts/NotoSerif/NotoSerif-Black.ttf"),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false, title: "LOGGGIN" }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: "modal" }} />
      </Stack>
    </ThemeProvider>
  );
}
