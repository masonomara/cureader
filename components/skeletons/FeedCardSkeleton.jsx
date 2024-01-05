import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useColorScheme } from "react-native";

import Colors from "../../constants/Colors";

import {
  getColorForLetter,
  getTextColorForLetter,
} from "../../app/utils/Styling";
import { formatDescription } from "../../app/utils/Formatting";

const CARD_WIDTH = Dimensions.get("window").width - 32;

export default function FeedCardSkeleton() {
  const colorScheme = useColorScheme();

  const styles = {
    cardSkeleton: {
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      borderBottomWidth: 1,
      borderColor: `${Colors[colorScheme || "light"].border}`,
      alignItems: "center",
      flexDirection: "row",
      display: "flex",
      flex: 1,
      width: CARD_WIDTH,
      gap: 0,
      paddingVertical: 12,
      height: 89,
      minHeight: 89,
      maxHeight: 89,
      opacity: 0.5,
    },
    cardContent: {
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
      flex: 1,
      paddingLeft: 12,
      paddingRight: 0,
      gap: 8,
    },
    cardInfo: {
      flex: 1,
      alignItems: "flex-start",
      justifyContent: "flex-start",
      overflow: "hidden",
      height: 64,
      marginTop: -2,
      arginBottom: -2,
    },
    titleSkeleton: {
      borderRadius: 4,
      width: "90%",
      backgroundColor: `${Colors[colorScheme || "light"].border}`,
      marginTop: 2.5,
      marginBottom: 2.5,
      height: 17,
    },
    cardControls: {
      flexDirection: "row",
      gap: 12,
      alignItems: "flex-end",
    },
    descriptionSkeletonContainer: {
      flex: 1,
      width: "100%",
      maxHeight: 38,
      height: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "flexstart",
      justifyContent: "flex",
      marginTop: 2,
    },
    descriptionSkeletonOne: {
      width: "70%",
      marginTop: 2.5,
      marginBottom: 2.5,
      borderRadius: 4,
      height: 14,
      opacity: 0.6,
      backgroundColor: `${Colors[colorScheme || "light"].border}`,
    },
    descriptionSkeletonTwo: {
      width: "60%",
      marginTop: 2.5,
      marginBottom: 2.5,
      borderRadius: 4,
      height: 14,
      opacity: 0.6,
      backgroundColor: `${Colors[colorScheme || "light"].border}`,
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
    subscribedButtonSkeleton: {
      backgroundColor: `${Colors[colorScheme || "light"].border}`,
      borderRadius: 100,
      width: 88,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      height: 34,
      opacity: 1,
    },
  };

  return (
    <View style={styles.cardSkeleton}>
      <View
        style={{
          aspectRatio: "1/1",
          width: 64,
          overflow: "hidden",
          borderRadius: 10,
          backgroundColor: `${Colors[colorScheme || "light"].border}`,
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
          source={require("../../assets/images/iconSkeleton.png")}
        />
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          {/* <Text style={styles.title} numberOfLines={2}>
            {item.channel_title}
          </Text> */}
          <View style={styles.titleSkeleton}></View>
          {/* {item.channel_description ? (
            <Text numberOfLines={2} style={styles.description}>
              {formatDescription(item.channel_description, 200)}
            </Text>
          ) : (
            <Text numberOfLines={2} style={styles.description}></Text>
          )} */}
          <View style={styles.descriptionSkeletonContainer}>
            <View style={styles.descriptionSkeletonOne}></View>
            <View style={styles.descriptionSkeletonTwo}></View>
          </View>
        </View>
        <View style={styles.cardControls}>
          <View style={styles.subscribedButtonSkeleton}></View>
        </View>
      </View>
    </View>
  );
}
