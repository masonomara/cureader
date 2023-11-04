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
import Colors from "../constants/Colors";

const CARD_WIDTH = Dimensions.get("window").width * 0.75;


export default function ChannelCardFeatured({ item }) {
  const colorScheme = useColorScheme();
  console.log("ITEM:", item)
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
      paddingVertical: 8,
      height: 36,
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
      {item ? (
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
            source={{ uri: item.image.url }}
          />
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.title}  numberOfLines={1} >{item.channel_title}</Text>
        <View style={styles.cardControls}>
          <Text numberOfLines={2} style={styles.description}>
            {item.description}
          </Text>
          <TouchableOpacity style={styles.subscribeButton}>
            <Text style={styles.subscribeButtonText}>Subscribe</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Pressable>
  );
}
