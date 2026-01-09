import React from "react";
import { View, StyleSheet, Pressable, ImageBackground } from "react-native";
import { Image } from "expo-image";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Colors, Spacing, BorderRadius, Typography, Shadows } from "@/constants/theme";
import type { Encounter } from "@/lib/types";

interface EncounterCardProps {
  encounter: Encounter;
  onPress: () => void;
  index?: number;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function EncounterCard({ encounter, onPress, index = 0 }: EncounterCardProps) {
  const { theme, isDark } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const formattedDate = new Date(encounter.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      testID={`card-encounter-${encounter.id}`}
    >
      <Animated.View
        entering={FadeIn.delay(index * 50).duration(300)}
        style={[
          styles.card,
          {
            backgroundColor: theme.backgroundDefault,
          },
          Shadows.card,
        ]}
      >
        {encounter.photoUri ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: encounter.photoUri }}
              style={styles.image}
              contentFit="cover"
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.6)"]}
              style={styles.gradient}
            />
            <View style={styles.imageOverlay}>
              <ThemedText style={styles.imageTitle}>{encounter.title}</ThemedText>
              <View style={styles.imageMeta}>
                <ThemedText style={styles.imageDate}>{formattedDate}</ThemedText>
                {encounter.location ? (
                  <View style={styles.locationBadge}>
                    <Feather name="map-pin" size={10} color="#FFFFFF" />
                    <ThemedText style={styles.locationText}>
                      {encounter.location.label}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.contentOnly}>
            <View style={styles.header}>
              <ThemedText style={[styles.title, { color: theme.text }]}>
                {encounter.title}
              </ThemedText>
              <ThemedText style={[styles.date, { color: theme.textSecondary }]}>
                {formattedDate}
              </ThemedText>
            </View>
            {encounter.description ? (
              <ThemedText
                style={[styles.description, { color: theme.textSecondary }]}
                numberOfLines={2}
              >
                {encounter.description}
              </ThemedText>
            ) : null}
            {encounter.moods.length > 0 ? (
              <View style={styles.moods}>
                {encounter.moods.slice(0, 3).map((mood) => (
                  <View
                    key={mood}
                    style={[styles.moodChip, { backgroundColor: theme.secondary }]}
                  >
                    <ThemedText style={[styles.moodText, { color: theme.primary }]}>
                      {mood}
                    </ThemedText>
                  </View>
                ))}
              </View>
            ) : null}
            {encounter.location ? (
              <View style={styles.locationRow}>
                <Feather name="map-pin" size={12} color={theme.textSecondary} />
                <ThemedText style={[styles.locationLabel, { color: theme.textSecondary }]}>
                  {encounter.location.label}
                </ThemedText>
              </View>
            ) : null}
          </View>
        )}
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginBottom: Spacing.lg,
  },
  imageContainer: {
    height: 200,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 100,
  },
  imageOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: Spacing.lg,
  },
  imageTitle: {
    ...Typography.heading,
    color: "#FFFFFF",
    marginBottom: Spacing.xs,
  },
  imageMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  imageDate: {
    ...Typography.caption,
    color: "rgba(255,255,255,0.8)",
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  locationText: {
    ...Typography.label,
    color: "#FFFFFF",
  },
  contentOnly: {
    padding: Spacing.lg,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.heading,
    flex: 1,
    marginRight: Spacing.sm,
  },
  date: {
    ...Typography.caption,
  },
  description: {
    ...Typography.body,
    marginBottom: Spacing.md,
  },
  moods: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  moodChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  moodText: {
    ...Typography.label,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  locationLabel: {
    ...Typography.caption,
  },
});
