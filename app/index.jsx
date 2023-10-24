import { Slot, SplashScreen, router } from "expo-router";
import { useEffect } from "react";
import { supabase } from "../lib/supabase-client.js";
import { View, StyleSheet, Image } from "react-native";
const splashImg = require("../assets/images/splash.png");

export default function IndexPage() {
  
  useEffect(() => {
    // Check if there's an active session when the app initially loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        // If there's no session, navigate to the login screen
        router.replace("(auth)");
      }
    });

    // Listen for changes in the authentication state
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // If a session is present, navigate to the main screen
        router.replace("(tabs)");
      } else {
        // If there's no session, navigate to the login screen
        router.replace("(auth)");
      }
    });
  }, []);
  

  return (
    <View style={styles.container}>
      <Image source={splashImg} style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FF3E39",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    resizeMode: 'contain',
    maxHeight: '100%',
    maxWidth: '100%',
    borderWidth: 1,
  }
});
