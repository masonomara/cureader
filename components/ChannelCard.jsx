import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  Pressable,
  Image,
  Dimensions,
} from "react-native";
import { supabase } from "../config/initSupabase";

import { useEffect, useState } from "react";
import Colors from "../constants/Colors";

const CARD_WIDTH = Dimensions.get("window").width - 32;

export default function ChannelCard({ item, user, subscribed }) {
  const [isSubscribed, setIsSubscribed] = useState(subscribed);

  useEffect(() => {
    // Check if the user is subscribed to this channel
    async function checkSubscription() {
      try {
        const { data: userProfileData, error: userProfileError } =
          await supabase.from("profiles").select().eq("id", user.id);

        if (userProfileError) {
          console.log("Error fetching user profile data:", userProfileError);
          return;
        }

        const channelSubscriptions =
          userProfileData[0].channel_subscriptions || [];
        const itemChannelId = item.id;

        // console.log("channelSubscriptions:", channelSubscriptions);
        // console.log("itemChannelId:", itemChannelId);

        const subscribed = channelSubscriptions.some(
          (subscription) => subscription.channelId === itemChannelId
        );

        setIsSubscribed(subscribed);
      } catch (error) {
        console.error("Error checking subscription:", error);
      }
    }

    checkSubscription();
  }, [user, item]);

  // Define a function to handle the subscribe/unsubscribe button click
  const handleSubscribe = async () => {
    try {
      const { data: userProfileData, error: userProfileError } = await supabase
        .from("profiles")
        .select()
        .eq("id", user.id);
      // Get a copy of the user's channel subscriptions

      const updatedChannelSubscriptions =
        userProfileData[0].channel_subscriptions;

      console.log("updatedChannelSubscriptions:", updatedChannelSubscriptions);

      if (isSubscribed) {
        // Unsubscribe: Remove the channel with the matching channelId
        const itemChannelId = item.id;
        const index = updatedChannelSubscriptions.findIndex(
          (subscription) => subscription.channelId === itemChannelId
        );
        if (index !== -1) {
          updatedChannelSubscriptions.splice(index, 1);
        }
      } else {
        // Subscribe: Add the channel
        const newSubscription = {
          channelId: item.id,
          channelUrl: item.channel_url, // Replace with the actual channel URL
        };
        updatedChannelSubscriptions.push(newSubscription);
      }

      // Update the user's subscriptions in your database
      const { data, error } = await supabase
        .from("profiles")
        .update({
          channel_subscriptions: updatedChannelSubscriptions,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating channel subscriptions:", error);
      } else {
        setIsSubscribed(!isSubscribed); // Toggle the local state
      }
    } catch (error) {
      console.error("Error handling subscription:", error);
    }
  };

  const colorScheme = useColorScheme();
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
      paddingVertical: 6,
      height: 96,
      maxHeight: 96,
    },
    cardContent: {
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
      flex: 1,
      padding: 10,
      paddingLeft: 12,
      paddingRight: 0,
      gap: 10,
    },
    cardInfo: {
      flex: 1,
      alignItems: "flex-start",
      justifyContent: "flex-start",
      overflow: "hidden",
      height: 67,
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
      maxHeight: 38,
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
  };

  return (
    <Pressable style={styles.card}>
      {!item.channel_image_url ? (
        <View
          style={{
            height: 63,
            width: 63,
            overflow: "hidden",
            backgroundColor: `${Colors[colorScheme || "light"].colorPrimary}`,
            borderRadius: 10,
          }}
        ></View>
      ) : (
        <View
          style={{
            aspectRatio: "1/1",
            width: 63,
            overflow: "hidden",
            borderRadius: 10,
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
        <View style={styles.cardInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {item.channel_title}
          </Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.channel_description}
          </Text>
        </View>
        <View style={styles.cardControls}>
          <TouchableOpacity
            style={
              isSubscribed ? styles.subscribedButton : styles.subscribeButton
            }
            onPress={handleSubscribe}
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
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}
