import { useContext } from "react";
import { FeedContext } from "./_layout";
import { Text, useColorScheme, ScrollView } from "react-native";
import { View } from "../components/Themed";
import Colors from "../constants/Colors";
import CategoriesContainer from "../components/CategoriesContainer";

export default function TabOneScreen() {
  const { feedCategories } = useContext(FeedContext);

  const colorScheme = useColorScheme();

  const styles = {
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
    headerWrapper: {
      paddingHorizontal: 16,
      paddingBottom: 10,
      gap: 3,
      width: "100%",
      maxWidth: "100%",
      paddingTop: 41,
    },
    title: {
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 34,
      lineHeight: 41,
      letterSpacing: -0.34,
    },
    categoriesContainer: {
      flex: 1,
      paddingHorizontal: 16,
      marginBottom: 29,
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      rowGap: 8,
      overflow: "hidden",
    },
    flashList: {
      display: "flex",
      flexDirection: "column",
    },
  };

  return (
    <View style={styles.container}>
      {feedCategories.length !== 0 && (
        <View style={styles.feedList}>
          <ScrollView
            contentContainerStyle={styles.flashList}
            showsVerticalScrollIndicator={false}
            showsHorizontalScrollIndicator={false}
          >
            <View style={styles.headerWrapper}>
              <Text style={styles.title}>Categories</Text>
            </View>

            <View style={styles.categoriesContainer}>
              {feedCategories
                .filter((category) => category.channels.length != 0)
                .sort((a, b) => b.channels.length - a.channels.length)
                .map((category) => {
                  return (
                    <CategoriesContainer
                      key={category.id}
                      category={category}
                    />
                  );
                })}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}
