import React, { useState } from "react";
import {
  Alert,
  TextInput,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Pressable,
  useColorScheme,
} from "react-native";
import { supabase } from "../../config/initSupabase";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Colors from "../../constants/Colors";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

export default function Auth() {
  const colorScheme = useColorScheme();
  const [isSearchInputSelected, setIsSearchInputSelected] = useState(false);
  const [isSearchInputSelectedTwo, setIsSearchInputSelectedTwo] =
    useState(false);
  const [scrollView, setScrollView] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [securePasswordEntry, setSecurePasswordEntry] = useState(true);

  // Function for handling search input focus
  const handleFocus = () => {
    setIsSearchInputSelected(true);
    setScrollView(false);
  };

  // Function for handling seach input blur
  const handleBlur = () => {
    setIsSearchInputSelected(false);
    setScrollView(true);
  };

  // Function for handling search input focus
  const handleFocusTwo = () => {
    setIsSearchInputSelectedTwo(true);
    setScrollView(false);
  };

  // Function for handling seach input blur
  const handleBlurTwo = () => {
    setIsSearchInputSelectedTwo(false);
    setScrollView(true);
  };

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
      // borderWidth: 1,
      // borderColor: "yellow",
      overflow: "hidden",
      paddingBottom: 88,
    },
    containerScrollView: {
      justifyContent: "flex-start",
      flex: 0,
      // borderWidth: 1,
      // borderColor: "green",
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
      fontWeight: "700",
      fontSize: 19,
      textAlign: "center",
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
      minHeight: 56,
      marginBottom: 16,
      paddingLeft: 16,
      paddingRight: 6,
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
      width: "100%",
      borderRadius: 20,
      height: 56,
      minHeight: 56,
      marginBottom: 16,
      paddingLeft: 16,
      paddingRight: 6,
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
      width: 44,
      marginLeft: 8,
      alignItems: "center",
      justifyContent: "center",
    },
    buttonWrapper: {
      position: "absolute",
      bottom: 16,
      width: "100%",
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      paddingVertical: 8,
      paddingTop: 40,
      // borderWidth: 1,
      // borderColor: "green",
    },
    buttonWrapperScrollView: {
      position: "absolute",
      bottom: 8,
      width: "100%",
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      paddingVertical: 8,
      paddingTop: 40,
      // borderWidth: 1,
      // borderColor: "black",
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
      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.container,
          !scrollView && styles.containerScrollView,
        ]}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!scrollView}
        nestedScrollEnabled={!scrollView}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.subtitle}>Please log in to continue</Text>
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
            onFocus={handleFocus}
            onBlur={handleBlur}
          />
          <Text style={styles.label}>Your password</Text>
          <View
            style={[
              styles.input,
              isSearchInputSelectedTwo && styles.inputSelected,
            ]}
          >
            <TextInput
              style={styles.inputText}
              label="Password"
              onChangeText={(text) => setPassword(text)}
              value={password}
              secureTextEntry={securePasswordEntry}
              placeholder="password"
              autoCapitalize={"none"}
              autoCorrect={false}
              onFocus={handleFocusTwo}
              onBlur={handleBlurTwo}
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
        <View
          style={[
            styles.buttonWrapper,
            !scrollView && styles.buttonWrapperScrollView,
          ]}
        >
          <TouchableOpacity
            title="Log in"
            disabled={loading}
            style={styles.button}
            onPress={() => signInWithEmail()}
          >
            <Text style={styles.buttonText}>Log in</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
