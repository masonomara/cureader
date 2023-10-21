import { StyleSheet, View, Text } from "react-native";

export default function ArticleCard({ item }) {
  console.log({ item });
  return (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <View style={styles.iconWrapper}>
          <View style={styles.icon} />
        </View>
        <View style={styles.cardContentWrapper}>
          <Text style={styles.publicationWrapper}>
            Publication Name&nbsp;&nbsp;
            <Text style={styles.articleDate}>
              {new Date(item.published).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </Text>
          <Text style={styles.title}>{item.title}</Text>
          <Text numberOfLines={4} style={styles.description}>
            {item.description}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderBottomWidth: 1,
    paddingLeft: 8,
    paddingTop: 28,
    paddingRight: 16,
    paddingBottom: 8,
    borderColor: "#E5E5E5",
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
    // borderWidth: 1,
    // borderColor: "blue",
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
    backgroundColor: "#ED4C4B",
  },
  cardContentWrapper: {
    display: "flex",
    paddingBottom: 0,
    flexDirection: "column",
    alignItems: "flex-start",
    flex: 1,
    paddingRight: 16,
    // borderWidth: 1,
    // borderColor: 'red',
  },
  publicationWrapper: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    alignItems: "flex-start",
    flexWrap: "wrap",
    fontFamily: "InterMedium",
    fontWeight: "500",
    lineHeight: 16.25,
    letterSpacing: -0.039,
    fontSize: 13,
    color: "#181818",
    marginBottom: 10,
    // borderWidth: 1,
    // borderColor: 'green',
  },
  articleDate: {
    color: "#5D5D5D",
    fontFamily: "InterRegular",
  },
  title: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    alignItems: "flex-start",
    flexWrap: "wrap",
    fontFamily: "InterBold",
    fontWeight: "500",
    letterSpacing: -0.209,
    fontSize: 19,
    lineHeight: 23.75,
    color: "#181818",
    marginBottom: 7,
    // borderWidth: 1,
    // borderColor: 'green',
  },
  description: {
    display: "flex",
    flexDirection: "row",
    width: "100%",
    alignItems: "flex-start",
    flexWrap: "wrap",
    fontFamily: "SerifRegular",
    fontWeight: "500",
    letterSpacing: -0.045,
    fontSize: 15,
    lineHeight: 23.75,
    color: "#181818",
    marginBottom: 7,
    // borderWidth: 1,
    // borderColor: 'green',
  },
});
