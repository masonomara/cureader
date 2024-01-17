import { View, Text, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useColorScheme } from "react-native";
import Colors from "../constants/Colors";
import { getColorForLetter, getTextColorForLetter } from "../app/utils/Styling";
import { formatDescription } from "../app/utils/Formatting";

const CARD_WIDTH = Dimensions.get("window").width - 48;

export default function FeedCardDummyPreview({ title, description, imageUrl }) {
  const colorScheme = useColorScheme();

  const styles = {
    card: {
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      borderWidth: 0.5,
      borderColor: `${Colors[colorScheme || "light"].border}`,
      alignItems: "center",
      flexDirection: "row",
      display: "flex",
      flex: 1,
      width: CARD_WIDTH,
      gap: 10,
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderRadius: 16,

      marginBottom: 32,
    },
    cardContent: {
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
      flex: 1,
      gap: 8,
    },
    cardInfo: {
      flex: 1,
      alignItems: "flex-start",
      justifyContent: "center",
      overflow: "hidden",
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
      flexDirection: "row",
      gap: 3,
      alignItems: "center",
    },
    description: {
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
      color: `${Colors[colorScheme || "light"].buttonActive}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.15,
    },
    noImageContainer: {
      height: 68,
      width: 68,
      borderRadius: 12,
      backgroundColor: getColorForLetter(title[0] || "a"),
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
      borderWidth: 0.5,
      borderColor: `${Colors[colorScheme || "light"].border}`,
    },
    noImageContainerText: {
      fontFamily: "NotoSerifMedium",
      fontWeight: "500",
      fontSize: 23,
      lineHeight: 23,
      letterSpacing: -0.172,
      color: getTextColorForLetter(title[0] || "a"),
      textAlignVertical: "center",
      textAlign: "center",
      width: "1000%",
    },
  };

  return (
    <View style={styles.card}>
      {!imageUrl ? (
        <View style={styles.noImageContainer}>
          <Text style={styles.noImageContainerText}>
            {title} {title}
          </Text>
          <Text style={styles.noImageContainerText}>
            {title} {title} {title}
          </Text>
          <Text style={styles.noImageContainerText}>
            {title} {title}
          </Text>
        </View>
      ) : (
        <View
          style={{
            aspectRatio: "1/1",
            width: 68,
            overflow: "hidden",
            borderRadius: 12,
            borderWidth: 0.5,
            backgroundColor: `white`,
            borderColor: `${Colors[colorScheme || "light"].border}`,
          }}
        >
          <Image
            style={{
              flex: 1,
            }}
            contentFit="cover"
            source={{ uri: imageUrl }}
          />
        </View>
      )}
      <View style={styles.cardContent}>
        <View style={styles.cardInfo}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {description ? (
            <Text numberOfLines={2} style={styles.description}>
              {formatDescription(description, 200)}
            </Text>
          ) : (
            <Text numberOfLines={2} style={styles.description}></Text>
          )}
        </View>
        <View style={styles.cardControls}>
          <View style={styles.subscribeButton}>
            <Text style={styles.subscribeButtonText}>Follow</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
