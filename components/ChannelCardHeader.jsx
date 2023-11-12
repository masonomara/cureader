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

export default function ChannelCardHeader({
  title,
  description,
  image,
  subscribers,
  url,
  id,
  user,
  subscribed,
}) {
  const [isSubscribed, setIsSubscribed] = useState(subscribed);
  const [isOptimisticSubscribed, setIsOptimisticSubscribed] =
    useState(subscribed);
  const navigation = useNavigation();
  const colorScheme = useColorScheme();

  useEffect(() => {
    // Update state when the subscribed prop changes
    setIsSubscribed(subscribed);
    setIsOptimisticSubscribed(subscribed);
  }, [subscribed]);

  console.log("isSubscribed (ChannelCardHeader 1):", isSubscribed);
  console.log(
    "isOptimisticSubscribed (ChannelCardHeader 1):",
    isOptimisticSubscribed
  );

  const handleSubscribe = async () => {
    setIsOptimisticSubscribed((prevIsOptimisticSubscribed) => !prevIsOptimisticSubscribed);
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
      const itemChannelId = id;
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
          .eq("id", id);

        if (!channelError) {
          const channel = channelData[0];
          const updatedSubscribers = channel.channel_subscribers.filter(
            (subscriber) => subscriber !== user.id
          );
          await updateChannelSubscribers(id, updatedSubscribers);
        }
      } else {
        // Subscribe
        const newSubscription = {
          channelId: id,
          channelUrl: url,
        };
        const updatedSubscriptions = [...channelSubscriptions, newSubscription];
        await updateSubscriptions(user.id, updatedSubscriptions);

        const { data: channelData, error: channelError } = await supabase
          .from("channels")
          .select()
          .eq("id", id);

        if (!channelError) {
          const channel = channelData[0];
          const updatedSubscribers = [...channel.channel_subscribers, user.id];
          await updateChannelSubscribers(id, updatedSubscribers);
        }
      }

      setIsSubscribed(!isSubscribed);
    } catch (error) {
      console.error("Error handling subscription:", error);
      setIsOptimisticSubscribed(!isOptimisticSubscribed);
    }
  };

  console.log("isSubscribed (ChannelCardHeader 2):", isSubscribed);
  console.log(
    "isOptimisticSubscribed (ChannelCardHeader 1):",
    isOptimisticSubscribed
  );

  const updateSubscriptions = async (userId, updatedSubscriptions) => {
    await supabase
      .from("profiles")
      .update({ channel_subscriptions: updatedSubscriptions })
      .eq("id", userId);
  };

  console.log("isSubscribed (ChannelCardHeader 3):", isSubscribed);
  console.log(
    "isOptimisticSubscribed (ChannelCardHeader 1):",
    isOptimisticSubscribed
  );

  const updateChannelSubscribers = async (channelId, updatedSubscribers) => {
    await supabase.from("channels").upsert([
      {
        id: channelId,
        channel_subscribers: updatedSubscribers,
      },
    ]);
  };

  console.log("isSubscribed (ChannelCardHeader 4):", isSubscribed);
  console.log(
    "isOptimisticSubscribed (ChannelCardHeader 1):",
    isOptimisticSubscribed
  );

  const styles = {
    card: {
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      borderBottomWidth: 1,
      borderColor: `${Colors[colorScheme || "light"].border}`,
      alignItems: "flex-start",
      flexDirection: "row",
      display: "flex",
      flex: 1,
      width: "100%",
      gap: 0,
      paddingVertical: 22,
      height: 172,
      minHeight: 172,
      maxHeight: 172,
      padding: 16,
      marginBottom: -1,
    },
    cardContent: {
      display: "flex",
      alignItems: "flex-start",
      flexDirection: "column",
      flex: 1,
      paddingLeft: 12,
      paddingRight: 0,
      gap: 12,
    },
    cardInfo: {
      flex: 1,
      width: "100%",
      alignItems: "flex-start",
      justifyContent: "flex-start",
      overflow: "hidden",
      flexDirection: "column",
      height: 88,
      paddingTop: 2,
      marginTop: -2,
      marginBottom: -2,
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
      marginBottom: 3,
    },
    cardControls: {
      flexDirection: "row",
      gap: 12,
      alignItems: "flex-end",
    },
    description: {
      flex: 1,
      maxHeight: 57,
      color: `${Colors[colorScheme || "light"].textMedium}`,
      fontFamily: "InterRegular",
      fontWeight: "400",
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
    channelCardTitle: {
      flex: 1,
      display: "flex",
      flexDirection: "row",
      gap: 8,
      height: 44,
      minHeight: 44,
      maxHeight: 44,
      alignItems: "center",
      marginBottom: 3,
    },
  };

  return (
    <View style={styles.card}>
      {!image ? (
        <View
          style={{
            height: 110,
            width: 110,
            overflow: "hidden",
            backgroundColor: `${Colors[colorScheme || "light"].colorPrimary}`,
            borderRadius: 18,
          }}
        ></View>
      ) : (
        <View
          style={{
            aspectRatio: "1/1",
            width: 110,
            overflow: "hidden",
            borderRadius: 18,
          }}
        >
          <Image
            style={{
              flex: 1,
              width: "100%",
              height: "100%",
            }}
            source={{ uri: image }}
          />
        </View>
      )}
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          <Text style={styles.description} numberOfLines={4}>
            {description}
          </Text>
        </View>
        <View style={styles.cardControls}>
          <TouchableOpacity             onPress={handleSubscribe}

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
    </View>
  );
}
