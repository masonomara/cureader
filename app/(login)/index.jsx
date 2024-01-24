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
  ActivityIndicator,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Colors from "../../constants/Colors";
import * as WebBrowser from "expo-web-browser";

import { supabase } from "../../config/supabase";

export default function Auth() {
  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState(false);
  const [loadingState, setLoadingState] = useState(false);
  const [securePasswordEntry, setSecurePasswordEntry] = useState(true);

  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });

  const [inputStates, setInputStates] = useState({
    isSearchInputSelected: false,
    isSearchInputSelectedTwo: false,
    scrollView: true,
  });

  const _handlePressButtonAsync = async (url) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error("Error opening browser:", error);
    }
  };

  const handleInputFocus = (inputName) => {
    setInputStates((prevState) => ({
      ...prevState,
      [inputName]: true,
      scrollView: false,
    }));
  };

  const handleInputBlur = (inputName) => {
    setInputStates((prevState) => ({
      ...prevState,
      [inputName]: false,
      scrollView: true,
    }));
  };

  const toggleSecurePasswordEntry = () => {
    setSecurePasswordEntry((prev) => !prev);
  };

  const signInWithEmail = async () => {
    setLoading(true);
    setLoadingState(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: inputs.email,
        password: inputs.password,
      });

      if (error) {
        setLoadingState(false);
        Alert.alert("Log In Error", error.message);
      }
    } catch (error) {
      setLoadingState(false);
      console.error("Unexpected error during sign-in:", error);
    } finally {
      setLoading(false);
    }
  };

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
      overflow: "hidden",
      paddingBottom: 88,
    },
    containerScrollView: {
      justifyContent: "flex-start",
      flex: 0,
    },
    content: {
      width: "100%",
      alignItems: "center",
    },
    title: {
      marginBottom: 3,
      marginTop: 3,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 28,
      lineHeight: 28,
      letterSpacing: -0.28,
    },
    subtitle: {
      marginBottom: 35,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 17,
      textAlign: "center",
      lineHeight: 22,
      letterSpacing: -0.17,
    },
    label: {
      width: "100%",
      alignItems: "flex-start",
      flexWrap: "wrap",
      marginBottom: 5,
      color: `${Colors[colorScheme || "light"].textLow}`,
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
    optionTextCreditWrapper: {
      color: Colors[colorScheme || "light"].textLow,
      textAlign: "center",
      fontFamily: "InterRegular",
      fontWeight: "400",
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: -0.13,
      maxWidth: 450,
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      flex: 1,
      flexWrap: "wrap",
      width: "100%",
      paddingTop: 16,
    },
    optionTextCredit: {
      color: Colors[colorScheme || "light"].textLow,
      textAlign: "center",
      fontFamily: "InterRegular",
      fontWeight: "400",
      fontSize: 13,
      lineHeight: 18,

      letterSpacing: -0.13,
    },
    optionTextCreditPressableWrapper: {
      height: 32,
      marginVertical: -7,
      alignItems: "center",
      justifyContent: "center",
    },
    inputSelected: {
      borderColor: `${Colors[colorScheme || "light"].buttonMuted}`,
    },
    inputText: {
      flex: 1,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterRegular",
      fontWeight: "500",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0,
      flexWrap: "nowrap",
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
    },
    buttonWrapperScrollView: {
      position: "absolute",
      bottom: 8,
      width: "100%",
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      paddingVertical: 8,
      paddingTop: 40,
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
    optionTextCreditPressable: {
      color: Colors[colorScheme || "light"].textLow,
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: -0.13,
    },
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.container,
          !inputStates.scrollView && styles.containerScrollView,
        ]}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.subtitle}>Please log in to continue.</Text>
          {renderInput("Email", "email")}
          {renderInput("Password", "password", true)}
          <View style={styles.optionTextCreditWrapper}>
            <Text style={styles.optionTextCredit}>Forgot your password?</Text>
            <Pressable
              style={styles.optionTextCreditPressableWrapper}
              onPress={() =>
                _handlePressButtonAsync("https://cureader.app/contact/")
              }
            >
              <Text style={styles.optionTextCreditPressable}> Email us </Text>
            </Pressable>
            <Text style={styles.optionTextCredit}>to have it reset.</Text>
          </View>
        </View>

        <View
          style={[
            styles.buttonWrapper,
            !inputStates.scrollView && styles.buttonWrapperScrollView,
          ]}
        >
          <TouchableOpacity
            title="Log In"
            disabled={loading}
            style={styles.button}
            onPress={signInWithEmail}
          >
            {loadingState ? (
              <ActivityIndicator
                color={`${Colors[colorScheme || "light"].colorOn}`}
              />
            ) : (
              <Text style={styles.buttonText}>Log In</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );

  function renderInput(label, inputName, isPassword = false) {
    return (
      <>
        <Text style={styles.label}>{label}</Text>
        <View
          style={[
            styles.input,
            inputStates[`isSearchInputSelected${isPassword ? "Two" : ""}`] &&
              styles.inputSelected,
          ]}
        >
          <TextInput
            style={styles.inputText}
            label={label}
            onChangeText={(text) =>
              setInputs((prevInputs) => ({ ...prevInputs, [inputName]: text }))
            }
            value={inputs[inputName]}
            placeholder={label.toLowerCase()}
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() =>
              handleInputFocus(
                `isSearchInputSelected${isPassword ? "Two" : ""}`
              )
            }
            onBlur={() =>
              handleInputBlur(`isSearchInputSelected${isPassword ? "Two" : ""}`)
            }
            secureTextEntry={isPassword && securePasswordEntry}
          />
          {isPassword && (
            <Pressable
              style={styles.inputButton}
              onPress={toggleSecurePasswordEntry}
            >
              <FontAwesome
                name={securePasswordEntry ? "eye-slash" : "eye"}
                size={24}
                color={Colors[colorScheme || "light"].buttonActive}
              />
            </Pressable>
          )}
        </View>
      </>
    );
  }
}
