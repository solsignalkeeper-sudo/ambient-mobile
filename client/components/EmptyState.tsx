import React from "react";
import { View, StyleSheet, Image } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Typography } from "@/constants/theme";

interface EmptyStateProps {
  type: "discover" | "journal";
  title: string;
  message: string;
}

const images = {
  discover: require("../../assets/images/empty-discover.png"),
  journal: require("../../assets/images/empty-journal.png"),
};

export function EmptyState({ type, title, message }: EmptyStateProps) {
  const { theme } = useTheme();

  return (
    <Animated.View entering={FadeIn.duration(400)} style={styles.container}>
      <Image source={images[type]} style={styles.image} resizeMode="contain" />
      <ThemedText style={[styles.title, { color: theme.text }]}>{title}</ThemedText>
      <ThemedText style={[styles.message, { color: theme.textSecondary }]}>
        {message}
      </ThemedText>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["2xl"],
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.title,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  message: {
    ...Typography.body,
    textAlign: "center",
    maxWidth: 280,
  },
});
