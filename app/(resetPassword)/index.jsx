import React, { useContext, useEffect, useState } from "react";
import {
  Alert,
  TextInput,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { supabase } from "../../config/supabase";

import Colors from "../../constants/Colors";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { router } from "expo-router";

export default function Auth() {
  const colorScheme = useColorScheme();
  const [isSearchInputSelectedTwo, setIsSearchInputSelectedTwo] =
    useState(false);
  const [scrollView, setScrollView] = useState(true);
  const [email, setEmail] = useState("");
  const [loadingState, setLoadingState] = useState(false);
  const [removalDisabled, setRemovalDisabled] = useState(true);

  useEffect(() => {
    setRemovalDisabled(email == "");
  }, [email]);

  const handleFocusTwo = () => {
    setIsSearchInputSelectedTwo(true);
    setScrollView(false);
  };

  const handleBlurTwo = () => {
    setIsSearchInputSelectedTwo(false);
    setScrollView(true);
  };

  async function resetPassword() {
    setLoadingState(true);
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "https://example.com/update-password",
      });
      router.replace("(waitingPassword)");
    } catch (error) {
      setLoadingState(false);
      console.error("An error occurred during password reset:", error);
    }
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
    buttonDisabled: {
      height: 48,
      width: "100%",
      flexDirection: "row",
      backgroundColor: `${Colors[colorScheme || "light"].buttonMuted}`,
      opacity: 0.87,
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
          <Text style={styles.title}>Reset Your Password</Text>
          <Text style={styles.subtitle}>
            Enter your email for a recovery link.
          </Text>
          <Text style={styles.label}>Account email address</Text>
          <TextInput
            style={[
              styles.input,
              isSearchInputSelectedTwo && styles.inputSelected,
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
        </View>
        <View
          style={[
            styles.buttonWrapper,
            !scrollView && styles.buttonWrapperScrollView,
          ]}
        >
          {!removalDisabled ? (
            <TouchableOpacity
              title="Sign up"
              disabled={removalDisabled}
              style={styles.button}
              onPress={() => resetPassword()}
            >
              {loadingState ? (
                <ActivityIndicator
                  color={`${Colors[colorScheme || "light"].colorOn}`}
                />
              ) : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              title="Sign Up"
              disabled={removalDisabled}
              style={styles.buttonDisabled}
              onPress={() => resetPassword()}
            >
              {loadingState ? (
                <ActivityIndicator
                  color={`${Colors[colorScheme || "light"].colorOn}`}
                />
              ) : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
}
