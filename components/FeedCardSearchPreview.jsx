import { useContext, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Pressable,
} from "react-native";
import { Image } from "expo-image";
import { useColorScheme } from "react-native";
import { supabase } from "../config/supabase";
import Colors from "../constants/Colors";
import { AuthContext, FeedContext } from "../app/_layout";
import { getColorForLetter, getTextColorForLetter } from "../app/utils/Styling";
import { formatDescription } from "../app/utils/Formatting";
import { router } from "expo-router";

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
  const [isOptimisticSubscribed, setIsOptimisticSubscribed] = useState(false);

  const colorScheme = useColorScheme();
  const { setFeeds } = useContext(FeedContext);

  const handleSubmitUrl = async () => {
    setIsOptimisticSubscribed(true);
    setIsSubscribed(!isSubscribed);

    try {
      const { data: channelData, error: channelError } = await supabase
        .from("channels")
        .upsert([
          {
            channel_url: channelUrl,
            channel_title: channelTitle,
            channel_subscribers: [user.id],
            channel_image_url: channelImageUrl,
            channel_description: channelDescription,
            channel_creator: user.id,
          },
        ])
        .select()
        .single();

      if (channelError) {
        console.error("Error creating channel:", channelError);
        setIsSubscribed(!isSubscribed);
        return;
      }

      try {
        const { data: feedsData, error: feedsError } = await supabase
          .from("channels")
          .select("*");

        if (feedsError) {
          console.error("Error fetching feeds:", feedsError);
          setIsSubscribed(!isSubscribed);
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
            return;
          }

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
          throw fetchNewChannelError;
        }
      } catch (fetchFeedsError) {
        console.error("Error fetching feeds:", fetchFeedsError);
        setIsSubscribed(!isSubscribed);
        throw fetchFeedsError;
      }
    } catch (fetchOrUploadError) {
      console.error(
        "Error fetching or uploading channel data:",
        fetchOrUploadError
      );
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
      height: 68,
      width: 68,
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
      lineHeight: 23,
      letterSpacing: -0.172,

      color: getTextColorForLetter(channelTitle[0]),
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
            title: channelTitle,
            description: channelDescription,
            image: channelImageUrl,
            subscribers: 0,
            url: channelUrl,
            user: user,
            userId: user.id,
            subscribed: false,
            userSubscriptionIds: userSubscriptionIds,
          },
        })
      }
    >
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
            width: 68,
            overflow: "hidden",
            borderRadius: 10,
            backgroundColor: `white`,
            borderWidth: 0.5,
            borderColor: `${Colors[colorScheme || "light"].border}`,
          }}
        >
          <Image
            style={{
              flex: 1,
              borderRadius: 12,
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
              isOptimisticSubscribed
                ? styles.subscribedButton
                : styles.subscribeButton
            }
            onPress={handleSubmitUrl}
          >
            <Text
              style={
                isOptimisticSubscribed
                  ? styles.subscribedButtonText
                  : styles.subscribeButtonText
              }
            >
              {isOptimisticSubscribed ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}
