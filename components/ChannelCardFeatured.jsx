import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Pressable,
} from "react-native";
import { useColorScheme } from "react-native";
import { router, useNavigation } from "expo-router";
import { supabase } from "../config/initSupabase";
import Colors from "../constants/Colors";

const CARD_WIDTH = Dimensions.get("window").width - 32;

export default function ChannelCardFeatured({
  item,
  user,
  feeds,
  userChannelIds,
}) {
  const [isSubscribed, setIsSubscribed] = useState(
    userChannelIds.includes(item.id)
  );
  const [isOptimisticSubscribed, setIsOptimisticSubscribed] = useState(
    userChannelIds.includes(item.id)
  );
  const navigation = useNavigation();
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Update state when the subscribed prop changes
    setIsSubscribed(userChannelIds.includes(item.id));
    setIsOptimisticSubscribed(userChannelIds.includes(item.id));
  }, [userChannelIds.includes(item.id)]);

  const handleSubscribe = async () => {
    setIsOptimisticSubscribed(!isOptimisticSubscribed);
    try {
      const { data: userProfileData, error: userProfileError } = await supabase
        .from("profiles")
        .select()
        .eq("id", user.id);

      if (userProfileError) {
        console.log("Error fetching user profile data:", userProfileError);
        return;
      }

      const channelSubscriptions =
        userProfileData[0].channel_subscriptions || [];
      const itemChannelId = item.id;
      const isAlreadySubscribed = channelSubscriptions.some(
        (subscription) => subscription.channelId === itemChannelId
      );

      if (isSubscribed && isAlreadySubscribed) {
        // Unsubscribe
        const updatedSubscriptions = channelSubscriptions.filter(
          (subscription) => subscription.channelId !== itemChannelId
        );
        await updateSubscriptions(user.id, updatedSubscriptions);

        const { data: channelData, error: channelError } = await supabase
          .from("channels")
          .select()
          .eq("id", item.id);

        if (!channelError) {
          const channel = channelData[0];
          const updatedSubscribers = channel.channel_subscribers.filter(
            (subscriber) => subscriber !== user.id
          );
          await updateChannelSubscribers(item.id, updatedSubscribers);
        }
      } else {
        // Subscribe
        const newSubscription = {
          channelId: item.id,
          channelUrl: item.channel_url,
        };
        const updatedSubscriptions = [...channelSubscriptions, newSubscription];
        await updateSubscriptions(user.id, updatedSubscriptions);

        const { data: channelData, error: channelError } = await supabase
          .from("channels")
          .select()
          .eq("id", item.id);

        if (!channelError) {
          const channel = channelData[0];
          const updatedSubscribers = [...channel.channel_subscribers, user.id];
          await updateChannelSubscribers(item.id, updatedSubscribers);
        }
      }

      setIsSubscribed(!isSubscribed);
    } catch (error) {
      console.error("Error handling subscription:", error);
      setIsOptimisticSubscribed(!isOptimisticSubscribed);
    }
  };

  const updateSubscriptions = async (userId, updatedSubscriptions) => {
    await supabase
      .from("profiles")
      .update({ channel_subscriptions: updatedSubscriptions })
      .eq("id", userId);
  };

  const updateChannelSubscribers = async (channelId, updatedSubscribers) => {
    await supabase.from("channels").upsert([
      {
        id: channelId,
        channel_subscribers: updatedSubscribers,
      },
    ]);
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
    },
    cardContent: {
      display: "flex",
      alignItems: "flex-start",
      flexDirection: "column",
      width: "100%",
      padding: 12,
      paddingVertical: 16,
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
      marginTop: 2,
      flexDirection: "row",
      gap: 8,
      alignItems: "flex-end",
    },
    description: {
      flex: 1,
      color: `${Colors[colorScheme || "light"].textMedium}`,
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.14,
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
  };

  return (
    <Pressable
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/feedChannel",
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
            userChannelIds: userChannelIds
          },
        })
      }
    >
      {!item.channel_image_url ? (
        <View
          style={{
            aspectRatio: "5/3",
            width: "100%",
            overflow: "hidden",
            backgroundColor: `${Colors[colorScheme || "light"].colorPrimary}`,
            borderTopEndRadius: 12,
            borderTopStartRadius: 12,
          }}
        ></View>
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
              width: "100%",
              height: "100%",
            }}
            source={{ uri: item.channel_image_url }}
          />
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.title} numberOfLines={1}>
          {item.channel_title}
        </Text>
        <View style={styles.cardControls}>
          <Text numberOfLines={2} style={styles.description}>
            {item.channel_description}
          </Text>
          <TouchableOpacity
            style={
              isOptimisticSubscribed
                ? styles.subscribedButton
                : styles.subscribeButton
            }
            onPress={handleSubscribe}
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
