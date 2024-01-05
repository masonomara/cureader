import { View, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useColorScheme } from "react-native";
import Colors from "../../constants/Colors";

const CARD_WIDTH = Dimensions.get("window").width - 32;

export default function FeedCardFeaturedSkeleton() {
  const colorScheme = useColorScheme();

  const styles = {
    cardSkeleton: {
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
      opacity: 0.5,
    },
    cardContent: {
      display: "flex",
      alignItems: "flex-start",
      flexDirection: "column",
      width: "100%",
      padding: 12,
      paddingVertical: 16,
      flex: 1,
      borderTopWidth: 0.5,
      borderColor: `${Colors[colorScheme || "light"].border}`,
    },

    titleSkeleton: {
      borderRadius: 4,
      width: "65%",
      backgroundColor: `${Colors[colorScheme || "light"].border}`,
      marginTop: 2.5,
      marginBottom: 2.5,
      height: 17,
    },

    cardControls: {
      marginTop: 2,
      flexDirection: "row",
      gap: 8,
      alignItems: "flex-end",
      flex: 1,
    },

    descriptionSkeletonContainer: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "flexstart",
      justifyContent: "flex",
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
          aspectRatio: "5/3",
          width: "100%",
          overflow: "hidden",
          borderTopEndRadius: 12,
          borderTopStartRadius: 12,
          backgroundColor: `${Colors[colorScheme || "light"].border}`,
        }}
      >
        <Image
          style={{
            flex: 1,
          }}
          contentFit="cover"
          source={require("../../assets/images/splashSkeleton.png")}
        />
      </View>
      <View style={styles.cardContent}>
        <View style={styles.titleSkeleton}></View>
        <View style={styles.cardControls}>
          <View style={styles.descriptionSkeletonContainer}>
            <View style={styles.descriptionSkeletonOne}></View>
            <View style={styles.descriptionSkeletonTwo}></View>
          </View>
          <View style={styles.subscribedButtonSkeleton}></View>
        </View>
      </View>
    </View>
  );
}
