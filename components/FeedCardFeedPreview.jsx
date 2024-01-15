import { useState, useContext, useLayoutEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { useColorScheme } from "react-native";
import Colors from "../constants/Colors";
import { AuthContext, FeedContext } from "../app/_layout";
import { getColorForLetter, getTextColorForLetter } from "../app/utils/Styling";
import { formatDescription } from "../app/utils/Formatting";
import {
  updateChannelSubscribers,
  updateUserSubscriptions,
} from "../hooks/FeedCardFunctions";
import Edit20 from "./icons/20/Edit20";
import { router } from "expo-router";

export default function FeedCardFeedPreview({ item }) {
  const itemId = parseInt(item.id, 10);
  const {
    user,
    userAdmin,
    userSubscriptionUrls,
    userSubscriptionIds,
    setUserSubscriptionIds,
    setUserSubscriptionUrls,
  } = useContext(AuthContext);
  const { feeds } = useContext(FeedContext);
  const colorScheme = useColorScheme();

  const [isSubscribed, setIsSubscribed] = useState(
    userSubscriptionIds.includes(itemId)
  );

  useLayoutEffect(() => {
    setIsSubscribed(userSubscriptionIds.includes(itemId));
  }, [userSubscriptionIds, itemId]);

  const handleSubscribe = async () => {
    const optimisticSubscribed = !isSubscribed;
    setIsSubscribed(optimisticSubscribed);
    try {
      const updatedUserSubscriptionIds = optimisticSubscribed
        ? [...userSubscriptionIds, itemId]
        : userSubscriptionIds.filter((id) => id !== itemId);

      const updatedUserSubscriptionUrls = optimisticSubscribed
        ? [...userSubscriptionUrls, item.url]
        : userSubscriptionUrls.filter((url) => url !== item.url);

      setUserSubscriptionIds(updatedUserSubscriptionIds);
      setUserSubscriptionUrls(updatedUserSubscriptionUrls);

      await updateUserSubscriptions(
        updatedUserSubscriptionIds,
        updatedUserSubscriptionUrls,
        user.id
      );
      await updateChannelSubscribers(
        itemId,
        user.id,
        optimisticSubscribed,
        feeds
      );
    } catch (error) {
      console.error("Error handling subscription:", error);
      setIsSubscribed(!isSubscribed);
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
      width: "100%",
      gap: 0,
      paddingVertical: 12,
      paddingHorizontal: 16,
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
    subscribeButtonWrapper: {
      width: 88,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: 44,
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
      backgroundColor: getColorForLetter(item.title[0]),
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
      color: getTextColorForLetter(item.title[0]),
      textAlignVertical: "center",
      textAlign: "center",
      width: "1000%",
    },
    editButtonWrapper: {
      height: 44,
      width: 44,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    editButton: {
      height: 34,
      width: 34,
      display: "flex",
      alignItems: "center",
      borderRadius: 100,
      justifyContent: "center",
      backgroundColor: `${Colors[colorScheme || "light"].surfaceOne}`,
    },
  };

  return (
    <View style={styles.card}>
      {!item.image ? (
        <View style={styles.noImageContainer}>
          <Text style={styles.noImageContainerText}>
            {item.title} {item.title}
          </Text>
          <Text style={styles.noImageContainerText}>
            {item.title} {item.title} {item.title}
          </Text>
          <Text style={styles.noImageContainerText}>
            {item.title} {item.title}
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
            source={{ uri: item.image }}
          />
        </View>
      )}
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
          {item.description ? (
            <Text style={styles.description} numberOfLines={2}>
              {formatDescription(item.description, 300)}
            </Text>
          ) : (
            <Text numberOfLines={2} style={styles.description}></Text>
          )}
        </View>
        <View style={styles.cardControls}>
          {item.channel_creator === user.id ||
            (userAdmin == true && (
              <TouchableOpacity
                style={styles.editButtonWrapper}
                onPress={() =>
                  router.push({
                    pathname: "/editFeedView",
                    params: {
                      title: item.title,
                      description: item.description,
                      image: item.image,
                      subscribers: item.subscribers,
                      url: item.url,
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
                  <Edit20
                    style={styles.buttonImage}
                    color={Colors[colorScheme || "light"].buttonActive}
                  />
                </View>
              </TouchableOpacity>
            ))}
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
    </View>
  );
}
