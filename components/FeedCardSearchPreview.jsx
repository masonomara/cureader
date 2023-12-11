import { useContext, useState } from "react";
import { View, Text, TouchableOpacity, Alert, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useColorScheme } from "react-native";
import { supabase } from "../config/initSupabase";
import Colors from "../constants/Colors";
import { AuthContext } from "../app/_layout";

const CARD_WIDTH = Dimensions.get("window").width - 32;

const textColorArray = [
  "#E75450", // Red (Main Color)
  "#66C0A9", // Green
  "#FADA65", // Yellow
  "#7929B2", // Purple
  "#FF8C69", // Salmon
  "#00B3A9", // Teal
  "#E6532D", // Orange
  "#3CB8B2", // Teal
  "#FF7B00", // Orange
  "#1A9E95", // Teal
  "#E64400", // Red
  "#2DC82D", // Green
  "#FFD3A3", // Pale
  "#00EB8F", // Green
  "#E76E3F", // Orange
  "#00ADC4", // Blue
  "#FF9400", // Orange
  "#6D5DC8", // Purple
  "#FF8C69", // Salmon
  "#7AC3D4", // Blue
  "#C7132D", // Pink
  "#8FEB8D", // Green
  "#E64400", // Red
  "#8560C1", // Purple
  "#FFC800", // Gold
  "#6988EF", // Blue
];
const colorArray = [
  "#FF6961", // Red (Main Color)
  "#78D2B2", // Green
  "#FAEA96", // Yellow
  "#8A2BE2", // Purple
  "#FFA07A", // Salmon
  "#00CED1", // Teal
  "#FF6347", // Orange
  "#48D1CC", // Teal
  "#FF8C00", // Orange
  "#20B2AA", // Teal
  "#FF4500", // Red
  "#74D674", // Green
  "#FFDAB9", // Pale
  "#00FA9A", // Green
  "#FF7F50", // Orange
  "#00BFFF", // Blue
  "#FFA500", // Orange
  "#7B68EE", // Purple
  "#FFA07A", // Salmon
  "#87CEEB", // Blue
  "#DC143C", // Pink
  "#98FB98", // Green
  "#FF4500", // Red
  "#9370DB", // Purple
  "#FFD700", // Gold
  "#849BE9", // Blue
];

