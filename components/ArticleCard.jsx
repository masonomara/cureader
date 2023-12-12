import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  useColorScheme,
  Share,
} from "react-native";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  renderers,
} from "react-native-popup-menu";
import { Image } from "expo-image";
import React, { useContext, useState } from "react";
import * as WebBrowser from "expo-web-browser";
import Dots20 from "./icons/20/Dots20";
import Share20 from "./icons/20/Share20";
import { supabase } from "../config/initSupabase";
import BookmarkOutline20 from "./icons/20/BookmarkOutline20";
import Colors from "../constants/Colors";
import { AuthContext } from "../app/_layout";
import FeedCardToolTip from "./FeedCardTooltip";

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

function formatPublicationDate(published) {
  const publicationDate = new Date(published);
  const now = new Date();
  const timeDifference = now - publicationDate;

  const hoursAgo = Math.floor(timeDifference / (60 * 60 * 1000));
  const minutesAgo = Math.floor(timeDifference / (60 * 1000));
  const daysAgo = Math.floor(hoursAgo / 24);
  const yearsAgo = Math.floor(daysAgo / 265);

  if (minutesAgo < 1) {
    return "Just now";
  } else if (minutesAgo < 60) {
    return `${minutesAgo}m`;
  } else if (hoursAgo < 24) {
    return `${hoursAgo}h`;
  } else if (daysAgo < 365) {
    return `${daysAgo}d`;
  } else {
    return `${yearsAgo}y`;
  }
}

