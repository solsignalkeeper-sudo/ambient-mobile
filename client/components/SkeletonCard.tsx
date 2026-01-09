import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

export function SkeletonCard() {
  const { theme } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundDefault }, Shadows.card]}>
      <Animated.View
        style={[styles.image, { backgroundColor: theme.backgroundSecondary }, animatedStyle]}
      />
      <View style={styles.content}>
        <Animated.View
          style={[styles.title, { backgroundColor: theme.backgroundSecondary }, animatedStyle]}
        />
        <Animated.View
          style={[styles.subtitle, { backgroundColor: theme.backgroundSecondary }, animatedStyle]}
        />
        <View style={styles.chips}>
          <Animated.View
            style={[styles.chip, { backgroundColor: theme.backgroundSecondary }, animatedStyle]}
          />
          <Animated.View
            style={[styles.chip, { backgroundColor: theme.backgroundSecondary }, animatedStyle]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  image: {
    height: 120,
    width: "100%",
  },
  content: {
    padding: Spacing.lg,
  },
  title: {
    height: 20,
    width: "60%",
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    height: 16,
    width: "80%",
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.md,
  },
  chips: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  chip: {
    height: 24,
    width: 60,
    borderRadius: BorderRadius.full,
  },
});
