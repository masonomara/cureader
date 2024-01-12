import { useContext } from "react";
import { Text, View } from "../components/Themed";
import { FeedContext } from "./_layout";
import Colors from "../constants/Colors";
import { useColorScheme } from "react-native";

export default function QuoteSplash() {
  const colorScheme = useColorScheme();
  const { dailyQuote } = useContext(FeedContext);
  const styles = {
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      flex: 1,
      height: "100%",
      backgroundColor: Colors[colorScheme || "light"].colorPrimary,
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.dailyQuoteContainerLoading}>
        {dailyQuote && dailyQuote.length > 0 && (
          <View style={styles.dailyQuoteWrapper}>
            <Text style={styles.dailyQuoteQuote}>“{dailyQuote[0].q}”</Text>
            <Text style={styles.dailyQuoteAuthor}>- {dailyQuote[0].a}</Text>
          </View>
        )}
      </View>
    </View>
  );
}
