import React, { useState, useEffect } from "react";
import {
  FlatList,
  TouchableOpacity,
  Alert,
  useColorScheme,
  ScrollView,
  Image,
  ActivityIndicator, // Import ActivityIndicator
} from "react-native";
import {
  router,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from "expo-router";
import { supabase } from "../config/initSupabase";
import { Text, View } from "../components/Themed";
import * as rssParser from "react-native-rss-parser";
import ArticleCard from "../components/ArticleCard";
import Colors from "../constants/Colors";

export default function TabOneScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const colorScheme = useColorScheme();
  const [rssItems, setRssItems] = useState([]);
  const [user, setUser] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(params.subscribed);
  const [isOptimisticSubscribed, setIsOptimisticSubscribed] = useState(
    params.subscribed
  );
  const [subscriptionStatus, setSubscriptionStatus] = useState(
    isOptimisticSubscribed
  );
  const [isLoading, setIsLoading] = useState(true); // Add a loading state

  console.log("isSubscribed:", isSubscribed)
  console.log("isOptimisticSubscribed:", isOptimisticSubscribed)
  console.log("user:", user)


  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser(user);
      }
    });
  }, []);

  useEffect(() => {
    // Update state when the subscribed prop changes
    setIsSubscribed(params.subscribed);
    setIsOptimisticSubscribed(params.subscribed);
  }, [params.subscribed]);

  console.log("isSubscribed 2:", isSubscribed)
  console.log("isOptimisticSubscribed 2:", isOptimisticSubscribed)
  console.log("item.id:", params.id)
  console.log("item.channel_url:", params.url)

  const paramsId = params.id


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
      const itemChannelId = parseInt(paramsId, 10); // Ensure channelId is a number
  
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
          .eq("id", paramsId);
  
        if (!channelError) {
          const channel = channelData[0];
          const updatedSubscribers = channel.channel_subscribers.filter(
            (subscriber) => subscriber !== user.id
          );
          await updateChannelSubscribers(paramsId, updatedSubscribers);
        }
      } else {
        // Subscribe
        const newSubscription = {
          channelId: itemChannelId,
          channelUrl: params.url,
        };
        const updatedSubscriptions = [...channelSubscriptions, newSubscription];
        await updateSubscriptions(user.id, updatedSubscriptions);
  
        const { data: channelData, error: channelError } = await supabase
          .from("channels")
          .select()
          .eq("id", paramsId);
  
        if (!channelError) {
          const channel = channelData[0];
          const updatedSubscribers = [...channel.channel_subscribers, user.id];
          await updateChannelSubscribers(paramsId, updatedSubscribers);
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

  const showErrorAlert = (message) => {
    Alert.alert("Error", message);
  };

  useEffect(() => {
    const parseFeed = async () => {
      if (params.url) {
        try {
          const response = await fetch(params.url);
          if (!response.ok) {
            throw new Error("Network response was not ok");
          }
          const responseData = await response.text();
          const parsedRss = await rssParser.parse(responseData);

          const allItems = parsedRss.items.map((item) => ({
            ...item,
            publicationDate: new Date(item.published),
            channel: parsedRss.title,
            image: parsedRss.image,
            channelUrl: parsedRss.links[0].url,
          }));

          allItems.sort((a, b) => b.publicationDate - a.publicationDate);

          setRssItems(allItems);
        } catch (error) {
          console.error(error);
          showErrorAlert(
            "Error fetching or parsing the RSS feed. Please try again."
          );
        } finally {
          setIsLoading(false); // Set loading to false after the effect is done firing
        }
      }
    };

    parseFeed();
  }, [params.url]);

  // Styles
  const styles = {
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },
    articleList: {
      width: "100%",
    },
    input: {
      width: "100%",
      borderRadius: 20,
      height: 56,
      marginBottom: 16,
      paddingHorizontal: 16,
      borderWidth: 1,
      flexDirection: "row",
      borderColor: `${Colors[colorScheme || "light"].border}`,
      backgroundColor: `${Colors[colorScheme || "light"].surfaceOne}`,
      alignContent: "center",
      justifyContent: "space-between",
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterRegular",
      fontWeight: "500",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0,
    },
    inputText: {
      flex: 1,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterRegular",
      fontWeight: "500",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0,
    },
    button: {
      height: 48,
      width: "100%",
      flexDirection: "row",
      backgroundColor: `${Colors[colorScheme || "light"].colorPrimary}`,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
    },
    buttonDisabled: {
      height: 48,
      width: "100%",
      flexDirection: "row",
      backgroundColor: `${Colors[colorScheme || "light"].buttonMuted}`,
      borderRadius: 18,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 8,
    },
    buttonText: {
      color: `${Colors[colorScheme || "light"].colorOn}`,
      fontFamily: "InterBold",
      fontWeight: "700",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0.17,
    },
    card: {
      // Your existing card styles
    },
    subscriptionText: {
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterRegular",
      fontWeight: "500",
      fontSize: 20,
      lineHeight: 26,
      letterSpacing: -0,
      marginTop: 10,
    },
  };

  return isLoading ? (
    <View style={styles.loadingContainer}>
      <ActivityIndicator
        size="large"
        color={Colors[colorScheme || "light"].colorPrimary}
      />
    </View>
  ) : (
    <FlatList
      data={rssItems}
      keyExtractor={(item, index) => index.toString()}
      style={styles.articleList}
      ListHeaderComponent={() => (
        <View style={styles.card}>
          {!params.image ? (
            <View
              style={{
                height: 110,
                width: 110,
                overflow: "hidden",
                backgroundColor: `${
                  Colors[colorScheme || "light"].colorPrimary
                }`,
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
                source={{ uri: params.image }}
              />
            </View>
          )}
          <View style={styles.cardContent}>
            <Text style={styles.title} numberOfLines={2}>
              {params.title}
            </Text>
            <Text style={styles.description} numberOfLines={4}>
              {params.description}
            </Text>
            <Text style={styles.subscriptionText}>
              {subscriptionStatus.toString() === "true" ? "Nut" : "No Nut"}
            </Text>
            <TouchableOpacity onPress={handleSubscribe}>
              <Text>
                {isOptimisticSubscribed.toString() === "true"
                  ? "Following"
                  : "Follow"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
      renderItem={({ item }) => (
        <ArticleCard
          item={item}
          publication={item.channel}
          image={item.image}
          channelUrl={item.channelUrl}
          user={user}
        />
      )}
    />
  );
}
