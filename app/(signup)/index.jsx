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
import { supabase } from "../../config/initSupabase";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Colors from "../../constants/Colors";

export default function Auth() {
  const colorScheme = useColorScheme();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [securePasswordEntry, setSecurePasswordEntry] = useState(true);

  // Function for handling search input focus
  const handleFocus = () => {
    setIsSearchInputSelected(true);
  };

  // Function for handling seach input blur
  const handleBlur = () => {
    setIsSearchInputSelected(false);
  };

  // Function for handling search input focus
  const handleFocusTwo = () => {
    setIsSearchInputSelected(true);
  };

  // Function for handling seach input blur
  const handleBlurTwo = () => {
    setIsSearchInputSelected(false);
  };
  // Function for handling search input focus
  const handleFocusThree = () => {
    setIsSearchInputSelected(true);
  };

  // Function for handling seach input blur
  const handleBlurThree = () => {
    setIsSearchInputSelected(false);
  };

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          displayName: displayName,
        },
      },
    });

    if (error) {
      Alert.alert("Sign Up Error", error.message);
    }
    setLoading(false);
  }

  const styles = {
    safeAreaView: {
      flex: 1,
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
    },
    keyboardAvoidingView: {
      flex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      alignItems: "center",
      justifyContent: "space-between",
      padding: 24,
    },
    content: {
      width: "100%",
      alignItems: "center",
    },
    title: {
      marginBottom: 4,
      marginTop: 4,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "NotoSerifMedium",
      fontWeight: "500",
      fontSize: 29,
      lineHeight: 35,
      letterSpacing: -0.217,
    },
    subtitle: {
      marginBottom: 35,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterMedium",
      textAlign: "center",
      fontWeight: "700",
      fontSize: 19,
      lineHeight: 24,
      letterSpacing: -0.19,
    },
    label: {
      width: "100%",
      alignItems: "flex-start",
      flexWrap: "wrap",
      marginBottom: 5,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: -0.13,
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
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterRegular",
      fontWeight: "500",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0,
    },
    inputSelected: {
      flex: 1,
      borderRadius: 20,
      height: 56,
      paddingLeft: 52,
      paddingRight: 52,
      borderWidth: 1,
      flexDirection: "row",
      borderColor: `${Colors[colorScheme || "light"].buttonMuted}`,
      backgroundColor: `${Colors[colorScheme || "light"].surfaceOne}`,
      alignContent: "center",
      justifyContent: "space-between",
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterRegular",
      fontWeight: "500",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0,
    },
    inputText: {
      flex: 1,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterRegular",
      fontWeight: "500",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0,
    },
    inputButton: {
      width: 34,
      marginLeft: 8,
      alignItems: "center",
      justifyContent: "center",
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
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0.17,
    },
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Create an account</Text>
            <Text style={styles.subtitle}>
              Please enter the following information
            </Text>
            <Text style={styles.label}>Your display name</Text>
            <TextInput
              style={[
                styles.input,
                isSearchInputSelected && styles.inputSelected,
              ]}
              label="Display Name"
              onChangeText={(displayName) => setDisplayName(displayName)}
              value={displayName}
              placeholder="display name"
              // autoCapitalize={"none"}
              autoCorrect={false}
              onFocus={handleFocus}
              onBlur={handleBlur}
            />
            <Text style={styles.label}>Your email address</Text>
            <TextInput
              style={[
                styles.input,
                isSearchInputSelected && styles.inputSelected,
              ]}
              label="Email"
              onChangeText={(text) => setEmail(text)}
              value={email}
              placeholder="email"
              autoCapitalize={"none"}
              autoCorrect={false}
              onFocus={handleFocusTwo}
              onBlur={handleBlurTwo}
            />
            <Text style={styles.label}>Your password</Text>
            <View style={styles.input}>
              <TextInput
                style={[
                  styles.input,
                  isSearchInputSelected && styles.inputSelected,
                ]}
                label="Password"
                onChangeText={(text) => setPassword(text)}
                value={password}
                secureTextEntry={securePasswordEntry}
                placeholder="password"
                autoCapitalize={"none"}
                autoCorrect={false}
                onFocus={handleFocusThree}
                onBlur={handleBlurThree}
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
            title="Sign up"
            disabled={loading}
            style={styles.button}
            onPress={() => signUpWithEmail()}
          >
            <Text style={styles.buttonText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}
