import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, TextInput, Image, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useProfile, useUpdateProfile, useEncounters } from "@/lib/hooks";
import { Spacing, BorderRadius, Typography, Shadows } from "@/constants/theme";

const avatars = {
  1: require("../../assets/images/default-avatar-1.png"),
  2: require("../../assets/images/default-avatar-2.png"),
};

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const { data: profile, isLoading: profileLoading } = useProfile();
  const { data: encounters } = useEncounters();
  const updateProfile = useUpdateProfile();

  const [displayName, setDisplayName] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
    }
  }, [profile]);

  const handleSaveName = async () => {
    if (!displayName.trim()) {
      Alert.alert("Error", "Please enter a display name");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateProfile.mutateAsync({
      displayName: displayName.trim(),
      avatarType: profile?.avatarType ?? 1,
    });
    setIsEditing(false);
  };

  const handleToggleAvatar = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newType = profile?.avatarType === 1 ? 2 : 1;
    await updateProfile.mutateAsync({
      displayName: profile?.displayName ?? "Wanderer",
      avatarType: newType,
    });
  };

  const encounterCount = encounters?.length ?? 0;
  const moodCount = encounters?.reduce((acc, e) => acc + e.moods.length, 0) ?? 0;
  const locationCount = encounters?.filter((e) => e.location !== null).length ?? 0;

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing["3xl"],
        },
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <Animated.View entering={FadeIn.duration(300)} style={styles.profileSection}>
        <Pressable onPress={handleToggleAvatar} style={styles.avatarContainer}>
          <Image
            source={avatars[profile?.avatarType ?? 1]}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={[styles.avatarBadge, { backgroundColor: theme.primary }]}>
            <Feather name="refresh-cw" size={12} color="#FFFFFF" />
          </View>
        </Pressable>

        {isEditing ? (
          <View style={styles.editNameContainer}>
            <TextInput
              style={[
                styles.nameInput,
                {
                  backgroundColor: theme.backgroundDefault,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              value={displayName}
              onChangeText={setDisplayName}
              autoFocus
              selectTextOnFocus
              testID="input-display-name"
            />
            <View style={styles.editButtons}>
              <Pressable
                onPress={() => {
                  setDisplayName(profile?.displayName ?? "");
                  setIsEditing(false);
                }}
                style={[styles.editButton, { backgroundColor: theme.backgroundSecondary }]}
              >
                <ThemedText style={[styles.editButtonText, { color: theme.textSecondary }]}>
                  Cancel
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSaveName}
                style={[styles.editButton, { backgroundColor: theme.primary }]}
              >
                <ThemedText style={[styles.editButtonText, { color: "#FFFFFF" }]}>
                  Save
                </ThemedText>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable onPress={() => setIsEditing(true)} style={styles.nameContainer}>
            <ThemedText style={[styles.displayName, { color: theme.text }]}>
              {profile?.displayName ?? "Wanderer"}
            </ThemedText>
            <Feather name="edit-2" size={16} color={theme.textSecondary} />
          </Pressable>
        )}
      </Animated.View>

      <Animated.View
        entering={FadeInDown.delay(100).duration(300)}
        style={[styles.statsCard, { backgroundColor: theme.backgroundDefault }, Shadows.card]}
      >
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: theme.primary }]}>
            {encounterCount}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
            Encounters
          </ThemedText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: theme.accent }]}>
            {moodCount}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
            Moods
          </ThemedText>
        </View>
        <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
        <View style={styles.statItem}>
          <ThemedText style={[styles.statValue, { color: theme.success }]}>
            {locationCount}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
            Places
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(300)}>
        <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          About
        </ThemedText>
        <View
          style={[
            styles.aboutCard,
            { backgroundColor: theme.backgroundDefault },
            Shadows.card,
          ]}
        >
          <View style={styles.aboutRow}>
            <Feather name="info" size={20} color={theme.primary} />
            <View style={styles.aboutContent}>
              <ThemedText style={[styles.aboutTitle, { color: theme.text }]}>
                Ambient Encounters
              </ThemedText>
              <ThemedText style={[styles.aboutSubtitle, { color: theme.textSecondary }]}>
                Version 1.0.0
              </ThemedText>
            </View>
          </View>
          <View style={[styles.aboutDivider, { backgroundColor: theme.border }]} />
          <View style={styles.aboutRow}>
            <Feather name="heart" size={20} color={theme.accent} />
            <View style={styles.aboutContent}>
              <ThemedText style={[styles.aboutTitle, { color: theme.text }]}>
                Made with care
              </ThemedText>
              <ThemedText style={[styles.aboutSubtitle, { color: theme.textSecondary }]}>
                Capturing meaningful moments
              </ThemedText>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(300)}>
        <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Data
        </ThemedText>
        <View
          style={[
            styles.aboutCard,
            { backgroundColor: theme.backgroundDefault },
            Shadows.card,
          ]}
        >
          <View style={styles.aboutRow}>
            <Feather name="smartphone" size={20} color={theme.primary} />
            <View style={styles.aboutContent}>
              <ThemedText style={[styles.aboutTitle, { color: theme.text }]}>
                Stored locally
              </ThemedText>
              <ThemedText style={[styles.aboutSubtitle, { color: theme.textSecondary }]}>
                Your data stays on your device
              </ThemedText>
            </View>
          </View>
        </View>
      </Animated.View>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  profileSection: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  avatarContainer: {
    position: "relative",
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  displayName: {
    ...Typography.title,
  },
  editNameContainer: {
    width: "100%",
    alignItems: "center",
  },
  nameInput: {
    ...Typography.heading,
    textAlign: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    width: "80%",
    marginBottom: Spacing.md,
    fontFamily: "Manrope_600SemiBold",
  },
  editButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  editButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  editButtonText: {
    ...Typography.body,
    fontFamily: "Manrope_500Medium",
  },
  statsCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    marginBottom: Spacing["2xl"],
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    ...Typography.hero,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    ...Typography.caption,
  },
  statDivider: {
    width: 1,
    height: "100%",
  },
  sectionTitle: {
    ...Typography.label,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  aboutCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing["2xl"],
  },
  aboutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.lg,
  },
  aboutContent: {
    flex: 1,
  },
  aboutTitle: {
    ...Typography.body,
    fontFamily: "Manrope_500Medium",
  },
  aboutSubtitle: {
    ...Typography.caption,
  },
  aboutDivider: {
    height: 1,
    marginVertical: Spacing.lg,
  },
});
