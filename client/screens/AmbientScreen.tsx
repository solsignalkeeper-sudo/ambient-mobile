import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, StyleSheet, ScrollView, Pressable, Platform, Modal, TextInput } from "react-native";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { Audio, AVPlaybackStatus } from "expo-av";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import Slider from "@react-native-community/slider";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useSettings, useUpdateSettings } from "@/lib/hooks";
import { generateAndPlayAffirmation, getRandomAffirmation } from "@/lib/elevenlabs";
import { AMBIENT_SOUNDS, SOUND_CATEGORIES, getSoundById, getDefaultSound } from "@/lib/sounds";
import {
  VOICE_CHARACTERS,
  VOICE_MODES,
  FREQUENCY_OPTIONS,
  DEFAULT_SETTINGS,
} from "@/lib/types";
import type { AppSettings } from "@/lib/types";
import { Spacing, BorderRadius, Shadows, Typography } from "@/constants/theme";

const DUCK_VOLUME = 0.3;
const CROSSFADE_DURATION = 500;

export default function AmbientScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { data: savedSettings } = useSettings();
  const updateSettings = useUpdateSettings();

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [currentPhrase, setCurrentPhrase] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSoundPicker, setShowSoundPicker] = useState(false);

  const backgroundSoundRef = useRef<Audio.Sound | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isDuckedRef = useRef(false);
  const normalVolumeRef = useRef(0.5);

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (savedSettings) {
      setSettings(savedSettings);
      normalVolumeRef.current = savedSettings.backgroundVolume;
    }
  }, [savedSettings]);

  useEffect(() => {
    if (settings.isPlaying) {
      pulseScale.value = withRepeat(withTiming(1.05, { duration: 2000 }), -1, true);
    } else {
      pulseScale.value = withSpring(1);
    }
  }, [settings.isPlaying]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const fadeOutSound = async (sound: Audio.Sound, duration: number = CROSSFADE_DURATION) => {
    try {
      const status = await sound.getStatusAsync();
      if (!status.isLoaded) return;

      const startVolume = status.volume || 0.5;
      const steps = 10;
      const stepDuration = duration / steps;
      const volumeStep = startVolume / steps;

      for (let i = 0; i < steps; i++) {
        await new Promise((resolve) => setTimeout(resolve, stepDuration));
        const newVolume = Math.max(0, startVolume - volumeStep * (i + 1));
        try {
          await sound.setVolumeAsync(newVolume);
        } catch {}
      }

      await sound.stopAsync();
      await sound.unloadAsync();
    } catch (error) {
      console.log("Fade out error:", error);
    }
  };

  const playBackgroundSound = useCallback(async () => {
    try {
      setIsLoading(true);

      if (backgroundSoundRef.current) {
        const oldSound = backgroundSoundRef.current;
        backgroundSoundRef.current = null;
        fadeOutSound(oldSound);
      }

      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });

      const selectedSound = getSoundById(settings.selectedSound) || getDefaultSound();
      if (!selectedSound) {
        setIsLoading(false);
        return;
      }

      const { sound } = await Audio.Sound.createAsync(
        { uri: selectedSound.url },
        {
          isLooping: true,
          volume: 0,
          shouldPlay: true,
        }
      );

      backgroundSoundRef.current = sound;

      const targetVolume = isDuckedRef.current
        ? settings.backgroundVolume * DUCK_VOLUME
        : settings.backgroundVolume;
      const steps = 10;
      const stepDuration = CROSSFADE_DURATION / steps;
      const volumeStep = targetVolume / steps;

      for (let i = 0; i < steps; i++) {
        await new Promise((resolve) => setTimeout(resolve, stepDuration));
        const newVolume = Math.min(targetVolume, volumeStep * (i + 1));
        try {
          if (backgroundSoundRef.current) {
            await backgroundSoundRef.current.setVolumeAsync(newVolume);
          }
        } catch {}
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Failed to play background sound:", error);
      setIsLoading(false);
    }
  }, [settings.selectedSound, settings.backgroundVolume]);

  const stopBackgroundSound = useCallback(async () => {
    if (backgroundSoundRef.current) {
      await fadeOutSound(backgroundSoundRef.current);
      backgroundSoundRef.current = null;
    }
  }, []);

  const updateBackgroundVolume = useCallback(async (volume: number) => {
    normalVolumeRef.current = volume;
    if (backgroundSoundRef.current) {
      const targetVolume = isDuckedRef.current ? volume * DUCK_VOLUME : volume;
      try {
        await backgroundSoundRef.current.setVolumeAsync(targetVolume);
      } catch {}
    }
  }, []);

  const duckBackgroundVolume = useCallback((ducked: boolean) => {
    isDuckedRef.current = ducked;
    if (backgroundSoundRef.current) {
      const targetVolume = ducked
        ? normalVolumeRef.current * DUCK_VOLUME
        : normalVolumeRef.current;
      backgroundSoundRef.current.setVolumeAsync(targetVolume).catch(() => {});
    }
  }, []);

  const triggerEncouragement = useCallback(async () => {
    try {
      const phrase = await generateAndPlayAffirmation(settings, duckBackgroundVolume);
      setCurrentPhrase(phrase);
      setTimeout(() => setCurrentPhrase(""), 5000);
    } catch (error) {
      console.error("Failed to play encouragement:", error);
      const phrase = getRandomAffirmation(settings.voiceMode);
      setCurrentPhrase(phrase);
      setTimeout(() => setCurrentPhrase(""), 5000);
    }
  }, [settings, duckBackgroundVolume]);

  useEffect(() => {
    if (settings.isPlaying) {
      playBackgroundSound();
      timerRef.current = setInterval(() => {
        triggerEncouragement();
      }, settings.encouragementFrequency * 60 * 1000);
    } else {
      stopBackgroundSound();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [settings.isPlaying, settings.selectedSound, settings.encouragementFrequency]);

  useEffect(() => {
    updateBackgroundVolume(settings.backgroundVolume);
  }, [settings.backgroundVolume, updateBackgroundVolume]);

  useEffect(() => {
    return () => {
      if (backgroundSoundRef.current) {
        backgroundSoundRef.current.unloadAsync().catch(() => {});
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    updateSettings.mutate(newSettings);
  };

  const togglePlay = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    updateSetting("isPlaying", !settings.isPlaying);
  };

  const selectSound = (soundId: string) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    updateSetting("selectedSound", soundId);
    setShowSoundPicker(false);
  };

  const handleEncourageMe = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    triggerEncouragement();
  };

  const toggleTheme = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    const modes: Array<"light" | "dark" | "system"> = ["light", "dark", "system"];
    const currentIndex = modes.indexOf(settings.themeMode || "system");
    const nextIndex = (currentIndex + 1) % modes.length;
    updateSetting("themeMode", modes[nextIndex]);
  };

  const getThemeIcon = () => {
    const mode = settings.themeMode || "system";
    if (mode === "light") return "sun";
    if (mode === "dark") return "moon";
    return "monitor";
  };

  const selectedSound = getSoundById(settings.selectedSound) || getDefaultSound();
  const selectedVoice = VOICE_CHARACTERS.find((v) => v.id === settings.selectedVoice);
  const selectedMode = VOICE_MODES.find((m) => m.id === settings.voiceMode);

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing["2xl"] },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeIn.delay(50)} style={styles.topRow}>
          <View style={styles.nameSectionFlex}>
            <ThemedText style={[styles.nameLabel, { color: theme.textSecondary }]}>
              Your Name (for personalized encouragements)
            </ThemedText>
            <TextInput
              style={[
                styles.nameInput,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              placeholder="Enter your name..."
              placeholderTextColor={theme.textSecondary}
              value={settings.userName}
              onChangeText={(text) => updateSetting("userName", text)}
              testID="input-username"
            />
          </View>
          <Pressable
            onPress={toggleTheme}
            style={[styles.themeToggle, { backgroundColor: theme.backgroundSecondary }]}
            testID="button-theme-toggle"
          >
            <Feather name={getThemeIcon() as any} size={22} color={theme.primary} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
          <ThemedText style={[styles.title, { color: theme.text }]}>
            {selectedSound?.name || "Ambient"}
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            {selectedSound?.description}
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)} style={styles.statusBadge}>
          <View
            style={[
              styles.statusDot,
              { backgroundColor: settings.isPlaying ? theme.success : theme.textSecondary },
            ]}
          />
          <ThemedText style={[styles.statusText, { color: theme.textSecondary }]}>
            {selectedMode?.name} {settings.isPlaying ? (isLoading ? "Loading..." : "Playing") : "Paused"}
          </ThemedText>
        </Animated.View>

        {currentPhrase ? (
          <Animated.View
            entering={FadeIn}
            style={[styles.phraseCard, { backgroundColor: theme.primary + "20" }]}
          >
            <ThemedText style={[styles.phraseText, { color: theme.primary }]}>
              "{currentPhrase}"
            </ThemedText>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInUp.delay(300)} style={[styles.playButtonContainer]}>
          <Animated.View style={pulseStyle}>
            <Pressable
              onPress={togglePlay}
              style={({ pressed }) => [
                styles.playButton,
                { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
              ]}
              testID="button-play-pause"
            >
              <Feather
                name={settings.isPlaying ? "pause" : "play"}
                size={40}
                color="#FFFFFF"
                style={settings.isPlaying ? undefined : { marginLeft: 4 }}
              />
            </Pressable>
          </Animated.View>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(400)} style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Ambient Sound</ThemedText>
          <Pressable
            onPress={() => setShowSoundPicker(true)}
            style={[styles.soundSelector, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
            testID="button-sound-selector"
          >
            <View style={styles.soundSelectorContent}>
              <Feather name={selectedSound?.icon as any} size={24} color={theme.primary} />
              <View style={styles.soundSelectorText}>
                <ThemedText style={[styles.soundSelectorName, { color: theme.text }]}>
                  {selectedSound?.name}
                </ThemedText>
                <ThemedText style={[styles.soundSelectorDesc, { color: theme.textSecondary }]}>
                  {selectedSound?.description}
                </ThemedText>
              </View>
            </View>
            <Feather name="chevron-down" size={20} color={theme.textSecondary} />
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(500)}>
          <Pressable
            onPress={handleEncourageMe}
            style={({ pressed }) => [
              styles.encourageButton,
              { backgroundColor: theme.accent, opacity: pressed ? 0.9 : 1 },
            ]}
            testID="button-encourage-me"
          >
            <Feather name="heart" size={20} color="#FFFFFF" />
            <ThemedText style={styles.encourageText}>Encourage Me</ThemedText>
          </Pressable>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(600)} style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Volume</ThemedText>

          <View style={styles.volumeRow}>
            <ThemedText style={[styles.volumeLabel, { color: theme.textSecondary }]}>
              Background
            </ThemedText>
            <ThemedText style={[styles.volumeValue, { color: theme.text }]}>
              {Math.round(settings.backgroundVolume * 100)}%
            </ThemedText>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={settings.backgroundVolume}
            onValueChange={(v) => updateSetting("backgroundVolume", v)}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.backgroundTertiary}
            thumbTintColor={theme.primary}
          />

          <View style={styles.volumeRow}>
            <ThemedText style={[styles.volumeLabel, { color: theme.textSecondary }]}>Voice</ThemedText>
            <ThemedText style={[styles.volumeValue, { color: theme.text }]}>
              {Math.round(settings.voiceVolume * 100)}%
            </ThemedText>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={settings.voiceVolume}
            onValueChange={(v) => updateSetting("voiceVolume", v)}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.backgroundTertiary}
            thumbTintColor={theme.primary}
          />
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(700)} style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Voice Character</ThemedText>
          <ThemedText style={[styles.sectionHint, { color: theme.textSecondary }]}>
            Choose who speaks your encouragements
          </ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.voiceScroll}>
            {VOICE_CHARACTERS.map((voice) => (
              <Pressable
                key={voice.id}
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  updateSetting("selectedVoice", voice.id);
                }}
                style={({ pressed }) => [
                  styles.voiceCard,
                  {
                    backgroundColor:
                      settings.selectedVoice === voice.id
                        ? theme.primary + "20"
                        : theme.backgroundSecondary,
                    borderColor:
                      settings.selectedVoice === voice.id ? theme.primary : "transparent",
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                testID={`button-voice-${voice.id}`}
              >
                <ThemedText
                  style={[
                    styles.voiceName,
                    { color: settings.selectedVoice === voice.id ? theme.primary : theme.text },
                  ]}
                >
                  {voice.name}
                </ThemedText>
                <ThemedText style={[styles.voiceDesc, { color: theme.textSecondary }]}>
                  {voice.description}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(800)} style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Voice Mode</ThemedText>
          <View style={styles.modeRow}>
            {VOICE_MODES.map((mode) => (
              <Pressable
                key={mode.id}
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  updateSetting("voiceMode", mode.id as AppSettings["voiceMode"]);
                }}
                style={({ pressed }) => [
                  styles.modeChip,
                  {
                    backgroundColor:
                      settings.voiceMode === mode.id ? theme.primary : theme.backgroundSecondary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                testID={`button-mode-${mode.id}`}
              >
                <ThemedText
                  style={[
                    styles.modeText,
                    { color: settings.voiceMode === mode.id ? "#FFFFFF" : theme.text },
                  ]}
                >
                  {mode.name}
                </ThemedText>
              </Pressable>
            ))}
          </View>
          {selectedMode ? (
            <ThemedText style={[styles.modeDesc, { color: theme.textSecondary }]}>
              {selectedMode.description}
            </ThemedText>
          ) : null}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(900)} style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Frequency</ThemedText>
          <View style={styles.frequencyRow}>
            {FREQUENCY_OPTIONS.map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => {
                  if (Platform.OS !== "web") {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }
                  updateSetting("encouragementFrequency", opt.value);
                }}
                style={({ pressed }) => [
                  styles.frequencyChip,
                  {
                    backgroundColor:
                      settings.encouragementFrequency === opt.value
                        ? theme.primary
                        : theme.backgroundSecondary,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
                testID={`button-freq-${opt.value}`}
              >
                <ThemedText
                  style={[
                    styles.frequencyText,
                    {
                      color:
                        settings.encouragementFrequency === opt.value ? "#FFFFFF" : theme.text,
                    },
                  ]}
                >
                  {opt.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>

      <Modal
        visible={showSoundPicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSoundPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={[styles.modalTitle, { color: theme.text }]}>
                Choose Ambient Sound
              </ThemedText>
              <Pressable onPress={() => setShowSoundPicker(false)} testID="button-close-picker">
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>
            <ScrollView style={styles.modalScroll}>
              {SOUND_CATEGORIES.map((category) => (
                <View key={category} style={styles.categorySection}>
                  <ThemedText style={[styles.categoryTitle, { color: theme.textSecondary }]}>
                    {category}
                  </ThemedText>
                  {AMBIENT_SOUNDS.filter((s) => s.category === category).map((sound) => (
                    <Pressable
                      key={sound.id}
                      onPress={() => selectSound(sound.id)}
                      style={[
                        styles.soundOption,
                        {
                          backgroundColor:
                            settings.selectedSound === sound.id
                              ? theme.primary + "20"
                              : theme.backgroundSecondary,
                          borderColor:
                            settings.selectedSound === sound.id ? theme.primary : "transparent",
                        },
                      ]}
                      testID={`button-sound-${sound.id}`}
                    >
                      <Feather
                        name={sound.icon as any}
                        size={20}
                        color={settings.selectedSound === sound.id ? theme.primary : theme.textSecondary}
                      />
                      <View style={styles.soundOptionText}>
                        <ThemedText
                          style={[
                            styles.soundOptionName,
                            { color: settings.selectedSound === sound.id ? theme.primary : theme.text },
                          ]}
                        >
                          {sound.name}
                        </ThemedText>
                        <ThemedText style={[styles.soundOptionDesc, { color: theme.textSecondary }]}>
                          {sound.description}
                        </ThemedText>
                      </View>
                      {settings.selectedSound === sound.id ? (
                        <Feather name="check" size={20} color={theme.primary} />
                      ) : null}
                    </Pressable>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  nameSectionFlex: {
    flex: 1,
  },
  themeToggle: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  nameSection: {
    marginBottom: Spacing.xl,
  },
  nameLabel: {
    ...Typography.caption,
    marginBottom: Spacing.sm,
  },
  nameInput: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    ...Typography.body,
  },
  header: {
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.hero,
    textAlign: "center",
  },
  subtitle: {
    ...Typography.body,
    marginTop: Spacing.xs,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  statusText: {
    ...Typography.caption,
  },
  phraseCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  phraseText: {
    ...Typography.body,
    textAlign: "center",
    fontStyle: "italic",
  },
  playButtonContainer: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  playButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    ...Shadows.fab,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    ...Typography.heading,
    marginBottom: Spacing.sm,
  },
  sectionHint: {
    ...Typography.caption,
    marginBottom: Spacing.md,
  },
  soundSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  soundSelectorContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  soundSelectorText: {
    gap: 2,
  },
  soundSelectorName: {
    ...Typography.body,
    fontFamily: "Manrope_600SemiBold",
  },
  soundSelectorDesc: {
    ...Typography.caption,
  },
  encourageButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  encourageText: {
    ...Typography.body,
    color: "#FFFFFF",
    fontFamily: "Manrope_600SemiBold",
  },
  volumeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  volumeLabel: {
    ...Typography.body,
  },
  volumeValue: {
    ...Typography.body,
    fontFamily: "Manrope_600SemiBold",
  },
  slider: {
    width: "100%",
    height: 40,
    marginBottom: Spacing.md,
  },
  voiceScroll: {
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  voiceCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    marginRight: Spacing.sm,
    minWidth: 100,
    alignItems: "center",
  },
  voiceName: {
    ...Typography.body,
    fontFamily: "Manrope_600SemiBold",
  },
  voiceDesc: {
    ...Typography.caption,
    marginTop: Spacing.xs,
  },
  modeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  modeChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
  },
  modeText: {
    ...Typography.caption,
    fontFamily: "Manrope_600SemiBold",
  },
  modeDesc: {
    ...Typography.caption,
    marginTop: Spacing.sm,
  },
  frequencyRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  frequencyChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
  },
  frequencyText: {
    ...Typography.caption,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    maxHeight: "70%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalTitle: {
    ...Typography.heading,
  },
  modalScroll: {
    padding: Spacing.lg,
  },
  categorySection: {
    marginBottom: Spacing.xl,
  },
  categoryTitle: {
    ...Typography.caption,
    fontFamily: "Manrope_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  soundOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  soundOptionText: {
    flex: 1,
  },
  soundOptionName: {
    ...Typography.body,
    fontFamily: "Manrope_600SemiBold",
  },
  soundOptionDesc: {
    ...Typography.caption,
  },
});
