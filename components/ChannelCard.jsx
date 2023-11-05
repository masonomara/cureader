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

import { useEffect, useState } from "react";
import Colors from "../constants/Colors";

const CARD_WIDTH = Dimensions.get("window").width * 0.75;

export default function ChannelCard({ item, user }) {
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

        console.log("channelSubscriptions:", channelSubscriptions);
        console.log("itemChannelId:", itemChannelId);

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

  const colorScheme = useColorScheme();
  const styles = {
    card: {
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      borderTopWidth: 1,
      borderColor: `${Colors[colorScheme || "light"].border}`,
      alignItems: "center",
      flexDirection: "row",
      display: "flex",
      flex: 1,
      gap: 0,
      paddingVertical: 6,
    },
    cardContent: {
      display: "flex",
      alignItems: "flex-start",
      flexDirection: "column",
      flex: 1,
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
            height: 74,
            width: 74,
            overflow: "hidden",
            backgroundColor: `${Colors[colorScheme || "light"].colorPrimary}`,
            borderRadius: 17,
          }}
        ></View>
      ) : (
        <View
          style={{
            aspectRatio: "1/1",
            width: 74,
            overflow: "hidden",
            borderRadius: 17,
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
          <TouchableOpacity style={styles.subscribeButton}>
            <Text style={styles.subscribeButtonText}>
              {isSubscribed ? "Subscribed" : "Subscribe"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}
