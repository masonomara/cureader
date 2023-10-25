import React, { useState } from "react";
import {
  Alert,
  TextInput,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
  useColorScheme,
} from "react-native";
import { supabase } from "../../lib/supabase-client";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Colors from "../../constants/Colors";

export default function Auth() {
  const colorScheme = useColorScheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [securePasswordEntry, setSecurePasswordEntry] = useState(true);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) Alert.alert("Log In Error", error.message);
    setLoading(false);
  }

  const styles = {
    safeAreaView: {
      // borderWidth: 3,
      // borderColor: "#ff0000",
      flex: 1,
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
    },
    keyboardAvoidingView: {
      // borderWidth: 3,
      // borderColor: "blue",
      flex: 1,
    },
    container: {
      flex: 1,
      // borderWidth: 3,
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      // borderColor: "orange",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 24,
    },
    content: {
      width: "100%",
      // borderWidth: 3,
      // borderColor: "#f00",
      alignItems: "center",
    },
    title: {
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "NotoSerifMedium",
      fontSize: 29,
      lineHeight: 29,
      marginBottom: 6,
      marginTop: 6,
    },
    subtitle: {
      fontFamily: "InterMedium",
      color: `${Colors[colorScheme || "light"].textHigh}`,
      letterSpacing: -0.209,
      fontSize: 19,
      lineHeight: 19,
      marginBottom: 38,
    },
    label: {
      width: "100%",
      alignItems: "flex-start",
      flexWrap: "wrap",
      fontFamily: "InterMedium",
      fontWeight: "500",
      lineHeight: 16.25,
      letterSpacing: -0.039,
      fontSize: 13,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      marginBottom: 5,
    },
    input: {
      width: "100%",
      borderRadius: 20,
      height: 56,
      marginBottom: 16,
      paddingHorizontal: 16,
      borderWidth: 1,
      flexDirection: "row",
      borderColor: `${Colors[colorScheme || "light"].border}`,
      backgroundColor: `${Colors[colorScheme || "light"].surfaceOne}`,
      alignContent: "center",
      justifyContent: "space-between",
      letterSpacing: -0.051,
      fontWeight: "400",
      fontFamily: "InterRegular",
      fontSize: 17,
      color: `${Colors[colorScheme || "light"].textHigh}`,
    },
    inputText: {
      flex: 1,
      letterSpacing: -0.051,
      fontWeight: "400",
      fontFamily: "InterRegular",
      fontSize: 17,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      // borderWidth: 3,
      // borderColor: "#00f",
    },
    inputButton: {
      width: 34,
      marginLeft: 8,
      alignItems: "center",
      justifyContent: "center",
      // borderWidth: 3,
      // borderColor: "#00f",
    },
    button: {
      height: 48,
      width: "100%",
      flexDirection: "row",
      backgroundColor: `${Colors[colorScheme || "light"].colorPrimary}`,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
    },
    buttonText: {
      color: `${Colors[colorScheme || "light"].colorOn}`,
      fontFamily: "InterBold",
      fontWeight: "700",
      fontSize: 15,
    },
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Welcome!</Text>
            <Text style={styles.subtitle}>Please log in to continue</Text>
            <Text style={styles.label}>Your email address</Text>
            <TextInput
              style={styles.input}
              label="Email"
              onChangeText={(text) => setEmail(text)}
              value={email}
              placeholder="email"
              autoCapitalize={"none"}
              autoCorrect={false}
            />
            <Text style={styles.label}>Your password</Text>
            <View style={styles.input}>
              <TextInput
                style={styles.inputText}
                label="Password"
                onChangeText={(text) => setPassword(text)}
                value={password}
                secureTextEntry={securePasswordEntry}
                placeholder="password"
                autoCapitalize={"none"}
                autoCorrect={false}
              />
              <Pressable
                style={styles.inputButton}
                onPress={() => setSecurePasswordEntry(!securePasswordEntry)}
              >
                <FontAwesome
                  name={securePasswordEntry ? "eye-slash" : "eye"}
                  size={24}
                  color={Colors[colorScheme || "light"].buttonActive}
                />
              </Pressable>
            </View>
          </View>
          <TouchableOpacity
            title="Log in"
            disabled={loading}
            style={styles.button}
            onPress={() => signInWithEmail()}
          >
            <Text style={styles.buttonText}>Log in</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