export default function ArticleCard({
  fallbackImage,
  feeds,
  feed,
  item,
  publication,
  user,
  userSubscriptionIds,
  userSubscriptionUrls,
}) {
  const { setUserSubscriptionIds, setUserSubscriptionUrls } =
    useContext(AuthContext);
  const colorScheme = useColorScheme();
  const [result, setResult] = useState(null);

  const descriptionWithoutTags = item.description || "";

  // Use a regular expression to capture the URL of the first image
  const match = descriptionWithoutTags.match(/<img.*?src=['"](.*?)['"].*?>/);

  // Extract the captured URL or provide a default value if not found
  const imageUrl = match ? match[1] : "";

  const _handlePressButtonAsync = async () => {
    try {
      let result = await WebBrowser.openBrowserAsync(item.links[0].url);
      setResult(result);
    } catch (error) {
      console.error("Error opening browser:", error);
    }
  };

  const onShare = () => {
    try {
      const result = Share.share({
        message: "I found this article on my Cureader app",
        url: item.links[0]?.url || "",
        tintColor: `${Colors[colorScheme || "light"].colorPrimary}`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          console.log("Shared with activity type of:", result.activityType);
        } else {
          console.log("Shared");
        }
      } else if (result.action === Share.dismissedAction) {
        console.log("Dismissed");
      }
    } catch (error) {
      console.error("Error sharing:", error.message);
    }
  };

  const handleSubscribe = async () => {
    try {
      // If the user is already subscribed to the feed
      const updatedUserSubscriptionIds = userSubscriptionIds.filter(
        (id) => id !== item.id
      );
      const updatedUserSubscriptionUrls = userSubscriptionUrls.filter(
        (url) => url !== item.channel_url
      );

      // Update the state with the new arrays
      setUserSubscriptionIds(updatedUserSubscriptionIds);
      setUserSubscriptionUrls(updatedUserSubscriptionUrls);

      // Update the user's subscriptions in supabase
      await updateUserSubscriptions(
        updatedUserSubscriptionIds,
        updatedUserSubscriptionUrls
      );

      // Update channel subscribers count in supabase
      await updateChannelSubscribers(item.id, user.id, false);
    } catch (error) {
      console.error("Error handling subscription:", error);
      // Handle errors and revert the state if necessary
      setIsOptimisticSubscribed(!isOptimisticSubscribed);
    }
  };

  const updateUserSubscriptions = async (updatedIds, updatedUrls) => {
    try {
      await supabase
        .from("profiles")
        .update({
          channel_subscriptions: updatedIds.map((id, index) => ({
            channelId: id,
            channelUrl: updatedUrls[index],
          })),
        })
        .eq("id", user.id);
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error; // Rethrow the error to handle it elsewhere if needed
    }
  };

  const updateChannelSubscribers = async (
    channelId,
    userId,
    subscribe = true
  ) => {
    try {
      const channelIndex = feeds.findIndex((feed) => feed.id === channelId);

      if (channelIndex !== -1) {
        const updatedFeeds = [...feeds];
        const channelSubscribers =
          updatedFeeds[channelIndex].channel_subscribers || [];

        // Update the channel_subscribers array based on the subscribe flag
        updatedFeeds[channelIndex].channel_subscribers = subscribe
          ? [...channelSubscribers, userId]
          : channelSubscribers.filter((sub) => sub !== userId);

        // Update the channel_subscribers array in Supabase
        await supabase
          .from("channels")
          .update({
            channel_subscribers: updatedFeeds[channelIndex].channel_subscribers,
          })
          .eq("id", channelId);
      } else {
        console.error("Channel not found in the feeds prop");
      }
    } catch (error) {
      console.error("Error updating channel subscribers:", error);
      throw error;
    }
  };

  const styles = {
    card: {
      borderTopWidth: 1,
      borderBottomWidth: 1,
      marginTop: -1,
      paddingTop: 28,
      paddingLeft: 16,
      paddingRight: 16,
      paddingBottom: 8,
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      borderColor: `${Colors[colorScheme || "light"].border}`,
      alignItems: "flex-start",
      flexDirection: "column",
      width: "100%",
    },
    cardContent: {
      display: "flex",
      alignItems: "flex-start",
      gap: "16px",
      alignSelf: "stretch",
      flexDirection: "row",
      width: "100%",
    },
    iconWrapper: {
      display: "flex",
      alignItems: "flex-start",
      gap: "10px",
    },
    icon: {
      height: 24,
      width: 24,
      borderRadius: 100,
      backgroundColor: `${Colors[colorScheme || "light"].colorPrimary}`,
    },
    cardContentWrapper: {
      display: "flex",
      paddingBottom: 0,
      flexDirection: "column",
      alignItems: "flex-start",
      flex: 1,
      // paddingRight: 16,
    },
    publicationWrapper: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      alignItems: "flex-start",
      flexWrap: "wrap",
      marginBottom: 6,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.14,
    },
    articleDate: {
      color: `${Colors[colorScheme || "light"].textLow}`,
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.14,
    },
    title: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      alignItems: "flex-start",
      flexWrap: "wrap",
      marginBottom: 3,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 17,
      lineHeight: 22,
      letterSpacing: -0.17,
    },
    description: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      alignItems: "flex-start",
      flexWrap: "wrap",
      marginBottom: 24,
      color: `${Colors[colorScheme || "light"].textMedium}`,
      fontFamily: "NotoSerifRegular",
      fontWeight: "400",
      fontSize: 15,
      lineHeight: 25,
      letterSpacing: -0.225,
    },
    cardControls: {
      display: "flex",
      alignItems: "center",
      gap: "28px",
      alignSelf: "stretch",
      flexDirection: "row",
      width: "100%",
      height: 52,
      paddingTop: 4,
    },
    cardButtons: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: "12px",
      alignSelf: "stretch",
      flexDirection: "row",
      flex: 1,
    },
    buttonWrapper: {
      height: 40,
      minWidth: 44,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 5,
      paddingHorizontal: 12,
      paddingLeft: 10,
      borderWidth: 0.5,
      borderColor: Colors[colorScheme || "light"].border,
      borderRadius: 100,
    },
    buttonText: {
      color: `${Colors[colorScheme || "light"].buttonActive}`,
      fontFamily: "InterRegular",
      fontWeight: "400",
      fontSize: 13,
      lineHeight: 18,
      letterSpacing: -0.065,
    },
  };

  return (
    <Pressable style={styles.card} onPress={_handlePressButtonAsync}>
      {(item.image?.url || imageUrl || fallbackImage) && (
        <View
          style={{
            aspectRatio: "4/3",
            width: "100%",
            borderRadius: 12,
            overflow: "hidden",
            marginBottom: 12,
          }}
        >
          <Image
            style={{
              flex: 1,
              borderRadius: 12,
              borderWidth: 0.67,
              borderColor: `${Colors[colorScheme || "light"].border}`,
            }}
            contentFit="cover"
            source={{ uri: imageUrl || fallbackImage || item.image?.url }}
          />
        </View>
      )}

      <View style={styles.cardContent}>
        <View style={styles.cardContentWrapper}>
          <Text style={styles.publicationWrapper}>
            {publication}&nbsp;&nbsp;
            <Text style={styles.articleDate}>
              {formatPublicationDate(item.published)}
            </Text>
          </Text>
          <Text style={styles.title}>{item.title ? item.title : ""}</Text>
          <Text numberOfLines={4} style={styles.description}>
            {item.description ? (
              <Text numberOfLines={4} style={styles.description}>
                {item.description
                  .replace(/<[^>]*>/g, "")
                  .replace(/&#8216;/g, "‘")
                  .replace(/&#8217;/g, "’")
                  .replace(/&#160;/g, " ")
                  .replace(/&#8220;/g, "“")
                  .replace(/&#8221;/g, "”")
                  .trim()}
              </Text>
            ) : (
              <Text style={styles.description}></Text>
            )}
          </Text>
        </View>
      </View>
      <View style={styles.cardControls}>
        <View style={styles.cardButtons}>
          <TouchableOpacity style={styles.buttonWrapper}>
            <BookmarkOutline20
              style={styles.buttonImage}
              color={Colors[colorScheme || "light"].buttonActive}
            />
            <Text style={styles.buttonText}>Bookmark</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonWrapper} onPress={onShare}>
            <Share20
              style={styles.buttonImage}
              color={Colors[colorScheme || "light"].buttonActive}
            />
            <Text style={styles.buttonText}>Share</Text>
          </TouchableOpacity>
        </View>

        <FeedCardToolTip item={feed} />
        {/* <TouchableOpacity style={styles.buttonWrapper}>
          <Dots20
            style={styles.buttonImage}
            color={Colors[colorScheme || "light"].buttonActive}
          />
        </TouchableOpacity> */}

        {/* <MenuOptions
            customStyles={{
              optionsContainer: {
                backgroundColor: Colors[colorScheme || "light"].background,
                borderWidth: 0.5,
                borderColor: Colors[colorScheme || "light"].border,
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                shadowColor: "none",
                shadowOpacity: 0,
                overflow: "hidden",
                paddingTop: 8,
                paddingBottom: 12,
              },
              optionsWrapper: {
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                paddingHorizontal: 16,
              },
              optionWrapper: {
                margin: 5,
                alignItems: "flex-start",
                justifyContent: "center",
                paddingHorizontal: 0,
                height: 44,
                // borderWidth: 1,
                // borderColor: "red",
              },
              optionTouchable: {
                underlayColor: "transparent",
                activeOpacity: 0.2,
              },
              optionText: {
                color: Colors[colorScheme || "light"].buttonActive,
                fontFamily: "InterMedium",
                fontWeight: "500",
                fontSize: 15,
                lineHeight: 20,
                letterSpacing: -0.15,
              },
            }}
          >
    
              
              <View style={styles.tooptipPublicationWrapper}>
                {!feed.channel_image_url ? (
                  <View style={styles.noImageContainer}>
                    <Text style={styles.noImageContainerText}>
                      {feed.channel_title} {feed.channel_title}
                    </Text>
                    <Text style={styles.noImageContainerText}>
                      {feed.channel_title} {feed.channel_title}{" "}
                      {feed.channel_title}
                    </Text>
                    <Text style={styles.noImageContainerText}>
                      {feed.channel_title} {feed.channel_title}
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      aspectRatio: "1/1",
                      width: 64,
                      overflow: "hidden",
                      borderRadius: 10,
                    }}
                  >
                    <Image
                      style={{
                        flex: 1,
                        borderRadius: 12,
                        borderWidth: 0.67,
                        borderColor: `${Colors[colorScheme || "light"].border}`,
                      }}
                      contentFit="cover"
                      source={{ uri: feed.channel_image_url }}
                    />
                  </View>
                )}
                <View style={styles.tooltipContent}>
                  <View style={styles.tooltipInfo}>
                    <Text style={styles.tooltipTitle} numberOfLines={2}>
                      {feed.channel_title}
                    </Text>
                    {feed.channel_description ? (
                      <Text style={styles.tooltipDescription} numberOfLines={2}>
                        {feed.channel_description
                          .replace(/<[^>]*>/g, "")
                          .replace(/&#8216;/g, "‘")
                          .replace(/&#8217;/g, "’")
                          .replace(/&#160;/g, " ")
                          .replace(/&#8220;/g, "“")
                          .replace(/&#8221;/g, "”")
                          .trim()}
                      </Text>
                    ) : (
                      <Text numberOfLines={2} style={styles.description}></Text>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.tooltipDivider}></View>
              <MenuOption
                onSelect={() => alert(`Save`)}
                text="View All Articles"
              />
              <View style={styles.tooltipDivider}></View>
              <MenuOption
                onSelect={() => handleSubscribe()}
                text="Unsubscribe"
              />
              <View style={styles.tooltipDivider}></View>
        
          </MenuOptions> */}
      </View>
    </Pressable>
  );
}
