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
      paddingHorizontal: 16,
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
    headerWrapper: {
      paddingHorizontal: 0,
      paddingBottom: 10,
      gap: 3,
      paddingTop: 41,
      width: "100%",
      maxWidth: "100%",
    },
    title: {
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 34,
      lineHeight: 41,
      letterSpacing: -0.34,
    },
    flashListFooter: {
      height: 16,
    },
  });

  return (
    <View style={styles.container}>
      {randomFeeds != null &&
        user !=
          null(
            <View style={styles.feedList}>
              <FlashList
                data={randomFeeds}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                estimatedItemSize={200}
                ListHeaderComponent={
                  <View style={styles.headerWrapper}>
                    <Text style={styles.title}>Random Feeds</Text>
                  </View>
                }
                renderItem={({ item }) => {
                  return (
                    <FeedCardListItem key={item.id} item={item} user={user} />
                  );
                }}
                ListFooterComponent={() => (
                  <View style={styles.flashListFooter} />
                )}
              />
            </View>
          )}
    </View>
  );
}