export default function FeedCardSearchPreview({
  channelUrl,
  channelTitle,
  channelDescription,
  channelImageUrl,
}) {
  const { user } = useContext(AuthContext);
  const [isOptimisticSubscribed, setIsOptimisticSubscribed] = useState(false);

  const colorScheme = useColorScheme();

  const showErrorAlert = (message) => {
    Alert.alert("Error", message);
  };

  const handleSubmitUrl = async () => {
    setIsOptimisticSubscribed(!isOptimisticSubscribed);

    if (!channelUrl) {
      showErrorAlert("Please fill in the field correctly");
      return;
    }

    try {
      // Fetch the channel title
      const response = await fetch(channelUrl);

      if (!response.ok) {
        throw new Error(
          "Network response was not ok, could not fetch channelUrl"
        );
      }

      // Check if the channel already exists
      const { data: existingChannelData, error: existingChannelError } =
        await supabase.from("channels").select().eq("channel_url", channelUrl);

      if (existingChannelError) {
        showErrorAlert("Error checking channel data. Please try again.");
        return;
      }

      if (existingChannelData.length > 0) {
        const existingChannel = existingChannelData[0];
        if (!existingChannel.channel_subscribers) {
          existingChannel.channel_subscribers = []; // Create an empty subscribers array
        }

        if (existingChannel.channel_subscribers.includes(user.id)) {
          showErrorAlert("You are already subscribed to this channel.");
        } else {
          const newSubscribers = [
            ...existingChannel.channel_subscribers,
            user.id,
          ];
          const { data: updateData, error: updateError } = await supabase
            .from("channels")
            .upsert([
              {
                id: existingChannel.id,
                channel_subscribers: newSubscribers,
              },
            ]);

          if (updateError) {
            showErrorAlert("Error updating channel data. Please try again.");
          } else {
            showErrorAlert("Success", "You have subscribed to the channel.");

            const channelId = existingChannel.id;
            const channelUrl = existingChannel.channel_url;

            // Fetch the user's existing channel subscriptions

            const { data: userProfileData, error: userProfileError } =
              await supabase
                .from("profiles")
                .select("channel_subscriptions")
                .eq("id", user.id);

            if (userProfileError) {
              showErrorAlert(
                "Error fetching user profile data. Please try again."
              );
            } else {
              const existingSubscriptions =
                userProfileData[0].channel_subscriptions || [];

              // Create a new subscription object with channelId and channelUrl
              const newSubscription = { channelId, channelUrl };

              // Add the new subscription to the existing subscriptions
              const newSubscriptions = [
                ...existingSubscriptions,
                newSubscription,
              ];

              // Update the user profile with the updated subscriptions
              const { data: updatedProfileData, error: updatedProfileError } =
                await supabase.from("profiles").upsert([
                  {
                    id: user.id,
                    channel_subscriptions: newSubscriptions,
                  },
                ]);

              if (updatedProfileError) {
                showErrorAlert(
                  "Error updating user profile. Please try again."
                );
              } else {
                showErrorAlert(
                  "Success",
                  "Profile subscription successfully updated"
                );
              }
            }
          }
        }
      } else {
        // Create a new channel entry
        const { data: channelData, error: channelError } = await supabase
          .from("channels")
          .upsert([
            {
              channel_url: channelUrl,
              channel_title: channelTitle,
              channel_subscribers: [user.id], // Create an array with the user's ID
              channel_image_url: channelImageUrl,
              channel_description: channelDescription,
            },
          ])
          .select()
          .single();

        if (channelError) {
          showErrorAlert("Error uploading channel data. Please try again.");
        } else {
          showErrorAlert("Success", "Channel data uploaded successfully.");

          const channelId = channelData.id;
          const channelUrl = channelData.channel_url;

          // Fetch the user's existing channel subscriptions

          const { data: userProfileData, error: userProfileError } =
            await supabase
              .from("profiles")
              .select("channel_subscriptions")
              .eq("id", user.id);

          if (userProfileError) {
            showErrorAlert(
              "Error fetching user profile data. Please try again."
            );
          } else {
            const existingSubscriptions =
              userProfileData[0].channel_subscriptions || [];

            // Create a new subscription object with channelId and channelUrl
            const newSubscription = { channelId, channelUrl };

            // Add the new subscription to the existing subscriptions
            const newSubscriptions = [
              ...existingSubscriptions,
              newSubscription,
            ];

            // Update the user profile with the updated subscriptions
            const { data: updatedProfileData, error: updatedProfileError } =
              await supabase.from("profiles").upsert([
                {
                  id: user.id,
                  channel_subscriptions: newSubscriptions,
                },
              ]);

            if (updatedProfileError) {
              showErrorAlert("Error updating user profile. Please try again.");
            } else {
              showErrorAlert(
                "Success",
                "Profile subscription successfully updated"
              );
            }
          }
        }
      }
    } catch (error) {
      setIsOptimisticSubscribed(!isOptimisticSubscribed);

      console.error("Error fetching or uploading channel data:", error);

      if (error.message.includes("suitable URL request handler found")) {
        console.log(
          "Ignoring the 'no suitable URL request handler found' error."
        );
        // Optionally display a user-friendly message to the user or take appropriate action.
      } else {
        showErrorAlert(
          "Error fetching or uploading channel data. Please try again."
        );
      }
    }
  };

  // Functions to get background color based on the first letter
  const getColorForLetter = (letter) => {
    const index = letter.toUpperCase().charCodeAt(0) % colorArray.length;
    return colorArray[index];
  };
  const getTextColorForLetter = (letter) => {
    const index = letter.toUpperCase().charCodeAt(0) % textColorArray.length;
    return textColorArray[index];
  };

  const styles = {
    card: {
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      borderBottomWidth: 1,
      borderColor: `${Colors[colorScheme || "light"].border}`,
      alignItems: "center",
      flexDirection: "row",
      display: "flex",
      flex: 1,
      width: CARD_WIDTH,
      gap: 0,
      paddingVertical: 12,
      height: 89,
      minHeight: 89,
      maxHeight: 89,
    },
    cardContent: {
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
      flex: 1,
      paddingLeft: 12,
      paddingRight: 0,
      gap: 8,
    },
    cardInfo: {
      flex: 1,
      alignItems: "flex-start",
      justifyContent: "flex-start",
      overflow: "hidden",
      height: 64,
      marginTop: -2,
      arginBottom: -2,
    },
    title: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      alignItems: "flex-start",
      flexWrap: "wrap",
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0.17,
      marginBottom: 2,
    },
    cardControls: {
      flexDirection: "row",
      gap: 12,
      alignItems: "flex-end",
    },
    description: {
      flex: 1,
      maxHeight: 38,
      color: `${Colors[colorScheme || "light"].textMedium}`,
      fontFamily: "InterRegular",
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.14,
      height: "100%",
    },
    subscribeButton: {
      backgroundColor: `${Colors[colorScheme || "light"].colorPrimary}`,
      borderRadius: 100,
      width: 88,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: 34,
    },
    subscribedButton: {
      backgroundColor: `${Colors[colorScheme || "light"].surfaceOne}`,
      borderRadius: 100,
      width: 88,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: 34,
      opacity: 0.87,
    },
    subscribeButtonText: {
      color: `${Colors[colorScheme || "light"].colorOn}`,
      fontFamily: "InterBold",
      fontWeight: "700",
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.15,
    },
    subscribedButtonText: {
      color: `${Colors[colorScheme || "light"].colorPrimary}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.15,
    },
    noImageContainer: {
      height: 64,
      width: 64,
      borderRadius: 10,
      backgroundColor: getColorForLetter(channelTitle[0]),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    noImageContainerText: {
      fontFamily: "NotoSerifMedium",
      fontWeight: "500",
      fontSize: 23,
      lineHeight: 26,
      letterSpacing: -0.173,
      height: 26,
      color: getTextColorForLetter(channelTitle[0]),
      textAlignVertical: "center",
      textAlign: "center",
      width: "1000%",
    },
  };

  return (
    <View style={styles.card}>
      {!channelImageUrl ? (
        <View style={styles.noImageContainer}>
          <Text style={styles.noImageContainerText}>
            {channelTitle} {channelTitle}
          </Text>
          <Text style={styles.noImageContainerText}>
            {channelTitle} {channelTitle} {channelTitle}
          </Text>
          <Text style={styles.noImageContainerText}>
            {channelTitle} {channelTitle}
          </Text>
        </View>
      ) : (
        <View
          style={{
            aspectRatio: "1/1",
            width: 64,
            overflow: "hidden",
            borderRadius: 10,
          }}
        >
          <Image
            style={{
              flex: 1,
              borderRadius: 12,
              borderWidth: 0.67,
              borderColor: `${Colors[colorScheme || "light"].border}`,
            }}
            contentFit="cover"
            source={{ uri: channelImageUrl }}
          />
        </View>
      )}
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {channelTitle}
          </Text>
          {channelDescription ? (
            <Text numberOfLines={2} style={styles.description}>
              {channelDescription
                .replace(/<[^>]*>/g, "")
                .replace(/&#8216;/g, "‘")
                .replace(/&#8217;/g, "’")
                .replace(/&#160;/g, " ")
                .replace(/&#8220;/g, "“")
                .replace(/&#8221;/g, "”")
                .trim()}
            </Text>
          ) : (
            <Text numberOfLines={2} style={styles.description}></Text>
          )}
        </View>
        <View style={styles.cardControls}>
          <TouchableOpacity
            style={
              isOptimisticSubscribed
                ? styles.subscribedButton
                : styles.subscribeButton
            }
            onPress={handleSubmitUrl}
          >
            <Text
              style={
                isOptimisticSubscribed.toString() === "true"
                  ? styles.subscribedButtonText
                  : styles.subscribeButtonText
              }
            >
              {isOptimisticSubscribed.toString() === "true"
                ? "Following"
                : "Follow"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
