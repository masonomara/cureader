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
import { formatDescription } from "../app/utils/Formatting";
import {
  updateChannelSubscribers,
  updateUserSubscriptions,
} from "../hooks/FeedCardFunctions";

const CARD_WIDTH = Dimensions.get("window").width - 32;

export default function FeedCard({ item, user }) {
  const {
    userSubscriptionUrls,
    userSubscriptionIds,
    setUserSubscriptionIds,
    setUserSubscriptionUrls,
  } = useContext(AuthContext);

  const colorScheme = useColorScheme();
  const { feeds } = useContext(FeedContext);
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
        updatedUserSubscriptionUrls,
        user.id
      );
      await updateChannelSubscribers(
        item.id,
        user.id,
        optimisticSubscribed,
        feeds
      );
    } catch (error) {
      console.error("Error handling subscription:", error);
      setIsSubscribed(!isSubscribed); // Revert the state if there's an error
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
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {item.channel_title}
          </Text>
          {item.channel_description ? (
            <Text numberOfLines={2} style={styles.description}>
              {formatDescription(item.channel_description, 200)}
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
