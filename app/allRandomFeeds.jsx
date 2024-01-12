import React, { useContext } from "react";
import { useColorScheme, View, Text } from "react-native";
import { FlashList } from "@shopify/flash-list";
import Colors from "../constants/Colors";
import FeedCardListItem from "../components/FeedCardListItem";
import { AuthContext, FeedContext } from "./_layout";

export default function TabOneScreen() {
  const { randomFeeds } = useContext(FeedContext);
  const { user } = useContext(AuthContext);
  const colorScheme = useColorScheme();

  const createStyles = (additionalStyles) => ({
    ...additionalStyles,
    container: {
      flex: 1,
      alignItems: "center",
      width: "100%",
      maxWidth: "100%",
      justifyContent: "center",
      backgroundColor: Colors[colorScheme || "light"].background,
    },
  });

  const styles = createStyles({
    container: {
      flex: 1,
      alignItems: "center",
      width: "100%",
      maxWidth: "100%",
      justifyContent: "center",
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
    },
    feedList: {
      width: "100%",
      maxWidth: "100%",
      minWidth: "100%",
      flex: 1,
      paddingHorizontal: 0,
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
    headerWrapper: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      gap: 3,
      width: "100%",
      maxWidth: "100%",
      height: 86,
    },
    titleWrapper: {
      width: "100%",
      marginTop: 8,
      flexDirection: "row",
      justifyContent: "flex-start",
      alignItems: "center",
    },
    headerSubtitle: {
      color: `${Colors[colorScheme || "light"].textLow}`,
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.15,
    },
    title: {
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterBold",
      fontWeight: "700",
      fontSize: 24,
      lineHeight: 31,
      letterSpacing: -0.24,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.feedList}>
        <FlashList
          data={randomFeeds}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          estimatedItemSize={200}
          ListHeaderComponent={
            <View style={styles.headerWrapper}>
              <View style={styles.titleWrapper}>
                <Text style={styles.title}>Random Feeds</Text>
              </View>
              <Text style={styles.headerSubtitle}>
                Explore some randomly selected feeds.{" "}
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            return <FeedCardListItem key={item.id} item={item} user={user} />;
          }}
        />
      </View>
    </View>
  );
}
