import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  TextInput,
  View,
  Button,
  Text,
  SafeAreaView,
  StatusBar,
  KeyboardAvoidingView,
  TouchableOpacity,
  Pressable,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { supabase } from "../../lib/supabase-client";
import { Stack } from "expo-router";
import { Touchable } from "react-native";
import FontAwesome from "@expo/vector-icons/FontAwesome";

export default function Auth() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [securePasswordEntry, setSecurePasswordEntry] = useState(true);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      name: name,
      email: email,
      password: password,
    });

    if (error) Alert.alert("Sign In Error", error.message);
    setLoading(false);
  }

  async function signUpWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      name: name,
      email: email,
      password: password,
    });

    if (error) Alert.alert("Sign Up Error", error.message);
    setLoading(false);
  }

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Create an account</Text>
            <Text style={styles.subtitle}>Please sign in to continue</Text>

            {/*
            <TextInput
              style={styles.input}
              label="Name"
              onChangeText={(text) => setName(text)}
              value={name}
              placeholder="Your name"
              autoCapitalize={"none"}
              autoCorrect={false}
            />
              */}
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
                  color="rgba(24,24,24,.6)"
                />
              </Pressable>
            </View>
          </View>
          <TouchableOpacity
            title="Sign in"
            disabled={loading}
            style={styles.button}
            onPress={() => signInWithEmail()}
          >
            <Text style={styles.buttonText}>Sign in</Text>
          </TouchableOpacity>
          {/*
          <Button
            title="Sign up"
            disabled={loading}
            onPress={() => signUpWithEmail()}
          >
            <Text>Sign up</Text>
          </Button>
  */}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeAreaView: {
    // borderWidth: 3,
    // borderColor: "#ff0000",
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardAvoidingView: {
    // borderWidth: 3,
    // borderColor: "blue",
    flex: 1,
  },
  container: {
    flex: 1,
    // borderWidth: 3,
    backgroundColor: "#fff",
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
    color: "#181818",
    fontFamily: "NotoSerifMedium",
    fontSize: 29,
    lineHeight: 29,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: "InterMedium",
    color: "#181818",
    letterSpacing: -0.209,
    fontSize: 19,
    lineHeight: 19,
    marginBottom: 40,
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
    color: "#181818",
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
    borderColor: "#e5e5e5",
    backgroundColor: "rgba(24,24,24,0.01)",
    alignContent: "center",
    justifyContent: "space-between",
  },
  inputText: {
    flex: 1,
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
    backgroundColor: "#FF3E39",
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
  },
  buttonText: {
    color: "white",
    fontFamily: "InterBold",
    fontWeight: "700",
    fontSize: 15,
  },
});