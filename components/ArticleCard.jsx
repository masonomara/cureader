import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  useColorScheme,
  Image,
  Share,
  Alert,
} from "react-native";

import React, { useState } from "react";
import * as WebBrowser from "expo-web-browser";
import Dots20 from "./icons/20/Dots20";
import Share20 from "./icons/20/Share20";
import BookmarkOutline20 from "./icons/20/BookmarkOutline20";
import Colors from "../constants/Colors";

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

export default function ArticleCard({ publication, item, user, fallbackImage }) {

  console.log("[publication]:", publication, "[imageUrl]:", imageUrl, "[fallbackImage]:", fallbackImage, "[item.image.url]:", item.image.url )
  const colorScheme = useColorScheme();
  const [result, setResult] = useState(null);

  const descriptionWithoutTags = item.description;

  // Use a regular expression to capture the URL of the first image
  const match = descriptionWithoutTags.match(/<img.*?src=['"](.*?)['"].*?>/);

  // Extract the captured URL or provide a default value if not found
  const imageUrl = match ? match[1] : "";

  // console.log("item description:", item.description);

  const _handlePressButtonAsync = async () => {
    let result = await WebBrowser.openBrowserAsync(item.links[0].url);
    setResult(result);
  };

  const onShare = () => {
    try {
      const result = Share.share({
        message: "I found this article on my Cureader app",
        url: item.links[0].url,
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
      Alert.alert(error.message);
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
      // borderWidth: 1,
      // borderColor: 'green',
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
      marginBottom: 5,
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
      alignItems: "flex-start",
      gap: "28px",
      alignSelf: "stretch",
      flexDirection: "row",
      width: "100%",
    },
    cardButtons: {
      display: "flex",
      alignItems: "flex-start",
      gap: "28px",
      alignSelf: "stretch",
      flexDirection: "row",
      flex: 1,
    },
    buttonWrapper: {
      height: 44,
      minWidth: 44,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 5,
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
      {(item.image.url || imageUrl || fallbackImage) && (
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
              width: "100%",
              height: "100%",
              borderRadius: 12,
              borderWidth: 0.67,
              borderColor: `${Colors[colorScheme || "light"].border}`,
            }}
            source={{ uri: imageUrl || fallbackImage || item.image.url  }}
          />
        </View>
      )}

      <View style={styles.cardContent}>
        {/*
        <View style={styles.iconWrapper}>
          <View style={styles.icon}></View>
        </View>
          */}
        {/* <Text numberOfLines={4} >{JSON.stringify(user, null, 2)}</Text> */}
        <View style={styles.cardContentWrapper}>
          <Text style={styles.publicationWrapper}>
            {publication}&nbsp;&nbsp;
            <Text style={styles.articleDate}>
              {formatPublicationDate(item.published)}
            </Text>
          </Text>
          <Text style={styles.title}>{item.title ? item.title : ""}</Text>
          <Text numberOfLines={4} style={styles.description}>
            {item.description.replace(/<[^>]*>/g, "").trim()}
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
        <TouchableOpacity style={styles.buttonWrapper}>
          <Dots20
            style={styles.buttonImage}
            color={Colors[colorScheme || "light"].buttonActive}
          />
        </TouchableOpacity>
      </View>
    </Pressable>
  );
}
