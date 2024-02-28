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
import StarFilled12 from "./icons/12/StarFilled12";
import StopFilled12 from "./icons/12/StopFilled12";
import WarningFilled12 from "./icons/12/WarningFilled12";

const CARD_WIDTH = Dimensions.get("window").width - 32;

export default function FeedCardListItem({
  item,
  user,
  extraPadding,
  borderBottom,
}) {
  const {
    userAdmin,
    userSubscriptionUrls,
    userSubscriptionIds,
    setUserSubscriptionIds,
    setUserSubscriptionUrls,
    userFavoriteSubscriptionIds,
    userWarningSubscriptionUrls,
    userErrorSubscriptionUrls,
  } = useContext(AuthContext);
  const { feeds } = useContext(FeedContext);
  const colorScheme = useColorScheme();
  const [isSubscribed, setIsSubscribed] = useState(
    userSubscriptionIds.includes(item.id)
  );
  const [isFavorited, setIsFavorited] = useState(
    userFavoriteSubscriptionIds?.includes(item.id)
  );
  const [isWarning, setIsWarning] = useState(
    userWarningSubscriptionUrls?.includes(item.channel_url)
  );
  const [isError, setIsError] = useState(
    userErrorSubscriptionUrls?.includes(item.id)
  );

  useLayoutEffect(() => {
    setIsSubscribed(userSubscriptionIds.includes(item.id));
    setIsFavorited(userFavoriteSubscriptionIds?.includes(item.id));
    setIsWarning(userWarningSubscriptionUrls?.includes(item.channel_url));
    setIsError(userErrorSubscriptionUrls?.includes(item.channel_url));
  }, [
    userSubscriptionIds,
    userWarningSubscriptionUrls,
    userErrorSubscriptionUrls,
    item.id,
  ]);

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

  const shouldRenderEditButton =
    item.channel_creator === user.id || userAdmin === true;

  const styles = {
    card: {
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      ...(!borderBottom && { borderTopWidth: 0.5 }),
      ...(borderBottom && { borderBottomWidth: 0.5 }),
      borderColor: `${Colors[colorScheme || "light"].border}`,
      alignItems: "center",
      flexDirection: "row",
      display: "flex",
      flex: 1,
      width: CARD_WIDTH,
      gap: 10,
      paddingVertical: 10,
      ...(extraPadding && { marginHorizontal: 16 }),
      overflow: "visible",
      zIndex: 20,
    },
    cardContent: {
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
      flex: 1,
      gap: 8,
    },
    cardInfo: {
      flex: 1,
      alignItems: "flex-start",
      justifyContent: "center",
      overflow: "hidden",
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
      gap: 3,
      alignItems: "center",
    },
    description: {
      color: `${Colors[colorScheme || "light"].textMedium}`,
      fontFamily: "InterRegular",
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.14,
    },
    editButtonWrapper: {
      height: 44,
      width: 40,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    editButton: {
      height: 44,
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
      height: 68,
      width: 68,
      borderRadius: 12,
      backgroundColor: getColorForLetter(item.channel_title[0]),
    },
    noImageWrapper: {
      borderRadius: 12,
      display: "flex",
      height: 68,
      width: 68,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      borderWidth: 0.5,
      borderColor: `${Colors[colorScheme || "light"].border}`,
    },
    noImageContainerText: {
      fontFamily: "NotoSerifMedium",
      fontWeight: "500",
      fontSize: 23,
      lineHeight: 23,
      letterSpacing: -0.172,
      color: getTextColorForLetter(item.channel_title[0]),
      textAlignVertical: "center",
      textAlign: "center",
      width: "1000%",
    },
    badgeWrapper: {
      position: "absolute",
      top: -5,
      left: -5,
      display: "flex",
      flexDirection: "row",
      zIndex: 5,
      gap: 3,
    },
    favoriteBadgeWrapper: {
      borderBottomLeftRadius: 100,
      borderBottomRightRadius: 100,
      borderTopLeftRadius: 100,
      borderTopRightRadius: 100,
      backgroundColor: `#FFC338`,
      height: 20,
      width: 20,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: 0.5,
      borderWidth: 2,
      borderColor: `${Colors[colorScheme || "light"].background}`,
    },
    stopBadgeWrapper: {
      borderBottomLeftRadius: 100,
      borderBottomRightRadius: 100,
      borderTopLeftRadius: 100,
      borderTopRightRadius: 100,
      backgroundColor: `#FF4D29`,
      height: 20,
      width: 20,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: `${Colors[colorScheme || "light"].background}`,
    },
    warningBadgeWrapper: {
      borderBottomLeftRadius: 100,
      borderBottomRightRadius: 100,
      borderTopLeftRadius: 100,
      borderTopRightRadius: 100,
      backgroundColor: `#A3A3A3`,
      height: 20,
      width: 20,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 2,
      borderColor: `${Colors[colorScheme || "light"].background}`,
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
          <View style={styles.badgeWrapper}>
            {isFavorited && (
              <View style={styles.favoriteBadgeWrapper}>
                <StarFilled12 style={styles.buttonImage} color="#FFFFFF" />
              </View>
            )}
            {isError ? (
              <View style={styles.stopBadgeWrapper}>
                <StopFilled12 style={styles.buttonImage} color="#FFFFFF" />
              </View>
            ) : isWarning ? (
              <View style={styles.warningBadgeWrapper}>
                <WarningFilled12 style={styles.buttonImage} color="#FFFFFF" />
              </View>
            ) : (
              <></>
            )}
          </View>

          <View style={styles.noImageWrapper}>
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
        </View>
      ) : (
        <View
          style={{
            aspectRatio: "1/1",
            width: 68,
          }}
        >
          <View style={styles.badgeWrapper}>
            {isFavorited && (
              <View style={styles.favoriteBadgeWrapper}>
                <StarFilled12 style={styles.buttonImage} color="#FFFFFF" />
              </View>
            )}
            {isError ? (
              <View style={styles.stopBadgeWrapper}>
                <StopFilled12 style={styles.buttonImage} color="#FFFFFF" />
              </View>
            ) : isWarning ? (
              <View style={styles.warningBadgeWrapper}>
                <WarningFilled12 style={styles.buttonImage} color="#FFFFFF" />
              </View>
            ) : (
              <></>
            )}
          </View>
          <Image
            style={{
              flex: 1,
              overflow: "hidden",
              borderRadius: 12,
              borderWidth: 0.5,
              backgroundColor: `white`,
              borderColor: `${Colors[colorScheme || "light"].border}`,
            }}
            contentFit="cover"
            source={{ uri: item.channel_image_url }}
          />
        </View>
      )}
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {item.channel_title}
          </Text>
          {item.channel_description && (
            <Text numberOfLines={2} style={styles.description}>
              {formatDescription(item.channel_description, 200)}
            </Text>
          )}
        </View>
        <View style={styles.cardControls}>
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
