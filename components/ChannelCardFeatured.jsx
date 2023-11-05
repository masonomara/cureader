import {
  View,
  Text,
  TouchableOpacity,
  useColorScheme,
  Pressable,
  Image,
  Dimensions,
  TextInput,
} from "react-native";
import { supabase } from "../config/initSupabase";

import { useState, useEffect } from "react";
import Colors from "../constants/Colors";

const CARD_WIDTH = Dimensions.get("window").width * 0.75;

export default function ChannelCardFeatured({ item, user }) {
  const [isSubscribed, setIsSubscribed] = useState(false);

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
      marginTop: 6,
      flexDirection: "row",
      gap: 12,
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
      paddingHorizontal: 12,
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
  };

  return (
    <Pressable style={styles.card}>
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
            style={styles.subscribeButton}
            onPress={handleSubscribe}
          >
            <Text style={styles.subscribeButtonText}>
              {isSubscribed ? "Subscribed" : "Subscribe"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}
