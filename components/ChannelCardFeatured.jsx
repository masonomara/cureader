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

const textColorArray = [
  "#E75450", // Red (Main Color)
  "#66C0A9", // Green
  "#FADA65", // Yellow
  "#7929B2", // Purple
  "#FF8C69", // Salmon
  "#00B3A9", // Teal
  "#E6532D", // Orange
  "#3CB8B2", // Teal
  "#FF7B00", // Orange
  "#1A9E95", // Teal
  "#E64400", // Red
  "#2DC82D", // Green
  "#FFD3A3", // Pale
  "#00EB8F", // Green
  "#E76E3F", // Orange
  "#00ADC4", // Blue
  "#FF9400", // Orange
  "#6D5DC8", // Purple
  "#FF8C69", // Salmon
  "#7AC3D4", // Blue
  "#C7132D", // Pink
  "#8FEB8D", // Green
  "#E64400", // Red
  "#8560C1", // Purple
  "#FFC800", // Gold
  "#6988EF", // Blue
];
const colorArray = [
  "#FF6961", // Red (Main Color)
  "#78D2B2", // Green
  "#FAEA96", // Yellow
  "#8A2BE2", // Purple
  "#FFA07A", // Salmon
  "#00CED1", // Teal
  "#FF6347", // Orange
  "#48D1CC", // Teal
  "#FF8C00", // Orange
  "#20B2AA", // Teal
  "#FF4500", // Red
  "#74D674", // Green
  "#FFDAB9", // Pale
  "#00FA9A", // Green
  "#FF7F50", // Orange
  "#00BFFF", // Blue
  "#FFA500", // Orange
  "#7B68EE", // Purple
  "#FFA07A", // Salmon
  "#87CEEB", // Blue
  "#DC143C", // Pink
  "#98FB98", // Green
  "#FF4500", // Red
  "#9370DB", // Purple
  "#FFD700", // Gold
  "#849BE9", // Blue
];

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

  const updateSubscriptions = async (userId, updatedSubscriptions) => {
    await supabase
      .from("profiles")
      .update({ channel_subscriptions: updatedSubscriptions })
      .eq("id", userId);
  };

  const handleSubscribe = async () => {
    setIsOptimisticSubscribed(!isOptimisticSubscribed);
    console.log("Beginning subscribe");

    try {
      // Fetch user profile data
      console.log("Fetching user profile data...");
      const { data: userProfileData, error: userProfileError } = await supabase
        .from("profiles")
        .select()
        .eq("id", user.id);

      console.log("Fetched user profile data:", userProfileData);

      if (userProfileError) {
        console.error("Error fetching user profile data:", userProfileError);
        // Optionally, show a user-friendly error message
        alert("Failed to fetch user profile data. Please try again later.");
        return;
      }

      console.log("Fetching channel subscriptions...");
      const channelSubscriptions =
        userProfileData[0].channel_subscriptions || [];
      console.log("Fetched channel subscriptions:", channelSubscriptions);
      console.log("Fetching channel id...");
      const itemChannelId = item.id;
      console.log("Fetched channel id:", itemChannelId);
      console.log("Fetching isAlreadySubscribed...");
      const isAlreadySubscribed = channelSubscriptions.some(
        (subscription) => subscription.channelId === itemChannelId
      );

      console.log("Fetched alreadySubscribed:", isAlreadySubscribed);
      console.log("CHECK: do we have isSubscribed and isAlreadySubscribed...");
      console.log("isSubscribed:", isSubscribed);
      console.log("isAlreadySubscribed:", isAlreadySubscribed);

      if (isSubscribed && isAlreadySubscribed) {
        // Unsubscribe
        console.log("Unsubscribing...");
        const updatedSubscriptions = channelSubscriptions.filter(
          (subscription) => subscription.channelId !== itemChannelId
        );
        await updateSubscriptions(user.id, updatedSubscriptions);

        const { data: channelData, error: channelError } = await supabase
          .from("channels")
          .select()
          .eq("id", item.id);

        if (channelError) {
          console.error("Error fetching channel data:", channelError);
          // Optionally, show a user-friendly error message
          alert("Failed to fetch channel data. Please try again later.");
          return;
        }

        const channel = channelData[0];
        const updatedSubscribers = channel.channel_subscribers.filter(
          (subscriber) => subscriber !== user.id
        );
        await updateChannelSubscribers(item.id, updatedSubscribers);
      } else {
        // Subscribe
        console.log("Subscribing...");
        console.log("CHECK: do we have channelId and channelUrl...");
        console.log("channelId:", item.id);
        console.log("channelUrl:", item.channel_url);
        console.log("Fetching newSubscription...");
        const newSubscription = {
          channelId: item.id,
          channelUrl: item.channel_url,
        };
        console.log("Fetched newSubscription:", newSubscription);
        console.log("Fetching updatedSubscriptions...");
        const updatedSubscriptions = [...channelSubscriptions, newSubscription];
        console.log("Fetched updatedSubscriptions:", updatedSubscriptions);

        console.log("About to perform updateSubscriptions...");
        console.log("CHECK: do we have channelId and channelUrl...");
        console.log("user.id:", user.id);
        console.log("updatedSubscriptions:", updatedSubscriptions);
        await updateSubscriptions(user.id, updatedSubscriptions);

        console.log("Performed updateSubscriptions");

        console.log("Fetching channel data...");

        const { data: channelData, error: channelError } = await supabase
          .from("channels")
          .select()
          .eq("id", item.id);

        console.log("Fetched channel data:", channelData);

        if (channelError) {
          console.error("Error fetching channel data:", channelError);
          // Optionally, show a user-friendly error message
          alert("Failed to fetch channel data. Please try again later.");
          return;
        }

        console.log("CHECK: do we have channelData[0]...");
        console.log("channelData[0]:", channelData[0]);
        console.log("Fetching channel...");
        const channel = channelData[0];

        console.log("Fetched channel:", channel);
        console.log("Fetching updatedSubscribers...");
        const updatedSubscribers = [...(channel.channel_subscribers ?? []), user.id];
        console.log("Fetched updatedSubscribers:", updatedSubscribers);
        await updateChannelSubscribers(item.id, updatedSubscribers);
      }

      setIsSubscribed(!isSubscribed);
    } catch (error) {
      console.error("Error handling subscription:", error);
      // Optionally, show a user-friendly error message
      alert("Failed to handle subscription. Please try again later.");
      setIsOptimisticSubscribed(!isOptimisticSubscribed);
    }
  };

  const updateChannelSubscribers = async (channelId, updatedSubscribers) => {
    await supabase.from("channels").upsert([
      {
        id: channelId,
        channel_subscribers: updatedSubscribers,
      },
    ]);
  };

  // Function to get background color based on the first letter
  const getColorForLetter = (letter) => {
    const index = letter.toUpperCase().charCodeAt(0) % colorArray.length;
    return colorArray[index];
  };
  const getTextColorForLetter = (letter) => {
    const index = letter.toUpperCase().charCodeAt(0) % textColorArray.length;
    return textColorArray[index];
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
      height: "auto",
    },
    cardContent: {
      display: "flex",
      alignItems: "flex-start",
      flexDirection: "column",
      width: "100%",
      padding: 12,
      paddingVertical: 16,
      flex: 1,
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
      flex: 1,
    },
    cardControls: {
      marginTop: 2,
      flexDirection: "row",
      gap: 8,
      alignItems: "flex-end",
      flex: 1,
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
            userChannelIds: userChannelIds,
          },
        })
      }
    >
      {!item.channel_image_url ? (
        <View style={styles.noImageContainer}>
          <Text style={styles.noImageContainerText}>
            {item.channel_title} {item.channel_title} {item.channel_title}{" "}
            {item.channel_title} {item.channel_title} {item.channel_title}{" "}
            {item.channel_title}
          </Text>
          <Text style={styles.noImageContainerText}>
            {item.channel_title} {item.channel_title} {item.channel_title}{" "}
            {item.channel_title} {item.channel_title} {item.channel_title}{" "}
          </Text>
          <Text style={styles.noImageContainerText}>
            {item.channel_title} {item.channel_title} {item.channel_title}{" "}
            {item.channel_title} {item.channel_title} {item.channel_title}{" "}
            {item.channel_title}
          </Text>
          <Text style={styles.noImageContainerText}>
            {item.channel_title} {item.channel_title} {item.channel_title}{" "}
            {item.channel_title} {item.channel_title} {item.channel_title}{" "}
          </Text>
          <Text style={styles.noImageContainerText}>
            {item.channel_title} {item.channel_title} {item.channel_title}{" "}
            {item.channel_title} {item.channel_title} {item.channel_title}{" "}
            {item.channel_title}
          </Text>
          <Text style={styles.noImageContainerText}>
            {item.channel_title} {item.channel_title} {item.channel_title}{" "}
            {item.channel_title} {item.channel_title} {item.channel_title}{" "}
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
