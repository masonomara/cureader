import React, { useState, useEffect, useContext, useRef } from "react";
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
  const { setFeeds, feedCategories, setFeedCategories, feeds } =
    useContext(FeedContext);
  const [dummyTitle, setDummyTitle] = useState("");
  const [dummyDescription, setDummyDescription] = useState("");
  const [dummyImageUrl, setDummyImageUrl] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const categoryInputRef = useRef(null);

  const isValidImageUrl = (url) => {
    // Define the supported image formats
    const supportedFormats = ["webp", "jpeg", "jpg", "png"];

    // Extract the file extension from the URL
    const fileExtension = url.split(".").pop().toLowerCase();

    // Check if the file extension is in the list of supported formats
    return supportedFormats.includes(fileExtension);
  };

  useEffect(() => {
    setDummyTitle(params.title || "");
    setDummyDescription(params.description || "");
    setDummyImageUrl(params.image || "");
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
    // Validate the new feed image URL before updating
    if (dummyImageUrl && !isValidImageUrl(dummyImageUrl)) {
      Alert.alert(
        "Invalid Image URL",
        "Please enter a an image that ends with .webp, .jpeg, .jpg, or .png."
      );
      setLoading(false);
      return;
    }

    try {
      const timestamp = new Date().toISOString();

      await supabase
        .from("channels")
        .update({
          channel_title: dummyTitle,
          channel_description: dummyDescription,
          channel_image_url: dummyImageUrl,
          channel_updated: timestamp,
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
    const existingCategory = feedCategories.some(
      (category) => category.title === newCategory.trim()
    );

    try {
      if (existingCategory) {
        const { error: updateError } = await supabase
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

          return;
        }
      } else {
        const { error: categoryError } = await supabase
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

          return;
        }
      }

      const { data: updatedCategories } = await supabase
        .from("categories")
        .select("*");

      setFeedCategories(updatedCategories);

      setNewCategory(null);

      await supabase
        .from("channels")
        .update({
          channel_categories: updatedCategories
            .filter((category) => category.channels.includes(params.id))
            .map((category) => category.title),
        })
        .eq("id", params.id);

      categoryInputRef.current?.focus();
    } catch (error) {
      console.error("Error handling category:", error);
    }
  };

  const handleDeleteCategory = async (category) => {
    try {
      const { error: updateCategoryError } = await supabase
        .from("categories")
        .update({
          channels: feeds
            .filter(
              (feed) =>
                feed.channel_categories?.includes(category.title) &
                (feed.id != params.id)
            )
            .map((feed) => feed.id.toString()),
        })
        .eq("id", category.id);

      if (updateCategoryError) {
        console.error("Error updating category:", updateCategoryError);
        return;
      }

      await supabase
        .from("channels")
        .update({
          channel_categories: feedCategories
            .filter(
              (feedCategory) =>
                feedCategory.title !== category.title &&
                feedCategory.channels.includes(params.id)
            )
            .map((feedCategory) => feedCategory.title),
        })
        .eq("id", params.id);

      const { data: updatedCategories } = await supabase
        .from("categories")
        .select("*");

      setFeedCategories(updatedCategories);
    } catch (error) {
      console.error("Error handling category deletion:", error);
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
      padding: 16,
      paddingHorizontal: 24,
      paddingTop: 40,
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
      marginBottom: 36,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 17,
      textAlign: "center",
      lineHeight: 22,
      letterSpacing: -0.17,
      paddingHorizontal: 8,
    },

    label: {
      width: "100%",
      paddingHorizontal: 2,
      alignItems: "flex-start",

      marginBottom: 5,
      color: `${Colors[colorScheme || "light"].textLow}`,
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: -0.13,
    },
    input: {
      flex: 1,

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
      >
        <View style={styles.content}>
          <Text style={styles.title}>Edit Public Feed</Text>
          <Text style={styles.subtitle}>
            As a feed admin, any changes you make to this feed will be visible
            to the entire Cureader community.
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
          <Text style={styles.label}>
            New Categories (Press enter to submit category)
          </Text>
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
              ref={categoryInputRef}
            />
          </View>

          <View
            style={{
              display: "flex",
              marginHorizontal: 8,
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "flex-start",
              flexWrap: "wrap",
              gap: 8,
              width: "100%",

              marginTop: -4,
              marginBottom: 24,
            }}
          >
            {feedCategories
              .filter((category) => category.channels.includes(params.id))
              .map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    height: 44,
                    alignSelf: "center",
                    padding: 8,
                    gap: 3,
                    paddingLeft: 14,
                    paddingRight: 12,
                    borderRadius: 100,
                    backgroundColor: `${
                      Colors[colorScheme || "light"].surfaceOne
                    }`,
                  }}
                  onPress={() => handleDeleteCategory(category)}
                >
                  <Text
                    style={{
                      color: `${Colors[colorScheme || "light"].textMedium}`,
                      fontFamily: "InterMedium",
                      fontWeight: "500",
                      fontSize: 15,
                      lineHeight: 20,
                      letterSpacing: -0.15,
                    }}
                  >
                    {category.title}
                  </Text>
                  <View>
                    <X20 color={Colors[colorScheme || "light"].textMedium} />
                  </View>
                </TouchableOpacity>
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
