import React, { useState, useContext } from "react";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { useColorScheme } from "react-native";
import { supabase } from "../config/supabase";
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
import { getColorForLetter, getTextColorForLetter } from "../app/utils/Styling";
import { formatDescription } from "../app/utils/Formatting";
import { updateChannelSubscribers } from "../hooks/FeedCardFunctions";

export default function FeedCardToolTip({ item }) {
  const { feeds } = useContext(FeedContext);
  const {
    user,
    userSubscriptionUrls,
    userSubscriptionIds,
    setUserSubscriptionIds,
    setUserSubscriptionUrls,
  } = useContext(AuthContext);

  const colorScheme = useColorScheme();

  const [isSubscribed, setIsSubscribed] = useState(true);

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
      setIsSubscribed(!isSubscribed);
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
      paddingVertical: 10,
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
    tooptipPublicationWrapper: {
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      borderBottomWidth: 1,
      borderColor: `${Colors[colorScheme || "light"].border}`,
      alignItems: "center",
      flexDirection: "row",
      display: "flex",
      flex: 1,
      width: "100%",
      gap: 10,
      paddingVertical: 10,
      paddingBottom: 16,
    },
    tooltipContent: {
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
      flex: 1,
      gap: 8,
    },
    tooltipInfo: {
      flex: 1,
      alignItems: "flex-start",
      justifyContent: "center",
      overflow: "hidden",
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
    },
    tooltipDescription: {
      color: `${Colors[colorScheme || "light"].buttonActive}`,
      fontFamily: "InterRegular",
      fontWeight: "400",
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.14,
    },
    tooltipDivider: {
      height: 1,
      width: "100%",
      backgroundColor: `${Colors[colorScheme || "light"].border}`,
    },
    noImageContainer: {
      height: 68,
      width: 68,
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
      lineHeight: 23,
      letterSpacing: -0.173,
      color: getTextColorForLetter(item.channel_title[0]),
      textAlignVertical: "center",
      textAlign: "center",
      width: "1000%",
    },
    button: {
      height: 32,
      minWidth: 32,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 5,
      borderRadius: 100,
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
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            },
          },
        }}
      >
        <View style={styles.button}>
          <Dots20
            style={styles.buttonImage}
            color={Colors[colorScheme || "light"].buttonActive}
          />
        </View>
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
            paddingBottom: 64,
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
                width: 68,
                overflow: "hidden",

                borderRadius: 12,
                borderWidth: 0.5,
                borderColor: `${Colors[colorScheme || "light"].border}`,
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
          <View style={styles.tooltipContent}>
            <View style={styles.tooltipInfo}>
              <Text style={styles.tooltipTitle} numberOfLines={1}>
                {item.channel_title}
              </Text>
              {item.channel_description ? (
                <Text style={styles.tooltipDescription} numberOfLines={2}>
                  {formatDescription(item.channel_description, 200)}
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
