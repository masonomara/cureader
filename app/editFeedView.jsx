import React, { useState, useEffect, useContext } from "react";
import {
  Alert,
  TextInput,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import Colors from "../constants/Colors";

import { supabase } from "../config/supabase";
import { router, useLocalSearchParams } from "expo-router";
import FeedCardDummyPreview from "../components/FeedCarDummyPreview";
import { FeedContext } from "./_layout";
import X20 from "../components/icons/20/X20";

export default function TabOneScreen() {
  const params = useLocalSearchParams();
  const { setFeeds, feedCategories, setFeedCategories } =
    useContext(FeedContext);
  const [dummyTitle, setDummyTitle] = useState("");
  const [dummyDescription, setDummyDescription] = useState("");
  const [dummyImageUrl, setDummyImageUrl] = useState("");
  const [newCategory, setNewCategory] = useState("");

  console.log("[]:", feedCategories[0].channels);

  useEffect(() => {
    // Set initial values when params.title changes
    setDummyTitle(params.title || "");
    setDummyDescription(params.description || ""); // Set your initial description here
    setDummyImageUrl(params.image || ""); // Set your initial image URL here
  }, [params.title]);

  const colorScheme = useColorScheme();
  const [loading, setLoading] = useState(false);
  const [securePasswordEntry, setSecurePasswordEntry] = useState(true);

  const [inputStates, setInputStates] = useState({
    isSearchInputSelectedtitle: false,
    isSearchInputSelecteddescription: false,
    isSearchInputSelectedimageUrl: false,
    isSearchInputSelectedCategories: false,
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

  const updateFeedInfo = async () => {
    setLoading(true);
    try {
      const timestamp = new Date().toISOString(); // Get current timestamp

      await supabase
        .from("channels")
        .update({
          channel_title: dummyTitle,
          channel_description: dummyDescription,
          channel_image_url: dummyImageUrl,
          channel_updated: timestamp, // Add the timestamp field
        })
        .eq("id", params.id);
      Alert.alert(
        "Update Successful",
        "Feed information updated successfully."
      );

      try {
        const { data: feedsData, error: feedsError } = await supabase
          .from("channels")
          .select("*");

        if (feedsError) {
          console.error("Error fetching feeds:", feedsError);

          return;
        }

        setFeeds(feedsData);
      } catch (error) {
        console.error("Error fetching feeds:", error);

        throw error;
      }
    } catch (error) {
      console.error("Update failed:", error);
      Alert.alert("Update Failed", "Failed to update feed information.");
    } finally {
      router.back();
      setLoading(false);
    }
  };

  const handleSubmitCategory = async (newCategory) => {
    console.log("feedCategories:", feedCategories);
    console.log("newCategory:", newCategory);

    const isCategoryExists = feedCategories.some(
      (category) => category.title === newCategory.trim()
    );

    try {
      if (isCategoryExists) {
        // Update the existing category with params.id
        const { data: updatedCategoryData, error: updateError } = await supabase
          .from("categories")
          .update({
            channels: [
              ...feedCategories.find((c) => c.title === newCategory.trim())
                .channels,
              params.id,
            ],
          })
          .eq("title", newCategory.trim());

        if (updateError) {
          console.error("Error updating category:", updateError);
          // Handle error if category update fails
          return;
        }
      } else {
        console.log("Category doesn't exist. Creating a new one.");

        // Create a new category entry
        const { data: newCategoryData, error: categoryError } = await supabase
          .from("categories")
          .upsert([
            {
              title: newCategory.trim(),
              channels: [params.id],
            },
          ])
          .select()
          .single();

        if (categoryError) {
          console.error("Error creating category:", categoryError);
          // Handle error if category creation fails
          return;
        }
      }

      // Refresh feed categories context
      const { data: updatedCategories, error: fetchError } = await supabase
        .from("categories")
        .select("*");

      setFeedCategories(updatedCategories);

      // Clear input
      setNewCategory(null);
    } catch (error) {
      console.error("Error handling category:", error);
      // Handle any unexpected errors
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
      flex: 0,
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      alignItems: "center",
      justifyContent: "flex-start",
      padding: 24,

      paddingBottom: 96,
    },
    containerScrollView: {
      justifyContent: "flex-start",
      flex: 0,
      paddingBottom: 88,
    },
    content: {
      width: "100%",
      alignItems: "center",

      flex: 1,
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
      marginBottom: 24,
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
      height: 22,
      marginVertical: 16,
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
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.container,
          !inputStates.scrollView && styles.containerScrollView,
        ]}
        // ... Other props remain unchanged
      >
        <View style={styles.content}>
          <Text style={styles.title}>Edit Public Feed</Text>
          <Text style={styles.subtitle}>
            You are able to edit this public feed as the first subscriber.
          </Text>
          <Text style={styles.label}>Feed Preview</Text>
          <FeedCardDummyPreview
            title={dummyTitle}
            description={dummyDescription}
            imageUrl={dummyImageUrl}
          />
          {renderInput("New Feed Title", `${params.title}`, `dummyTitle`)}
          {renderInput(
            "New Feed Description",
            `${params.description}`,
            `dummyDescription`
          )}
          {renderInput(
            "New Feed Image URL",
            `${params.imageUrl}`,
            `dummyImageUrl`
          )}
          <Text style={styles.label}>New Categories (seperate with comma)</Text>
          <View
            style={[
              styles.input,
              inputStates[`isSearchInputSelectedCategories`] &&
                styles.inputSelected,
            ]}
          >
            <TextInput
              style={styles.inputText}
              label="Categories"
              onChangeText={(text) => {
                setNewCategory(text);
              }}
              value={newCategory}
              placeholder="Enter a new category"
              autoCapitalize="words"
              autoCorrect={true}
              onFocus={() =>
                handleInputFocus(`isSearchInputSelectedCategories`)
              }
              onBlur={() => handleInputBlur(`isSearchInputSelectedCategories`)}
              multiline={false}
              onSubmitEditing={() => handleSubmitCategory(newCategory)}
            />
          </View>

          <View
            style={{
              display: "flex",

              width: "100%",

              marginBottom: 24,
            }}
          >
            {feedCategories
              .filter((category) => category.channels.includes(params.id))
              .map((category, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    height: 44,
                    alignSelf: "flex-start",
                    padding: 10,
                    paddingHorizontal: 16,
                    borderRadius: 100,
                    backgroundColor: `${
                      Colors[colorScheme || "light"].surfaceOne
                    }`,
                  }}
                >
                  <Text
                    style={{
                      color: `${Colors[colorScheme || "light"].buttonActive}`,
                      fontFamily: "InterMedium",
                      fontWeight: "500",
                      fontSize: 14,
                      lineHeight: 19,
                      letterSpacing: -0.14,
                    }}
                  >
                    {category.title}
                  </Text>
                  <View>
                    <X20 color={Colors[colorScheme || "light"].buttonActive} />
                  </View>
                </View>
              ))}
          </View>
        </View>
        {renderButton("Update Feed Info", updateFeedInfo)}
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );

  function renderInput(label, placeholder, inputName, isPassword = false) {
    return (
      <>
        <Text style={styles.label}>{label}</Text>
        <View
          style={[
            styles.input,
            inputStates[`isSearchInputSelected${inputName}`] &&
              styles.inputSelected,
          ]}
        >
          <TextInput
            style={styles.inputText}
            label={label}
            onChangeText={(text) => {
              // Update the corresponding state based on inputName
              switch (inputName) {
                case "dummyTitle":
                  setDummyTitle(text);
                  break;
                case "dummyDescription":
                  setDummyDescription(text);
                  break;
                case "dummyImageUrl":
                  setDummyImageUrl(text);
                  break;
                default:
                  break;
              }
            }}
            value={
              // Get the corresponding value based on inputName
              inputName === "dummyTitle"
                ? dummyTitle
                : inputName === "dummyDescription"
                ? dummyDescription
                : dummyImageUrl
            }
            placeholder={placeholder}
            autoCapitalize="none"
            autoCorrect={false}
            onFocus={() =>
              handleInputFocus(`isSearchInputSelected${inputName}`)
            }
            onBlur={() => handleInputBlur(`isSearchInputSelected${inputName}`)}
            secureTextEntry={isPassword && securePasswordEntry}
            multiline={false}
          />
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
