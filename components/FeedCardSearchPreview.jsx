import { useContext, useState, useLayoutEffect } from "react";
import { View, Text, TouchableOpacity, Alert, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useColorScheme } from "react-native";
import { supabase } from "../config/supabase";
import Colors from "../constants/Colors";
import { AuthContext } from "../app/_layout";
import { getColorForLetter, getTextColorForLetter } from "../app/utils/Styling";
import { formatDescription } from "../app/utils/Formatting";

const CARD_WIDTH = Dimensions.get("window").width - 32;

export default function FeedCardSearchPreview({
  channelUrl,
  channelTitle,
  channelDescription,
  channelImageUrl,
}) {
  const {
    user,
    userSubscriptionUrls,
    userSubscriptionIds,
    setUserSubscriptionIds,
    setUserSubscriptionUrls,
  } = useContext(AuthContext);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const colorScheme = useColorScheme();

  const handleSubmitUrl = async () => {
    const optimisticSubscribed = !isSubscribed;
    setIsSubscribed(optimisticSubscribed);

    try {
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
        console.log("channelData is null:", error);
      } else {
        const updatedUserSubscriptionIds = [
          ...userSubscriptionIds,
          channelData.id,
        ];

        const updatedUserSubscriptionUrls = [
          ...userSubscriptionUrls,
          channelData.channel_url,
        ];

        setUserSubscriptionIds(updatedUserSubscriptionIds);
        setUserSubscriptionUrls(updatedUserSubscriptionUrls);

        // Wait for the update to complete before moving on
        await supabase
          .from("profiles")
          .update({
            channel_subscriptions: updatedUserSubscriptionIds.map(
              (id, index) => ({
                channelId: id,
                channelUrl: updatedUserSubscriptionUrls[index],
              })
            ),
          })
          .eq("id", user.id);
      }
    } catch (error) {
      setIsSubscribed(!isSubscribed);
      console.error("Error fetching or uploading channel data:", error);
    }
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
              {formatDescription(channelDescription, 200)}
            </Text>
          ) : (
            <Text numberOfLines={2} style={styles.description}></Text>
          )}
        </View>
        <View style={styles.cardControls}>
          <TouchableOpacity
            style={
              isSubscribed ? styles.subscribedButton : styles.subscribeButton
            }
            onPress={handleSubmitUrl}
          >
            <Text
              style={
                isSubscribed
                  ? styles.subscribedButtonText
                  : styles.subscribeButtonText
              }
            >
              {isSubscribed ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
