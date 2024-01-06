import { View, useColorScheme } from "react-native";
import { Image } from "expo-image";

import Colors from "../../constants/Colors";

export default function ArticleCardSkeleton() {
  const colorScheme = useColorScheme();

  const styles = {
    cardSkeleton: {
      borderBottomWidth: 1,
      paddingTop: 28,
      paddingLeft: 16,
      paddingRight: 16,
      paddingBottom: 8,
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      borderColor: `${Colors[colorScheme || "light"].border}`,
      alignItems: "flex-start",
      flexDirection: "column",
      width: "100%",
      opacity: 0.5,
    },
    cardContent: {
      display: "flex",
      alignItems: "flex-start",
      gap: "16px",
      alignSelf: "stretch",
      flexDirection: "row",
      width: "100%",
      maxwidth: 550,
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
    },
    cardContentNoImage: {
      display: "flex",
      flexDirection: "row",
      width: "100%",
      borderWidth: 1,
      borderColor: "green",
    },
    cardContentWrapperNoImage: {
      display: "flex",
      flexDirection: "column",
      width: "66%",
      borderWidth: 1,
      borderColor: "blue",
    },
    publicationWrapperNoImage: {
      display: "flex",
      flexDirection: "column",
      width: "100%",
      alignItems: "flex-start",
      marginBottom: 6,
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.14,
      borderWidth: 1,
      borderColor: "red",
    },

    publicationSkeletonWrapper: {
      width: "100%",
      display: "flex",
      height: 19,
      flexDirection: "row",
      marginBottom: 6,
      gap: 7,
    },
    publicationSkeletonText: {
      width: "30%",
      marginTop: 2.5,
      marginBottom: 2.5,
      borderRadius: 4,
      height: 14,
      backgroundColor: `${Colors[colorScheme || "light"].border}`,
    },
    publicationSkeletonDate: {
      width: "10%",
      marginTop: 2.5,
      marginBottom: 2.5,
      borderRadius: 4,
      height: 14,
      opacity: 0.6,
      backgroundColor: `${Colors[colorScheme || "light"].border}`,
    },
    titleSkeletonWrapper: {
      width: "100%",
      display: "flex",
      height: 44,
      flexDirection: "column",
      marginBottom: 3,
    },
    titleSkeletonOne: {
      width: "100%",
      marginTop: 2.5,
      marginBottom: 2.5,
      borderRadius: 4,
      height: 17,
      backgroundColor: `${Colors[colorScheme || "light"].border}`,
    },
    titleSkeletonTwo: {
      width: "75%",
      marginTop: 2.5,
      marginBottom: 2.5,
      borderRadius: 4,
      height: 17,
      backgroundColor: `${Colors[colorScheme || "light"].border}`,
    },
    descriptionSkeletonWrapper: {
      width: "100%",
      height: 66,
      marginBottom: 24,
      display: "flex",
      flexDirection: "column,",
    },
    descriptionSkeletonOne: {
      width: "95%",
      marginTop: 3.5,
      marginBottom: 3.5,
      borderRadius: 4,
      height: 15,
      opacity: 0.6,
      backgroundColor: `${Colors[colorScheme || "light"].border}`,
    },
    descriptionSkeletonTwo: {
      width: "98%",
      marginTop: 3.5,
      marginBottom: 3.5,
      borderRadius: 4,
      height: 15,
      opacity: 0.6,
      backgroundColor: `${Colors[colorScheme || "light"].border}`,
    },
    descriptionSkeletonThree: {
      width: "85%",
      marginTop: 3.5,
      marginBottom: 3.5,
      borderRadius: 4,
      height: 15,
      opacity: 0.6,
      backgroundColor: `${Colors[colorScheme || "light"].border}`,
    },
    cardControls: {
      display: "flex",
      alignItems: "center",
      gap: "28px",
      alignSelf: "stretch",
      flexDirection: "row",
      width: "100%",
      height: 52,
      paddingTop: 4,
    },
    cardButtons: {
      display: "flex",
      alignItems: "center",
      justifyContent: "flex-start",
      gap: "12px",
      alignSelf: "stretch",
      flexDirection: "row",
      flex: 1,
    },
    buttonWrapperSkeletonShare: {
      height: 40,
      minWidth: 44,
      width: 83.3,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 5,
      paddingHorizontal: 12,
      paddingLeft: 10,
      borderWidth: 0.5,
      borderColor: Colors[colorScheme || "light"].surfaceOne,
      backgroundColor: Colors[colorScheme || "light"].surfaceOne,
      borderRadius: 100,
    },
    buttonWrapperSkeletonBookmark: {
      height: 40,
      minWidth: 44,
      width: 109.3,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 5,
      paddingHorizontal: 12,
      paddingLeft: 10,
      borderWidth: 0.5,
      borderColor: Colors[colorScheme || "light"].surfaceOne,
      backgroundColor: Colors[colorScheme || "light"].surfaceOne,
      borderRadius: 100,
    },
    buttonWrapperSkeletonToolTip: {
      height: 40,
      minWidth: 40,
      width: 40,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 5,
      paddingHorizontal: 12,
      paddingLeft: 10,
      borderWidth: 0.5,
      borderColor: Colors[colorScheme || "light"].surfaceOne,
      backgroundColor: Colors[colorScheme || "light"].surfaceOne,
      borderRadius: 100,
    },
  };

  const renderCardContent = () => (
    <View style={styles.cardContent}>
      <View style={styles.cardContentWrapper}>
        <View style={styles.publicationSkeletonWrapper}>
          <View style={styles.publicationSkeletonText} />
          <View style={styles.publicationSkeletonDate} />
        </View>
        <View style={styles.titleSkeletonWrapper}>
          <View style={styles.titleSkeletonOne} />
          <View style={styles.titleSkeletonTwo} />
        </View>
        <View style={styles.descriptionSkeletonWrapper}>
          <View style={styles.descriptionSkeletonOne} />
          <View style={styles.descriptionSkeletonTwo} />
          <View style={styles.descriptionSkeletonThree} />
        </View>
      </View>
    </View>
  );

  const renderImage = () => (
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
          borderRadius: 12,
          borderWidth: 0.67,
          borderColor: `${Colors[colorScheme || "light"].border}`,
          backgroundColor: `${Colors[colorScheme || "light"].border}`,
        }}
        contentFit="cover"
        source={require("../../assets/images/splashSkeleton.png")}
      />
    </View>
  );

  const renderCardControls = () => (
    <View style={styles.cardControls}>
      <View style={styles.cardButtons}>
        <View style={styles.buttonWrapperSkeletonShare}></View>
        <View style={styles.buttonWrapperSkeletonBookmark}></View>
      </View>
      <View style={styles.buttonWrapperSkeletonToolTip}></View>
    </View>
  );

  return (
    <View style={styles.cardSkeleton}>
      {renderImage()}
      {renderCardContent()}
      {renderCardControls()}
    </View>
  );
}
