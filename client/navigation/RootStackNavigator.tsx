import React, { useState, useRef } from "react";
import { View, StyleSheet, Pressable, Dimensions, Platform, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

import AmbientScreen from "@/screens/AmbientScreen";
import PhrasesScreen from "@/screens/PhrasesScreen";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, Typography } from "@/constants/theme";

const { width } = Dimensions.get("window");

export type RootStackParamList = {
  Main: undefined;
};

const TABS = [
  { key: "player", label: "Player", icon: "play-circle" as const },
  { key: "phrases", label: "Phrases", icon: "message-circle" as const },
];

export default function RootStackNavigator() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState(0);
  
  const translateX = useSharedValue(0);
  const contextX = useSharedValue(0);

  const setActiveTabWithHaptics = (index: number) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setActiveTab(index);
  };

  const handleTabPress = (index: number) => {
    setActiveTabWithHaptics(index);
    translateX.value = withSpring(-index * width, {
      damping: 20,
      stiffness: 200,
    });
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      contextX.value = translateX.value;
    })
    .onUpdate((event) => {
      const newX = contextX.value + event.translationX;
      translateX.value = Math.max(Math.min(newX, 0), -(TABS.length - 1) * width);
    })
    .onEnd((event) => {
      const velocity = event.velocityX;
      const currentPosition = translateX.value;
      
      let targetIndex = activeTab;
      
      if (Math.abs(velocity) > 500) {
        if (velocity > 0 && activeTab > 0) {
          targetIndex = activeTab - 1;
        } else if (velocity < 0 && activeTab < TABS.length - 1) {
          targetIndex = activeTab + 1;
        }
      } else {
        targetIndex = Math.round(-currentPosition / width);
        targetIndex = Math.max(0, Math.min(targetIndex, TABS.length - 1));
      }
      
      translateX.value = withSpring(-targetIndex * width, {
        damping: 20,
        stiffness: 200,
      });
      
      if (targetIndex !== activeTab) {
        runOnJS(setActiveTabWithHaptics)(targetIndex);
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={[styles.pagesContainer, animatedStyle]}>
          <View style={[styles.page, { width }]}>
            <AmbientScreen />
          </View>
          <View style={[styles.page, { width }]}>
            <PhrasesScreen />
          </View>
        </Animated.View>
      </GestureDetector>

      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: theme.backgroundDefault,
            paddingBottom: insets.bottom > 0 ? insets.bottom : Spacing.md,
            borderTopColor: theme.border,
          },
        ]}
      >
        {TABS.map((tab, index) => {
          const isActive = activeTab === index;
          return (
            <Pressable
              key={tab.key}
              onPress={() => handleTabPress(index)}
              style={({ pressed }) => [
                styles.tabItem,
                { opacity: pressed ? 0.7 : 1 },
              ]}
              testID={`tab-${tab.key}`}
            >
              <Feather
                name={tab.icon}
                size={24}
                color={isActive ? theme.primary : theme.textSecondary}
              />
              <ThemedText
                style={[
                  styles.tabLabel,
                  { color: isActive ? theme.primary : theme.textSecondary },
                ]}
              >
                {tab.label}
              </ThemedText>
              {isActive ? (
                <View style={[styles.activeIndicator, { backgroundColor: theme.primary }]} />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.pageIndicator, { bottom: insets.bottom + 70 }]}>
        {TABS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: activeTab === index ? theme.primary : theme.backgroundTertiary,
              },
            ]}
          />
        ))}
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  pagesContainer: {
    flex: 1,
    flexDirection: "row",
    width: width * TABS.length,
  },
  page: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingTop: Spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
  },
  tabLabel: {
    ...Typography.label,
    marginTop: Spacing.xs,
  },
  activeIndicator: {
    position: "absolute",
    top: -Spacing.sm,
    width: 24,
    height: 3,
    borderRadius: 2,
  },
  pageIndicator: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
