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
  "#E78D6F", // Orange
  "#E7A682", // Yellow
  "#E7C49E", // Yellow-Green
  "#AECB8F", // Green
  "#79AB93", // Green-Blue
  "#5C8E99", // Teal
  "#3E729B", // Blue-Teal
  "#2B558E", // Blue
  "#4B6BBF", // Indigo-Blue
  "#8360BF", // Indigo
  "#AF7DBF", // Purple-Indigo
  "#CC7F9D", // Purple
  "#E86D8B", // Pink-Purple
  "#E78DAE", // Pink
  "#E7B3C7", // Light Pink
  "#E7CFD6", // Very Light Pink
  "#F3E6E8", // Pale Pink
  "#E8C8B6", // Apricot
  "#E8B198", // Peach
  "#E89B8D", // Salmon
  "#E88C7D", // Light Orange
  "#E8987E", // Orange-Yellow
  "#E8A88F", // Light Orange-Yellow
  "#E8BF98", // Pastel Yellow
  "#F8EDD4", // Pale Yellow
];
const colorArray = [
  "#FF6961", // Red
  "#FFA07A", // Orange
  "#FFD700", // Yellow
  "#98FB98", // Yellow-Green
  "#00FA9A", // Green
  "#AFEEEE", // Green-Blue
  "#00CED1", // Teal
  "#87CEFA", // Blue-Teal
  "#87CEEB", // Blue
  "#4682B4", // Indigo-Blue
  "#6A5ACD", // Indigo
  "#8A2BE2", // Purple-Indigo
  "#9400D3", // Purple
  "#DB7093", // Pink-Purple
  "#FFC0CB", // Pink
  "#FFB6C1", // Light Pink
  "#FFDAB9", // Very Light Pink
  "#FFE4E1", // Pale Pink
  "#F0E68C", // Apricot
  "#FFD700", // Peach
  "#FA8072", // Salmon
  "#FFDAB9", // Light Orange
  "#FFA500", // Orange-Yellow
  "#FFD700", // Light Orange-Yellow
  "#FFE4B5", // Pastel Yellow
  "#EEE8AA", // Pale Yellow
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
      fontSize: 45,
      lineHeight: 45,
      letterSpacing: -0.337,
      height: 45,
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
            {item.channel_title}{" "}{item.channel_title}{" "}{item.channel_title}{" "}
            {item.channel_title}{" "}{item.channel_title}{" "}{item.channel_title}{" "}
            {item.channel_title}
          </Text>
          <Text style={styles.noImageContainerText}>
            {item.channel_title}{" "}{item.channel_title}{" "}{item.channel_title}{" "}
            {item.channel_title}{" "}{item.channel_title}{" "}{item.channel_title}{" "}
          </Text>
          <Text style={styles.noImageContainerText}>
            {item.channel_title}{" "}{item.channel_title}{" "}{item.channel_title}{" "}
            {item.channel_title}{" "}{item.channel_title}{" "}{item.channel_title}{" "}
            {item.channel_title}
          </Text>
          <Text style={styles.noImageContainerText}>
            {item.channel_title}{" "}{item.channel_title}{" "}{item.channel_title}{" "}
            {item.channel_title}{" "}{item.channel_title}{" "}{item.channel_title}{" "}
          </Text>
          <Text style={styles.noImageContainerText}>
            {item.channel_title}{" "}{item.channel_title}{" "}{item.channel_title}{" "}
            {item.channel_title}{" "}{item.channel_title}{" "}{item.channel_title}{" "}
            {item.channel_title}
          </Text>
          <Text style={styles.noImageContainerText}>
            {item.channel_title}{" "}{item.channel_title}{" "}{item.channel_title}{" "}
            {item.channel_title}{" "}{item.channel_title}{" "}{item.channel_title}{" "}
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
