import { useState, useContext, useLayoutEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
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
import { supabase } from "../config/supabase";

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
  const { feeds, setFeeds } = useContext(FeedContext);
  const colorScheme = useColorScheme();

  const [isSubscribed, setIsSubscribed] = useState(
    userSubscriptionIds.includes(itemId)
  );
  const [newChannelDataId, setNewChannelDataId] = useState(null);
  const [newChannelSubmitted, setNewChannelSubmitted] = useState(false);
  console.log(newChannelDataId);
  const [isOptimisticSubscribed, setIsOptimisticSubscribed] = useState(false);

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
        updateChannelSubscribers(itemId, user.id, !isSubscribed, feeds),
      ]);
    } catch (error) {
      console.error("Error handling subscription:", error);
      setIsSubscribed(!isSubscribed);
    }
  };

  const handleSubmitUrl = async () => {
    setIsOptimisticSubscribed(true);
    setNewChannelSubmitted(true);
    setIsSubscribed(!isSubscribed);
    console.log("subscribeChange 1");

    try {
      const { data: channelData, error: channelError } = await supabase
        .from("channels")
        .upsert([
          {
            channel_url: item.url,
            channel_title: item.title,
            channel_subscribers: [user.id],
            channel_image_url: item.image,
            channel_description: item.description,
            channel_creator: user.id,
          },
        ])
        .select()
        .single();

      if (channelError) {
        console.error("Error creating channel:", channelError);
        setIsSubscribed(!isSubscribed);
        console.log("subscribeChange 2");
        return;
      }

      try {
        const { data: feedsData, error: feedsError } = await supabase
          .from("channels")
          .select("*");

        if (feedsError) {
          console.error("Error fetching feeds:", feedsError);
          setIsSubscribed(!isSubscribed);
          console.log("subscribeChange 3");
          return;
        }

        setFeeds(feedsData);

        try {
          const { data: newChannelData, error: newChannelError } =
            await supabase
              .from("channels")
              .select("*")
              .eq("id", channelData.id)
              .single();

          if (newChannelError) {
            console.error("Error fetching new channel data:", newChannelError);
            setIsSubscribed(!isSubscribed);
            console.log("subscribeChange 4");
            return;
          }

          setNewChannelDataId(newChannelData.id);

          const updatedUserSubscriptionIds = [
            ...userSubscriptionIds,
            newChannelData.id,
          ];
          const updatedUserSubscriptionUrls = [
            ...userSubscriptionUrls,
            newChannelData.channel_url,
          ];

          setUserSubscriptionIds(updatedUserSubscriptionIds);
          setUserSubscriptionUrls(updatedUserSubscriptionUrls);

          try {
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
          } catch (updateProfileError) {
            console.error("Error updating user profile:", updateProfileError);
            throw updateProfileError;
          }
        } catch (fetchNewChannelError) {
          console.error(
            "Error fetching new channel data:",
            fetchNewChannelError
          );
          setIsSubscribed(!isSubscribed);
          console.log("subscribeChange 5");
          throw fetchNewChannelError;
        }
      } catch (fetchFeedsError) {
        console.error("Error fetching feeds:", fetchFeedsError);
        setIsSubscribed(!isSubscribed);
        console.log("subscribeChange 6");
        throw fetchFeedsError;
      }
    } catch (fetchOrUploadError) {
      console.error(
        "Error fetching or uploading channel data:",
        fetchOrUploadError
      );
      setIsSubscribed(!isSubscribed);
      console.log("subscribeChange 7");
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
    subscribedMutedButtonText: {
      color: `${Colors[colorScheme || "light"].buttonMuted}`,
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
      fontSize: 120,
      lineHeight: 120,
      letterSpacing: -0.8,
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
          {item.id ? (
            <TouchableOpacity
              style={styles.subscribeButtonWrapper}
              onPress={handleSubscribe}
            >
              <View
                style={
                  isSubscribed || newChannelDataId
                    ? styles.subscribedButton
                    : styles.subscribeButton
                }
              >
                <Text
                  style={
                    isSubscribed || newChannelDataId
                      ? styles.subscribedButtonText
                      : styles.subscribeButtonText
                  }
                >
                  {isSubscribed || newChannelDataId ? "Following" : "Follow"}
                </Text>
              </View>
            </TouchableOpacity>
          ) : newChannelDataId || newChannelSubmitted ? (
            <View
              style={styles.subscribeButtonWrapper}
              onPress={handleSubscribe}
            >
              <View style={styles.subscribedButton}>
                <Text style={styles.subscribedMutedButtonText}>Following</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.subscribeButtonWrapper}
              onPress={handleSubmitUrl}
            >
              <View
                style={
                  isSubscribed
                    ? styles.subscribedButton
                    : styles.subscribeButton
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
          )}
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
