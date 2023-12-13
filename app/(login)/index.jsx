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
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import Colors from "../../constants/Colors";
import { supabase } from "../../config/supabase";

export default function Auth() {
  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState(false);
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
    const { error } = await supabase.auth.signInWithPassword({
      email: inputs.email,
      password: inputs.password,
    });

    if (error) Alert.alert("Log In Error", error.message);
    setLoading(false);
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
  };

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <KeyboardAwareScrollView
        contentContainerStyle={[
          styles.container,
          !inputStates.scrollView && styles.containerScrollView,
        ]}
        // ... Other props remain unchanged
      >
        <View style={styles.content}>
          <Text style={styles.title}>Welcome!</Text>
          <Text style={styles.subtitle}>Please log in to continue</Text>
          {renderInput("Email", "email")}
          {renderInput("Password", "password", true)}
        </View>
        {renderButton("Log in", signInWithEmail)}
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

  function renderButton(title, onPress) {
    return (
      <View
        style={[
          styles.buttonWrapper,
          !inputStates.scrollView && styles.buttonWrapperScrollView,
        ]}
      >
        <TouchableOpacity
          title={title}
          disabled={loading}
          style={styles.button}
          onPress={onPress}
        >
          <Text style={styles.buttonText}>{title}</Text>
        </TouchableOpacity>
      </View>
    );
  }
}
