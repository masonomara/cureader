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
import Colors from "../constants/Colors";
import { AuthContext, FeedContext } from "../app/_layout";
import { getColorForLetter, getTextColorForLetter } from "../app/utils/Styling";
import { formatDescription } from "../app/utils/Formatting";
import {
  updateChannelSubscribers,
  updateUserSubscriptions,
} from "../hooks/FeedCardFunctions";
import Dots20 from "./icons/20/Dots20";

const CARD_WIDTH = Dimensions.get("window").width - 32;

export default function FeedCard({ item, user }) {
  const {
    userAdmin,
    userSubscriptionUrls,
    userSubscriptionIds,
    setUserSubscriptionIds,
    setUserSubscriptionUrls,
  } = useContext(AuthContext);
  const { feeds } = useContext(FeedContext);
  const colorScheme = useColorScheme();

  const [isSubscribed, setIsSubscribed] = useState(
    userSubscriptionIds.includes(item.id)
  );

  const shouldRenderEditButton =
    item.channel_creator === user.id || userAdmin === true;

  useLayoutEffect(() => {
    setIsSubscribed(userSubscriptionIds.includes(item.id));
  }, [userSubscriptionIds, item.id]);

  const handleSubscribe = async () => {
    setIsSubscribed(!isSubscribed);

    try {
      const updatedUserSubscriptionIds = isSubscribed
        ? userSubscriptionIds.filter((id) => id !== item.id)
        : [...userSubscriptionIds, item.id];

      const updatedUserSubscriptionUrls = isSubscribed
        ? userSubscriptionUrls.filter((url) => url !== item.channel_url)
        : [...userSubscriptionUrls, item.channel_url];

      setUserSubscriptionIds(updatedUserSubscriptionIds);
      setUserSubscriptionUrls(updatedUserSubscriptionUrls);

      await Promise.all([
        updateUserSubscriptions(
          updatedUserSubscriptionIds,
          updatedUserSubscriptionUrls,
          user.id
        ),
        updateChannelSubscribers(item.id, user.id, !isSubscribed, feeds),
      ]);
    } catch (error) {
      console.error("Error handling subscription:", error);
      setIsSubscribed(!isSubscribed);
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
      borderRadius: 16,
      overflow: "hidden",
      gap: 0,
      flex: 1,
    },
    cardContent: {
      display: "flex",
      alignItems: "flex-start",
      flexDirection: "column",
      width: "100%",
      padding: 12,
      paddingVertical: 12,
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
    },
    cardControls: {
      flexDirection: "row",
      alignItems: "flex-end",
      flex: 1,
    },
    description: {
      flex: 1,
      color: `${Colors[colorScheme || "light"].textMedium}`,
      fontFamily: "InterRegular",
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.14,
      minHeight: 38,
    },
    editButtonWrapper: {
      height: 44,
      width: 40,
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      marginTop: -6,
      marginLeft: 8,
      marginRight: -5,
    },
    editButton: {
      height: 34,
      width: 40,
      display: "flex",
      alignItems: "center",
      borderRadius: 8,
      justifyContent: "center",
    },
    subscribeButtonWrapper: {
      width: 88,
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-end",
      height: 44,
      marginLeft: 8,
      marginTop: -6,
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
      color: `${Colors[colorScheme || "light"].buttonActive}`,
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
              {formatDescription(item.channel_description, 200)}
            </Text>
          ) : (
            <Text numberOfLines={2} style={styles.description}></Text>
          )}
          {shouldRenderEditButton && (
            <TouchableOpacity
              style={styles.editButtonWrapper}
              onPress={() =>
                router.push({
                  pathname: "/editFeedView",
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
              <View style={styles.editButton}>
                <Dots20
                  style={styles.buttonImage}
                  color={Colors[colorScheme || "light"].buttonActive}
                />
              </View>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.subscribeButtonWrapper}
            onPress={handleSubscribe}
          >
            <View
              style={
                isSubscribed ? styles.subscribedButton : styles.subscribeButton
              }
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
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}
