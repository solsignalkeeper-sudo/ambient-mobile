import React, { useCallback } from "react";
import { FlatList, StyleSheet, View, RefreshControl } from "react-native";
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

export default function DiscoverScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const { data: encounters, isLoading, refetch, isRefetching } = useEncounters();

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

  const keyExtractor = useCallback((item: Encounter) => item.id, []);

  const renderEmpty = useCallback(() => {
    if (isLoading) {
      return (
        <View>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      );
    }
    return (
      <EmptyState
        type="discover"
        title="No encounters yet"
        message="Start capturing meaningful moments by tapping the + button below"
      />
    );
  }, [isLoading]);

  return (
    <FlatList
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: tabBarHeight + Spacing["3xl"],
        },
        (encounters?.length ?? 0) === 0 && !isLoading && styles.emptyContent,
      ]}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      data={encounters}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
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
  content: {
    paddingHorizontal: Spacing.lg,
    flexGrow: 1,
  },
  emptyContent: {
    justifyContent: "center",
  },
});
