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
import Colors from "../constants/Colors";
import { AuthContext, FeedContext } from "../app/_layout";
import { formatDescription } from "../app/utils/Formatting";
import {
  updateChannelSubscribers,
  updateUserSubscriptions,
} from "../hooks/FeedCardFunctions";
import Dots20 from "./icons/20/Dots20";
import { router } from "expo-router";
import { getColorForLetter, getTextColorForLetter } from "../app/utils/Styling";

const CARD_WIDTH = Dimensions.get("window").width - 32;

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

  const shouldRenderEditButton =
    item.channel_creator === user.id || userAdmin === true;

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
      alignItems: "flex-start",
      flexDirection: "column",
      display: "flex",

      overflow: "hidden",
      gap: 0,
      flex: 1,
    },
    cardContent: {
      display: "flex",
      alignItems: "flex-start",
      flexDirection: "column",
      width: "100%",
      padding: 16,
      paddingTop: 13,
      paddingBottom: 7,
      flex: 1,
      borderTopWidth: 0.5,

      borderBottomWidth: 2,
      borderColor: `${Colors[colorScheme || "light"].border}`,
    },

    title: {
      flex: 1,

      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 34,
      lineHeight: 34,
      marginVertical: 3.5,
      letterSpacing: -0.28,
    },
    cardControls: {
      flexDirection: "row",
      alignItems: "flex-start",
      flex: 1,
    },
    description: {
      flex: 1,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterMedium",
      fontWeight: "400",
      fontSize: 16,
      lineHeight: 21,
      letterSpacing: -0.16,
      paddingRight: 22,
      marginBottom: 27,
    },
    editButtonWrapper: {
      height: 44,
      width: 40,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
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
      backgroundColor: getColorForLetter(item.title[0]),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    noImageContainerText: {
      fontFamily: "NotoSerifMedium",
      fontWeight: "500",
      fontSize: 80,
      lineHeight: 80,
      letterSpacing: -0.6,

      color: getTextColorForLetter(item.title[0]),
      textAlignVertical: "center",
      textAlign: "center",
      width: "1000%",
    },
    feedTitle: {
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 20,
      lineHeight: 25,
      letterSpacing: -0.2,
      marginBottom: -3,
    },
    buttonsWrapper: {
      dispaly: "flex",
      flexDirection: "row",
      gap: 5,
    },
  };

  return (
    <View style={styles.card}>
      {!item.image ? (
        <View style={styles.noImageContainer}>
          <Text style={styles.noImageContainerText}>
            {item.title} {item.title} {item.title} {item.title}
          </Text>
          <Text style={styles.noImageContainerText}>
            {item.title} {item.title} {item.title} {item.title} {item.title}
          </Text>
          <Text style={styles.noImageContainerText}>
            {item.title} {item.title} {item.title} {item.title}
          </Text>
        </View>
      ) : (
        <View
          style={{
            aspectRatio: "5/3",
            width: "100%",
            overflow: "hidden",
          }}
        >
          <Image
            style={{
              flex: 1,
            }}
            contentFit="cover"
            source={{ uri: item.image }}
          />
        </View>
      )}
      <View style={styles.cardContent}>
        <View style={styles.cardControls}>
          <Text style={styles.title} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
        {item.description ? (
          <Text numberOfLines={3} style={styles.description}>
            {formatDescription(item.description, 200)}
          </Text>
        ) : (
          <Text numberOfLines={3} style={styles.description}></Text>
        )}

        <View style={styles.buttonsWrapper}>
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
          {shouldRenderEditButton && (
            <TouchableOpacity
              style={styles.editButtonWrapper}
              onPress={() =>
                router.push({
                  pathname: "/editFeedView",
                  params: {
                    title: item.title,
                    description: item.description,
                    image: item.image,
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
        </View>
      </View>
    </View>
  );
}
