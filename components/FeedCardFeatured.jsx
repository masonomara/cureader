import { useState, useContext, useLayoutEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { useColorScheme } from "react-native";
import { router } from "expo-router";
import { supabase } from "../config/supabase";
import Colors from "../constants/Colors";
import { AuthContext, FeedContext } from "../app/_layout";
import { getColorForLetter, getTextColorForLetter } from "../app/utils/Styling";

const CARD_WIDTH = Dimensions.get("window").width - 32;

export default function FeedCard({ item, user }) {
  const { feeds } = useContext(FeedContext);
  const {
    userSubscriptionUrls,
    userSubscriptionIds,
    setUserSubscriptionIds,
    setUserSubscriptionUrls,
  } = useContext(AuthContext);

  const colorScheme = useColorScheme();

  const [isSubscribed, setIsSubscribed] = useState(
    userSubscriptionIds.includes(item.id)
  );

  useLayoutEffect(() => {
    setIsSubscribed(userSubscriptionIds.includes(item.id));
  }, [userSubscriptionIds, item.id]);

  const handleSubscribe = async () => {
    const optimisticSubscribed = !isSubscribed;
    setIsSubscribed(optimisticSubscribed);

    try {
      const updatedUserSubscriptionIds = optimisticSubscribed
        ? [...userSubscriptionIds, item.id]
        : userSubscriptionIds.filter((id) => id !== item.id);

      const updatedUserSubscriptionUrls = optimisticSubscribed
        ? [...userSubscriptionUrls, item.channel_url]
        : userSubscriptionUrls.filter((url) => url !== item.channel_url);

      setUserSubscriptionIds(updatedUserSubscriptionIds);
      setUserSubscriptionUrls(updatedUserSubscriptionUrls);

      await updateUserSubscriptions(
        updatedUserSubscriptionIds,
        updatedUserSubscriptionUrls
      );
      await updateChannelSubscribers(item.id, user.id, optimisticSubscribed);
    } catch (error) {
      console.error("Error handling subscription:", error);
      setIsSubscribed(!isSubscribed); // Revert the state if there's an error
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
      throw error;
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

        updatedFeeds[channelIndex].channel_subscribers = subscribe
          ? [...channelSubscribers, userId]
          : channelSubscribers.filter((sub) => sub !== userId);

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

  const styles = {
    card: {
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      borderWidth: 1,
      borderColor: `${Colors[colorScheme || "light"].border}`,
      alignItems: "flex-start",
      flexDirection: "column",
      display: "flex",
      width: CARD_WIDTH,
      borderRadius: 12,
      overflow: "hidden",
      gap: 0,
      height: "auto",
    },
    cardContent: {
      display: "flex",
      alignItems: "flex-start",
      flexDirection: "column",
      width: "100%",
      padding: 12,
      paddingVertical: 16,
      flex: 1,
      borderTopWidth: 0.5,
      borderColor: `${Colors[colorScheme || "light"].border}`,
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
      flex: 1,
    },
    cardControls: {
      marginTop: 2,
      flexDirection: "row",
      gap: 8,
      alignItems: "flex-end",
      flex: 1,
    },
    description: {
      flex: 1,
      color: `${Colors[colorScheme || "light"].textMedium}`,
      fontFamily: "InterMedium",
      fontWeight: "500",
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
      aspectRatio: "5/3",
      width: "100%",
      overflow: "hidden",
      borderTopEndRadius: 12,
      borderTopStartRadius: 12,
      backgroundColor: getColorForLetter(item.channel_title[0]),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    noImageContainerText: {
      fontFamily: "NotoSerifMedium",
      fontWeight: "500",
      fontSize: 72,
      lineHeight: 75,
      letterSpacing: -0.54,
      height: 75,
      color: getTextColorForLetter(item.channel_title[0]),
      textAlignVertical: "center",
      textAlign: "center",
      width: "1000%",
    },
  };

  return (
    <Pressable
      style={styles.card}
      onPress={() =>
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
    >
      {!item.channel_image_url ? (
        <View style={styles.noImageContainer}>
          <Text style={styles.noImageContainerText}>
            {item.channel_title} {item.channel_title} {item.channel_title}{" "}
            {item.channel_title}
          </Text>
          <Text style={styles.noImageContainerText}>
            {item.channel_title} {item.channel_title} {item.channel_title}{" "}
            {item.channel_title} {item.channel_title}
          </Text>
          <Text style={styles.noImageContainerText}>
            {item.channel_title} {item.channel_title} {item.channel_title}{" "}
            {item.channel_title}
          </Text>
        </View>
      ) : (
        <View
          style={{
            aspectRatio: "5/3",
            width: "100%",
            overflow: "hidden",
            borderTopEndRadius: 12,
            borderTopStartRadius: 12,
          }}
        >
          <Image
            style={{
              flex: 1,
            }}
            contentFit="cover"
            source={{ uri: item.channel_image_url }}
          />
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={1}>
          {item.channel_title}
        </Text>
        <View style={styles.cardControls}>
          {item.channel_description ? (
            <Text numberOfLines={2} style={styles.description}>
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
          <TouchableOpacity
            style={
              isSubscribed ? styles.subscribedButton : styles.subscribeButton
            }
            onPress={handleSubscribe}
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
    </Pressable>
  );
}
