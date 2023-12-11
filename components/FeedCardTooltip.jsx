import { useState, useContext, useLayoutEffect } from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";

import { useColorScheme } from "react-native";
import { supabase } from "../config/initSupabase";
import Colors from "../constants/Colors";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  renderers,
} from "react-native-popup-menu";
import Dots20 from "./icons/20/Dots20";
import { AuthContext, FeedContext } from "../app/_layout";

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

export default function FeedCardToolTip({ item }) {
  console.log("tooltip item:", item);
  const { feeds } = useContext(FeedContext);
  const {
    user,
    userSubscriptionUrls,
    userSubscriptionIds,
    setUserSubscriptionIds,
    setUserSubscriptionUrls,
  } = useContext(AuthContext);

  const [isSubscribed, setIsSubscribed] = useState(true);
  const [isOptimisticSubscribed, setIsOptimisticSubscribed] = useState(true);

  console.log("tooltip userSubscriptionIds:", userSubscriptionIds);

  const colorScheme = useColorScheme();

  const handleSubscribe = async () => {
    setIsOptimisticSubscribed(!isOptimisticSubscribed);

    try {
      if (isSubscribed) {
        // If the user is already subscribed to the feed
        const updatedUserSubscriptionIds = userSubscriptionIds.filter(
          (id) => id !== item.id
        );
        const updatedUserSubscriptionUrls = userSubscriptionUrls.filter(
          (url) => url !== item.channel_url
        );

        // Update the state with the new arrays
        setUserSubscriptionIds(updatedUserSubscriptionIds);
        setUserSubscriptionUrls(updatedUserSubscriptionUrls);

        // Update the user's subscriptions in supabase
        await updateUserSubscriptions(
          updatedUserSubscriptionIds,
          updatedUserSubscriptionUrls
        );

        // Update channel subscribers count in supabase
        await updateChannelSubscribers(item.id, user.id, false);
      } else {
        // If the user is not subscribed to the feed
        setUserSubscriptionIds([...userSubscriptionIds, item.id]);
        setUserSubscriptionUrls([...userSubscriptionUrls, item.channel_url]);

        // Update the user's subscriptions in supabase
        await updateUserSubscriptions(
          [...userSubscriptionIds, item.id],
          [...userSubscriptionUrls, item.channel_url]
        );

        // Update channel subscribers count in supabase
        await updateChannelSubscribers(item.id, user.id, true);
      }
    } catch (error) {
      console.error("Error handling subscription:", error);
      // Handle errors and revert the state if necessary
      setIsOptimisticSubscribed(!isOptimisticSubscribed);
    }
  };

  const updateUserSubscriptions = async (updatedIds, updatedUrls) => {
    try {
      await supabase
        .from("profiles")
        .update({
          channel_subscriptions: updatedIds.map((id, index) => ({
            channelId: id,
            channelUrl: updatedUrls[index],
          })),
        })
        .eq("id", user.id);
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error; // Rethrow the error to handle it elsewhere if needed
    }
  };

  const updateChannelSubscribers = async (
    channelId,
    userId,
    subscribe = true
  ) => {
    try {
      const channelIndex = feeds.findIndex((feed) => feed.id === channelId);

      if (channelIndex !== -1) {
        const updatedFeeds = [...feeds];
        const channelSubscribers =
          updatedFeeds[channelIndex].channel_subscribers || [];

        // Update the channel_subscribers array based on the subscribe flag
        updatedFeeds[channelIndex].channel_subscribers = subscribe
          ? [...channelSubscribers, userId]
          : channelSubscribers.filter((sub) => sub !== userId);

        // Update the channel_subscribers array in Supabase
        await supabase
          .from("channels")
          .update({
            channel_subscribers: updatedFeeds[channelIndex].channel_subscribers,
          })
          .eq("id", channelId);
      } else {
        console.error("Channel not found in the feeds prop");
      }
    } catch (error) {
      console.error("Error updating channel subscribers:", error);
      throw error;
    }
  };

  // Function to get background color based on the first letter
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
      width: "100%",
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
    tooptipPublicationWrapper: {
      borderBottomWidth: 1,
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      borderBottomWidth: 1,
      borderColor: `${Colors[colorScheme || "light"].border}`,
      alignItems: "center",
      flexDirection: "row",
      display: "flex",
      flex: 1,
      width: "100%",
      gap: 0,
      paddingVertical: 12,
      paddingBottom: 16,
      height: 89,
      minHeight: 89,
      maxHeight: 89,
    },
    tooltipContent: {
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
      flex: 1,
      paddingLeft: 12,
      paddingRight: 0,
      gap: 8,
    },
    tooltipInfo: {
      flex: 1,
      alignItems: "flex-start",
      justifyContent: "flex-start",
      overflow: "hidden",
      height: 64,
      marginTop: -2,
      arginBottom: -2,
    },
    tooltipTitle: {
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
    tooltipDescription: {
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
    tooltipDivider: {
      height: 1,
      width: "100%",
      backgroundColor: `${Colors[colorScheme || "light"].border}`,
    },
    noImageContainer: {
      height: 64,
      width: 64,
      borderRadius: 10,
      backgroundColor: getColorForLetter(item.channel_title[0]),
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
      color: getTextColorForLetter(item.channel_title[0]),
      textAlignVertical: "center",
      textAlign: "center",
      width: "1000%",
    },
  };

  return (
    <Menu renderer={renderers.SlideInMenu}>
      <MenuTrigger
        customStyles={{
          triggerTouchable: {
            underlayColor: "transparent",
            activeOpacity: 0.2,
            style: {
              height: 40,
              minWidth: 40,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              gap: 5,
              borderWidth: 0.5,
              borderColor: Colors[colorScheme || "light"].border,
              borderRadius: 100,
            },
          },
        }}
      >
        <Dots20
          style={styles.buttonImage}
          color={Colors[colorScheme || "light"].buttonActive}
        />
      </MenuTrigger>
      <MenuOptions
        customStyles={{
          optionsContainer: {
            backgroundColor: Colors[colorScheme || "light"].background,
            borderWidth: 0.5,
            borderColor: Colors[colorScheme || "light"].border,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            shadowColor: "none",
            shadowOpacity: 0,
            overflow: "hidden",
            paddingTop: 8,
            paddingBottom: 12,
          },
          optionsWrapper: {
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingHorizontal: 16,
          },
          optionWrapper: {
            margin: 5,
            alignItems: "flex-start",
            justifyContent: "center",
            paddingHorizontal: 0,
            height: 44,
            // borderWidth: 1,
            // borderColor: "red",
          },
          optionTouchable: {
            underlayColor: "transparent",
            activeOpacity: 0.2,
          },
          optionText: {
            color: Colors[colorScheme || "light"].buttonActive,
            fontFamily: "InterMedium",
            fontWeight: "500",
            fontSize: 15,
            lineHeight: 20,
            letterSpacing: -0.15,
          },
        }}
      >
        <View style={styles.tooptipPublicationWrapper}>
          {!item.channel_image_url ? (
            <View style={styles.noImageContainer}>
              <Text style={styles.noImageContainerText}>
                {item.channel_title} {item.channel_title}
              </Text>
              <Text style={styles.noImageContainerText}>
                {item.channel_title} {item.channel_title} {item.channel_title}
              </Text>
              <Text style={styles.noImageContainerText}>
                {item.channel_title} {item.channel_title}
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
                source={{ uri: item.channel_image_url }}
              />
            </View>
          )}
          <View style={styles.tooltipContent}>
            <View style={styles.tooltipInfo}>
              <Text style={styles.tooltipTitle} numberOfLines={2}>
                {item.channel_title}
              </Text>
              {item.channel_description ? (
                <Text style={styles.tooltipDescription} numberOfLines={2}>
                  {item.channel_description
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
          </View>
        </View>

        <MenuOption
          onSelect={() =>
            router.push({
              pathname: "/feedView",
              params: {
                title: item.channel_title,
                description: item.channel_description,
                image: item.channel_image_url,
                subscribers: item.channel_subscribers,
                url: item.channel_url,
                id: item.id,
                user: user,
                userId: user.id,
                subscribed: isSubscribed,
                userSubscriptionIds: userSubscriptionIds,
              },
            })
          }
          text="View All Articles"
        />
        <View style={styles.tooltipDivider}></View>
        <MenuOption onSelect={() => handleSubscribe()} text="Unsubscribe" />
        <View style={styles.tooltipDivider}></View>
      </MenuOptions>
    </Menu>
  );
}
