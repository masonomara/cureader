import { useContext, useState } from "react";
import { FeedContext } from "./_layout";
import { Text, useColorScheme, ScrollView } from "react-native";
import { View } from "../components/Themed";
import Colors from "../constants/Colors";
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
  renderers,
} from "react-native-popup-menu";
import CategoriesContainer from "../components/CategoriesContainer";
import Sort20 from "../components/icons/20/Sort20";

export default function TabOneScreen() {
  const { feedCategories } = useContext(FeedContext);

  const colorScheme = useColorScheme();
  const [categoriesSort, setCategoriesSort] = useState("Popularity");

  const handleSortChange = (sortOption) => {
    setCategoriesSort(sortOption);
  };

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
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
    },
    title: {
      color: `${Colors[colorScheme || "light"].textHigh}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 34,
      lineHeight: 41,
      letterSpacing: -0.34,
      flex: 1,
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
    textButton: {
      display: "flex",
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "flex-end",
      width: 180,
      height: 44,
      gap: 2,
      marginVertical: -8,
      marginBottom: -12,
    },
    textButtonText: {
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 15,
      lineHeight: 20,
      letterSpacing: -0.15,
      color: `${Colors[colorScheme || "light"].buttonActive}`,
    },
    filterText: {
      fontFamily: "InterMedium",
      fontWeight: "500",
      fontSize: 15,
      lineHeight: 21,
      letterSpacing: -0.16,
      color: `${Colors[colorScheme || "light"].textMedium}`,
    },
    tooptipPublicationWrapper: {
      backgroundColor: `${Colors[colorScheme || "light"].background}`,
      borderBottomWidth: 1,
      borderColor: `${Colors[colorScheme || "light"].border}`,
      alignItems: "center",
      flexDirection: "row",
      display: "flex",
      flex: 1,
      width: "100%",
      gap: 10,
      paddingVertical: 10,
      paddingBottom: 16,
    },
    tooltipContent: {
      display: "flex",
      alignItems: "center",
      flexDirection: "row",
      flex: 1,
      gap: 8,
    },
    tooltipInfo: {
      flex: 1,
      alignItems: "flex-start",
      justifyContent: "center",
      overflow: "hidden",
    },
    tooltipTitle: {
      color: `${Colors[colorScheme || "light"].buttonActive}`,
      fontFamily: "InterSemiBold",
      fontWeight: "600",
      fontSize: 14,
      lineHeight: 19,
      letterSpacing: -0.14,
    },
    tooltipDivider: {
      height: 1,
      width: "100%",
      backgroundColor: `${Colors[colorScheme || "light"].border}`,
    },
  };

  return (
    <View style={styles.container}>
      <View style={styles.feedList}>
        <ScrollView
          contentContainerStyle={styles.flashList}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        >
          <View style={styles.headerWrapper}>
            <Text style={styles.title}>Categories</Text>

            <Menu renderer={renderers.SlideInMenu}>
              <MenuTrigger
                customStyles={{
                  triggerTouchable: {
                    underlayColor: "transparent",
                    activeOpacity: 0.2,
                    style: {
                      width: 44,
                      height: 44,
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                    },
                  },
                }}
              >
                <View style={styles.textButton}>
                  <Text style={styles.textButtonText}>
                    {/* <Text style={styles.filterText}>By:&nbsp;</Text> */}
                    {categoriesSort}
                  </Text>
                  <Sort20 color={Colors[colorScheme || "light"].buttonActive} />
                </View>
              </MenuTrigger>
              <MenuOptions
                customStyles={{
                  optionsContainer: {
                    backgroundColor: Colors[colorScheme || "light"].background,
                    borderWidth: 0.5,
                    borderColor: Colors[colorScheme || "light"].border,
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    shadowColor: "none",
                    shadowOpacity: 0,
                    overflow: "hidden",
                    paddingTop: 8,
                    paddingBottom: 64,
                  },
                  optionsWrapper: {
                    borderTopLeftRadius: 20,
                    borderTopRightRadius: 20,
                    paddingHorizontal: 16,
                  },
                  optionWrapper: {
                    margin: 5,
                    alignItems: "flex-start",
                    justifyContent: "center",
                    paddingHorizontal: 0,
                    height: 44,
                  },
                  optionTouchable: {
                    underlayColor: "transparent",
                    activeOpacity: 0.2,
                  },
                  optionText: {
                    color: Colors[colorScheme || "light"].buttonActive,
                    fontFamily: "InterMedium",
                    fontWeight: "500",
                    fontSize: 15,
                    lineHeight: 20,
                    letterSpacing: -0.15,
                  },
                }}
              >
                <View style={styles.tooptipPublicationWrapper}>
                  <View style={styles.tooltipContent}>
                    <View style={styles.tooltipInfo}>
                      <Text style={styles.tooltipTitle} numberOfLines={1}>
                        Filter By
                      </Text>
                    </View>
                  </View>
                </View>

                <MenuOption
                  onSelect={() => handleSortChange("Popularity")}
                  text="Popularity"
                />
                <View style={styles.tooltipDivider}></View>
                <MenuOption
                  onSelect={() => handleSortChange("Alphabetical")}
                  text="Alphabetical"
                />
                <View style={styles.tooltipDivider}></View>
              </MenuOptions>
            </Menu>
          </View>

          <View style={styles.categoriesContainer}>
            {feedCategories
              .filter((category) => category.channels.length > 0)
              .sort(
                categoriesSort === "Popularity"
                  ? (a, b) => b.channels.length - a.channels.length
                  : (a, b) => {
                      const titleA = a.title.toLowerCase();
                      const titleB = b.title.toLowerCase();
                      return titleA.localeCompare(titleB);
                    }
              )
              .map((category) => {
                console.log(category.t);

                return (
                  <CategoriesContainer key={category.id} category={category} />
                );
              })}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
