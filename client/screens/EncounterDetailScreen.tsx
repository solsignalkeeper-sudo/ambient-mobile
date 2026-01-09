import React, { useMemo, useCallback } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { Image } from "expo-image";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, SlideInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useEncounters, useDeleteEncounter } from "@/lib/hooks";
import { Spacing, BorderRadius, Typography, Shadows } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function EncounterDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, "EncounterDetail">>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const { data: encounters } = useEncounters();
  const deleteEncounter = useDeleteEncounter();

  const encounter = useMemo(
    () => encounters?.find((e) => e.id === route.params.id),
    [encounters, route.params.id]
  );

  const handleDelete = useCallback(() => {
    Alert.alert(
      "Delete Encounter",
      "Are you sure you want to delete this encounter? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await deleteEncounter.mutateAsync(route.params.id);
            navigation.goBack();
          },
        },
      ]
    );
  }, [deleteEncounter, navigation, route.params.id]);

  if (!encounter) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={[styles.backButton, { backgroundColor: theme.backgroundDefault }]}
          >
            <Feather name="arrow-left" size={20} color={theme.text} />
          </Pressable>
        </View>
        <View style={styles.notFound}>
          <ThemedText style={[styles.notFoundText, { color: theme.textSecondary }]}>
            Encounter not found
          </ThemedText>
        </View>
      </View>
    );
  }

  const formattedDate = new Date(encounter.createdAt).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const formattedTime = new Date(encounter.createdAt).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + Spacing.xl }}
      showsVerticalScrollIndicator={false}
    >
      {encounter.photoUri ? (
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: encounter.photoUri }}
            style={styles.heroImage}
            contentFit="cover"
          />
          <LinearGradient
            colors={["rgba(0,0,0,0.4)", "transparent", "rgba(0,0,0,0.6)"]}
            style={styles.heroGradient}
          />
          <View style={[styles.header, { paddingTop: insets.top + Spacing.sm }]}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={[styles.backButton, { backgroundColor: "rgba(255,255,255,0.9)" }]}
            >
              <Feather name="arrow-left" size={20} color="#000" />
            </Pressable>
            <Pressable
              onPress={handleDelete}
              style={[styles.backButton, { backgroundColor: "rgba(255,255,255,0.9)" }]}
              testID="button-delete-encounter"
            >
              <Feather name="trash-2" size={20} color="#FF3B30" />
            </Pressable>
          </View>
          <View style={styles.heroOverlay}>
            <ThemedText style={styles.heroTitle}>{encounter.title}</ThemedText>
          </View>
        </View>
      ) : (
        <View
          style={[
            styles.noImageHeader,
            { backgroundColor: theme.primary, paddingTop: insets.top },
          ]}
        >
          <View style={[styles.header, { paddingTop: Spacing.sm }]}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={[styles.backButton, { backgroundColor: "rgba(255,255,255,0.2)" }]}
            >
              <Feather name="arrow-left" size={20} color="#FFF" />
            </Pressable>
            <Pressable
              onPress={handleDelete}
              style={[styles.backButton, { backgroundColor: "rgba(255,255,255,0.2)" }]}
              testID="button-delete-encounter"
            >
              <Feather name="trash-2" size={20} color="#FFF" />
            </Pressable>
          </View>
          <View style={styles.noImageContent}>
            <ThemedText style={styles.heroTitle}>{encounter.title}</ThemedText>
          </View>
        </View>
      )}

      <Animated.View
        entering={SlideInUp.delay(150).springify()}
        style={[
          styles.contentCard,
          { backgroundColor: theme.backgroundDefault },
          Shadows.card,
        ]}
      >
        <View style={styles.metadata}>
          <View style={styles.metaRow}>
            <Feather name="calendar" size={16} color={theme.textSecondary} />
            <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
              {formattedDate}
            </ThemedText>
          </View>
          <View style={styles.metaRow}>
            <Feather name="clock" size={16} color={theme.textSecondary} />
            <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
              {formattedTime}
            </ThemedText>
          </View>
          {encounter.location ? (
            <View style={styles.metaRow}>
              <Feather name="map-pin" size={16} color={theme.textSecondary} />
              <ThemedText style={[styles.metaText, { color: theme.textSecondary }]}>
                {encounter.location.label}
              </ThemedText>
            </View>
          ) : null}
        </View>

        {encounter.moods.length > 0 ? (
          <View style={styles.moods}>
            {encounter.moods.map((mood) => (
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

        {encounter.description ? (
          <View style={styles.descriptionContainer}>
            <ThemedText style={[styles.description, { color: theme.text }]}>
              {encounter.description}
            </ThemedText>
          </View>
        ) : null}

        {encounter.isPrivate ? (
          <View style={[styles.privacyBadge, { backgroundColor: theme.backgroundSecondary }]}>
            <Feather name="lock" size={12} color={theme.textSecondary} />
            <ThemedText style={[styles.privacyText, { color: theme.textSecondary }]}>
              Private encounter
            </ThemedText>
          </View>
        ) : null}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  notFoundText: {
    ...Typography.body,
  },
  heroContainer: {
    height: 320,
    position: "relative",
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  heroGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: Spacing.xl,
  },
  heroTitle: {
    ...Typography.hero,
    color: "#FFFFFF",
  },
  noImageHeader: {
    minHeight: 200,
    justifyContent: "flex-end",
  },
  noImageContent: {
    padding: Spacing.xl,
    paddingTop: Spacing["3xl"],
  },
  contentCard: {
    marginTop: -Spacing.xl,
    marginHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  metadata: {
    marginBottom: Spacing.lg,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  metaText: {
    ...Typography.caption,
  },
  moods: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  moodChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  moodText: {
    ...Typography.label,
  },
  descriptionContainer: {
    marginBottom: Spacing.xl,
  },
  description: {
    ...Typography.body,
    lineHeight: 26,
  },
  privacyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    alignSelf: "flex-start",
  },
  privacyText: {
    ...Typography.label,
  },
});
