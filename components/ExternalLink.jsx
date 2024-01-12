import { Link } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React from "react";
import { Platform } from "react-native";

export function ExternalLink({ href, ...props }) {
  const handlePress = async () => {
    if (Platform.OS !== "web") {
      await WebBrowser.openBrowserAsync(href);
    }
  };

  return (
    <Link
      hrefAttrs={{
        target: "_blank",
      }}
      {...props}
      href={Platform.OS === "web" ? href : undefined}
      onPress={handlePress}
    />
  );
}
