import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInUp, Layout } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import {
  useSettings,
  useUpdateSettings,
  useCustomPhrases,
  useAddCustomPhrase,
  useDeleteCustomPhrase,
  useImportPhrases,
} from "@/lib/hooks";
import { VOICE_CHARACTERS, DEFAULT_SETTINGS } from "@/lib/types";
import type { AppSettings, CustomPhrase } from "@/lib/types";
import { VOICE_PHRASE_GROUPS, MODE_PHRASES } from "@/lib/phrases";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";

type TabType = "voices" | "modes" | "custom";

export default function PhrasesScreen() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { data: savedSettings } = useSettings();
  const updateSettings = useUpdateSettings();
  const { data: customPhrases = [] } = useCustomPhrases();
  const addPhrase = useAddCustomPhrase();
  const deletePhrase = useDeleteCustomPhrase();
  const importPhrases = useImportPhrases();

  const settings = savedSettings || DEFAULT_SETTINGS;
  const [activeTab, setActiveTab] = useState<TabType>("voices");
  const [selectedVoice, setSelectedVoice] = useState(settings.selectedVoice);
  const [selectedMode, setSelectedMode] = useState<AppSettings["voiceMode"]>(settings.voiceMode);
  const [newPhrase, setNewPhrase] = useState("");
  const [importText, setImportText] = useState("");
  const [showImport, setShowImport] = useState(false);

  const voiceGroup = VOICE_PHRASE_GROUPS.find((g) => g.voiceId === selectedVoice);
  const modePhrases = MODE_PHRASES[selectedMode];

  const handleAddPhrase = () => {
    if (!newPhrase.trim()) return;
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    addPhrase.mutate(newPhrase.trim());
    setNewPhrase("");
  };

  const handleDeletePhrase = (phrase: CustomPhrase) => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    Alert.alert(
      "Delete Phrase",
      "Are you sure you want to remove this phrase?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deletePhrase.mutate(phrase.id),
        },
      ]
    );
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const lines = importText.split("\n").filter((l) => l.trim());
    importPhrases.mutate(lines, {
      onSuccess: (count) => {
        Alert.alert("Import Complete", `Added ${count} new phrases.`);
        setImportText("");
        setShowImport(false);
      },
    });
  };

  const toggleUseCustom = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    updateSettings.mutate({
      ...settings,
      useCustomPhrases: !settings.useCustomPhrases,
    });
  };

  const renderTabs = () => (
    <View style={styles.tabBar}>
      {[
        { id: "voices", label: "By Voice", icon: "user" },
        { id: "modes", label: "By Mode", icon: "sliders" },
        { id: "custom", label: "Custom", icon: "edit-3" },
      ].map((tab) => (
        <Pressable
          key={tab.id}
          onPress={() => {
            if (Platform.OS !== "web") {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
            setActiveTab(tab.id as TabType);
          }}
          style={[
            styles.tab,
            {
              backgroundColor: activeTab === tab.id ? theme.primary : theme.backgroundSecondary,
            },
          ]}
          testID={`tab-${tab.id}`}
        >
          <Feather
            name={tab.icon as any}
            size={16}
            color={activeTab === tab.id ? "#FFFFFF" : theme.textSecondary}
          />
          <ThemedText
            style={[
              styles.tabText,
              { color: activeTab === tab.id ? "#FFFFFF" : theme.text },
            ]}
          >
            {tab.label}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );

  const renderVoicesTab = () => (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.voiceScroll}
        contentContainerStyle={styles.voiceScrollContent}
      >
        {VOICE_CHARACTERS.filter((v) => v.id !== "random").map((voice) => (
          <Pressable
            key={voice.id}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setSelectedVoice(voice.id);
            }}
            style={[
              styles.voiceChip,
              {
                backgroundColor: selectedVoice === voice.id ? theme.primary : theme.backgroundSecondary,
                borderColor: selectedVoice === voice.id ? theme.primary : theme.border,
              },
            ]}
            testID={`voice-chip-${voice.id}`}
          >
            <ThemedText
              style={[
                styles.voiceChipText,
                { color: selectedVoice === voice.id ? "#FFFFFF" : theme.text },
              ]}
            >
              {voice.name}
            </ThemedText>
            <ThemedText
              style={[
                styles.voiceChipDesc,
                { color: selectedVoice === voice.id ? "#FFFFFF99" : theme.textSecondary },
              ]}
            >
              {voice.persona}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {voiceGroup ? (
        <View style={[styles.personaCard, { backgroundColor: theme.backgroundSecondary }]}>
          <ThemedText style={[styles.personaName, { color: theme.primary }]}>
            {voiceGroup.persona}
          </ThemedText>
          <ThemedText style={[styles.personaDesc, { color: theme.textSecondary }]}>
            {voiceGroup.personaDescription}
          </ThemedText>
        </View>
      ) : null}

      <ThemedText style={[styles.phraseCount, { color: theme.textSecondary }]}>
        {voiceGroup?.phrases.length || 0} phrases
      </ThemedText>

      <View style={styles.phrasesList}>
        {voiceGroup?.phrases.slice(0, 10).map((phrase, index) => (
          <Animated.View
            key={`${selectedVoice}-${index}`}
            entering={FadeInUp.delay(index * 30)}
            style={[styles.phraseCard, { backgroundColor: theme.backgroundSecondary }]}
          >
            <ThemedText style={[styles.phraseText, { color: theme.text }]}>
              "{phrase}"
            </ThemedText>
          </Animated.View>
        ))}
        {(voiceGroup?.phrases.length || 0) > 10 ? (
          <View style={[styles.moreCard, { borderColor: theme.border }]}>
            <ThemedText style={[styles.moreText, { color: theme.textSecondary }]}>
              +{(voiceGroup?.phrases.length || 0) - 10} more phrases...
            </ThemedText>
          </View>
        ) : null}
      </View>
    </>
  );

  const renderModesTab = () => (
    <>
      <View style={styles.modeSelector}>
        {(["gentle", "motivating", "calm"] as const).map((mode) => (
          <Pressable
            key={mode}
            onPress={() => {
              if (Platform.OS !== "web") {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              setSelectedMode(mode);
            }}
            style={[
              styles.modeChip,
              {
                backgroundColor: selectedMode === mode ? theme.primary : theme.backgroundSecondary,
              },
            ]}
            testID={`mode-chip-${mode}`}
          >
            <ThemedText
              style={[
                styles.modeText,
                { color: selectedMode === mode ? "#FFFFFF" : theme.text },
              ]}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <ThemedText style={[styles.phraseCount, { color: theme.textSecondary }]}>
        {modePhrases.length} phrases
      </ThemedText>

      <View style={styles.phrasesList}>
        {modePhrases.slice(0, 10).map((phrase, index) => (
          <Animated.View
            key={`${selectedMode}-${index}`}
            entering={FadeInUp.delay(index * 30)}
            style={[styles.phraseCard, { backgroundColor: theme.backgroundSecondary }]}
          >
            <ThemedText style={[styles.phraseText, { color: theme.text }]}>
              "{phrase}"
            </ThemedText>
          </Animated.View>
        ))}
        {modePhrases.length > 10 ? (
          <View style={[styles.moreCard, { borderColor: theme.border }]}>
            <ThemedText style={[styles.moreText, { color: theme.textSecondary }]}>
              +{modePhrases.length - 10} more phrases...
            </ThemedText>
          </View>
        ) : null}
      </View>
    </>
  );

  const renderCustomTab = () => (
    <>
      <View style={[styles.customToggle, { backgroundColor: theme.backgroundSecondary }]}>
        <View style={styles.toggleInfo}>
          <ThemedText style={[styles.toggleLabel, { color: theme.text }]}>
            Use Custom Phrases
          </ThemedText>
          <ThemedText style={[styles.toggleDesc, { color: theme.textSecondary }]}>
            When enabled, only your custom phrases will be used
          </ThemedText>
        </View>
        <Pressable
          onPress={toggleUseCustom}
          style={[
            styles.toggleButton,
            {
              backgroundColor: settings.useCustomPhrases ? theme.primary : theme.backgroundTertiary,
            },
          ]}
          testID="toggle-custom-phrases"
        >
          <View
            style={[
              styles.toggleKnob,
              {
                transform: [{ translateX: settings.useCustomPhrases ? 20 : 0 }],
              },
            ]}
          />
        </Pressable>
      </View>

      <View style={styles.addSection}>
        <TextInput
          style={[
            styles.addInput,
            {
              backgroundColor: theme.backgroundSecondary,
              color: theme.text,
              borderColor: theme.border,
            },
          ]}
          placeholder="Add a new phrase..."
          placeholderTextColor={theme.textSecondary}
          value={newPhrase}
          onChangeText={setNewPhrase}
          onSubmitEditing={handleAddPhrase}
          returnKeyType="done"
          testID="input-new-phrase"
        />
        <Pressable
          onPress={handleAddPhrase}
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          testID="button-add-phrase"
        >
          <Feather name="plus" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <Pressable
        onPress={() => setShowImport(!showImport)}
        style={[styles.importToggle, { borderColor: theme.border }]}
        testID="button-toggle-import"
      >
        <Feather name="upload" size={18} color={theme.primary} />
        <ThemedText style={[styles.importToggleText, { color: theme.primary }]}>
          Import Multiple Phrases
        </ThemedText>
        <Feather
          name={showImport ? "chevron-up" : "chevron-down"}
          size={18}
          color={theme.primary}
        />
      </Pressable>

      {showImport ? (
        <View style={styles.importSection}>
          <TextInput
            style={[
              styles.importInput,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="Paste phrases here, one per line..."
            placeholderTextColor={theme.textSecondary}
            value={importText}
            onChangeText={setImportText}
            multiline
            numberOfLines={5}
            testID="input-import-phrases"
          />
          <Pressable
            onPress={handleImport}
            style={[styles.importButton, { backgroundColor: theme.primary }]}
            testID="button-import-phrases"
          >
            <Feather name="check" size={18} color="#FFFFFF" />
            <ThemedText style={styles.importButtonText}>Import</ThemedText>
          </Pressable>
        </View>
      ) : null}

      <ThemedText style={[styles.phraseCount, { color: theme.textSecondary }]}>
        {customPhrases.length} custom phrase{customPhrases.length !== 1 ? "s" : ""}
      </ThemedText>

      {customPhrases.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.backgroundSecondary }]}>
          <Feather name="edit-3" size={32} color={theme.textSecondary} />
          <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
            No custom phrases yet
          </ThemedText>
          <ThemedText style={[styles.emptyHint, { color: theme.textSecondary }]}>
            Add your own encouragement phrases above
          </ThemedText>
        </View>
      ) : (
        <View style={styles.phrasesList}>
          {customPhrases.map((phrase, index) => (
            <Animated.View
              key={phrase.id}
              entering={FadeInUp.delay(index * 30)}
              layout={Layout.springify()}
              style={[styles.phraseCard, { backgroundColor: theme.backgroundSecondary }]}
            >
              <View style={styles.phraseContent}>
                <ThemedText style={[styles.phraseText, { color: theme.text }]}>
                  "{phrase.text}"
                </ThemedText>
                <Pressable
                  onPress={() => handleDeletePhrase(phrase)}
                  style={styles.deleteButton}
                  testID={`button-delete-phrase-${phrase.id}`}
                >
                  <Feather name="trash-2" size={16} color={theme.accent} />
                </Pressable>
              </View>
            </Animated.View>
          ))}
        </View>
      )}
    </>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.xl, paddingBottom: insets.bottom + Spacing["2xl"] },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeIn.delay(100)} style={styles.header}>
          <ThemedText style={[styles.title, { color: theme.text }]}>Phrases</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Browse and manage encouragement phrases
          </ThemedText>
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(200)}>
          {renderTabs()}
        </Animated.View>

        <Animated.View entering={FadeInUp.delay(300)}>
          {activeTab === "voices" && renderVoicesTab()}
          {activeTab === "modes" && renderModesTab()}
          {activeTab === "custom" && renderCustomTab()}
        </Animated.View>
      </ScrollView>
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
  header: {
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    ...Typography.hero,
    textAlign: "center",
  },
  subtitle: {
    ...Typography.body,
    marginTop: Spacing.xs,
  },
  tabBar: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  tabText: {
    ...Typography.caption,
    fontFamily: "Manrope_600SemiBold",
  },
  voiceScroll: {
    marginHorizontal: -Spacing.lg,
    marginBottom: Spacing.lg,
  },
  voiceScrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  voiceChip: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minWidth: 120,
  },
  voiceChipText: {
    ...Typography.body,
    fontFamily: "Manrope_600SemiBold",
  },
  voiceChipDesc: {
    ...Typography.caption,
    marginTop: 2,
  },
  personaCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  personaName: {
    ...Typography.heading,
    marginBottom: Spacing.xs,
  },
  personaDesc: {
    ...Typography.body,
  },
  modeSelector: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
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
  phraseCount: {
    ...Typography.caption,
    marginBottom: Spacing.md,
  },
  phrasesList: {
    gap: Spacing.md,
  },
  phraseCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
  },
  phraseContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  phraseText: {
    ...Typography.body,
    flex: 1,
    fontStyle: "italic",
    marginRight: Spacing.md,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  moreCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
  },
  moreText: {
    ...Typography.caption,
  },
  customToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  toggleInfo: {
    flex: 1,
  },
  toggleLabel: {
    ...Typography.body,
    fontFamily: "Manrope_600SemiBold",
  },
  toggleDesc: {
    ...Typography.caption,
    marginTop: 2,
  },
  toggleButton: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 3,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },
  addSection: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  addInput: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
    ...Typography.body,
    borderWidth: 1,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  importToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    marginBottom: Spacing.lg,
  },
  importToggleText: {
    ...Typography.body,
  },
  importSection: {
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  importInput: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    ...Typography.body,
    borderWidth: 1,
    minHeight: 120,
    textAlignVertical: "top",
  },
  importButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  importButtonText: {
    ...Typography.body,
    color: "#FFFFFF",
    fontFamily: "Manrope_600SemiBold",
  },
  emptyState: {
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.md,
    alignItems: "center",
    gap: Spacing.md,
  },
  emptyText: {
    ...Typography.body,
    fontFamily: "Manrope_600SemiBold",
  },
  emptyHint: {
    ...Typography.caption,
    textAlign: "center",
  },
});
