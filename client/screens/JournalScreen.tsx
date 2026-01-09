import React, { useCallback, useMemo } from "react";
import { SectionList, StyleSheet, View, RefreshControl } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

import { EncounterCard } from "@/components/EncounterCard";
import { EmptyState } from "@/components/EmptyState";
import { SkeletonCard } from "@/components/SkeletonCard";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useEncounters } from "@/lib/hooks";
import { Spacing, Typography } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Encounter } from "@/lib/types";

interface Section {
  title: string;
  data: Encounter[];
}

export default function JournalScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const { data: encounters, isLoading, refetch, isRefetching } = useEncounters();

  const sections = useMemo(() => {
    if (!encounters || encounters.length === 0) return [];

    const grouped: Record<string, Encounter[]> = {};
    encounters.forEach((encounter) => {
      const date = new Date(encounter.createdAt);
      const key = date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(encounter);
    });

    return Object.entries(grouped).map(([title, data]) => ({ title, data }));
  }, [encounters]);

  const handleEncounterPress = useCallback((encounter: Encounter) => {
    navigation.navigate("EncounterDetail", { id: encounter.id });
  }, [navigation]);

  const renderItem = useCallback(
    ({ item, index }: { item: Encounter; index: number }) => (
      <EncounterCard
        encounter={item}
        onPress={() => handleEncounterPress(item)}
        index={index}
      />
    ),
    [handleEncounterPress]
  );

  const renderSectionHeader = useCallback(
    ({ section }: { section: Section }) => (
      <View style={styles.sectionHeader}>
        <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          {section.title}
        </ThemedText>
      </View>
    ),
    [theme]
  );

  const keyExtractor = useCallback((item: Encounter) => item.id, []);

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: theme.backgroundRoot },
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingHorizontal: Spacing.lg,
          },
        ]}
      >
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </View>
    );
  }

  if (!encounters || encounters.length === 0) {
    return (
      <View
        style={[
          styles.container,
          styles.emptyContainer,
          { backgroundColor: theme.backgroundRoot },
          {
            paddingTop: headerHeight,
            paddingBottom: tabBarHeight,
          },
        ]}
      >
        <EmptyState
          type="journal"
          title="Your journal is empty"
          message="Record your first encounter to start building your personal timeline"
        />
      </View>
    );
  }

  return (
    <SectionList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing["3xl"],
        },
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      sections={sections}
      renderItem={renderItem}
      renderSectionHeader={renderSectionHeader}
      keyExtractor={keyExtractor}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={theme.primary}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  emptyContainer: {
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.label,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
