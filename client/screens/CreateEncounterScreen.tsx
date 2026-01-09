import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, TextInput, ScrollView, Alert, Platform } from "react-native";
import { Image } from "expo-image";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";

import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { MoodChip } from "@/components/MoodChip";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useCreateEncounter } from "@/lib/hooks";
import { generateId } from "@/lib/storage";
import { MOOD_OPTIONS } from "@/lib/types";
import { Spacing, BorderRadius, Typography, Shadows } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

export default function CreateEncounterScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
    label: string;
  } | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const createEncounter = useCreateEncounter();

  useEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <ThemedText style={[styles.headerButton, { color: theme.textSecondary }]}>
            Cancel
          </ThemedText>
        </Pressable>
      ),
      headerRight: () => (
        <Pressable
          onPress={handleSave}
          disabled={!title.trim() || createEncounter.isPending}
          hitSlop={8}
        >
          <ThemedText
            style={[
              styles.headerButton,
              styles.headerButtonSave,
              { color: !title.trim() ? theme.textSecondary : theme.primary },
            ]}
          >
            {createEncounter.isPending ? "Saving..." : "Save"}
          </ThemedText>
        </Pressable>
      ),
    });
  }, [title, createEncounter.isPending, theme]);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Camera Permission", "Please enable camera access to take photos");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleAddLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location Permission", "Please enable location access to tag your encounter");
        setIsLoadingLocation(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [reverseGeocode] = await Location.reverseGeocodeAsync({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });

      const label = reverseGeocode
        ? [reverseGeocode.city, reverseGeocode.region].filter(Boolean).join(", ") ||
          "Unknown location"
        : "Unknown location";

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        label,
      });
    } catch (error) {
      Alert.alert("Error", "Failed to get location. Please try again.");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const toggleMood = (mood: string) => {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood]
    );
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      await createEncounter.mutateAsync({
        id: generateId(),
        title: title.trim(),
        description: description.trim(),
        photoUri,
        location,
        moods: selectedMoods,
        isPrivate,
        createdAt: new Date().toISOString(),
      });

      navigation.goBack();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Error", "Failed to save encounter. Please try again.");
    }
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + Spacing["2xl"] },
      ]}
    >
      <Animated.View entering={FadeIn.duration(300)}>
        <Pressable
          onPress={handlePickImage}
          style={[
            styles.photoContainer,
            { backgroundColor: theme.backgroundSecondary },
          ]}
          testID="button-add-photo"
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} contentFit="cover" />
          ) : (
            <View style={styles.photoPlaceholder}>
              <View style={styles.photoButtons}>
                <Pressable
                  onPress={handleTakePhoto}
                  style={[styles.photoButton, { backgroundColor: theme.primary }]}
                >
                  <Feather name="camera" size={20} color="#FFFFFF" />
                </Pressable>
                <Pressable
                  onPress={handlePickImage}
                  style={[styles.photoButton, { backgroundColor: theme.secondary }]}
                >
                  <Feather name="image" size={20} color={theme.primary} />
                </Pressable>
              </View>
              <ThemedText style={[styles.photoText, { color: theme.textSecondary }]}>
                Add a photo
              </ThemedText>
            </View>
          )}
        </Pressable>

        <View style={styles.inputGroup}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
            Title
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="What did you encounter?"
            placeholderTextColor={theme.textSecondary}
            value={title}
            onChangeText={setTitle}
            testID="input-title"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
            Description
          </ThemedText>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: theme.backgroundDefault,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="Describe the moment..."
            placeholderTextColor={theme.textSecondary}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            testID="input-description"
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
            Location
          </ThemedText>
          {location ? (
            <View
              style={[
                styles.locationCard,
                { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
              ]}
            >
              <Feather name="map-pin" size={18} color={theme.primary} />
              <ThemedText style={[styles.locationText, { color: theme.text }]}>
                {location.label}
              </ThemedText>
              <Pressable onPress={() => setLocation(null)} hitSlop={8}>
                <Feather name="x" size={18} color={theme.textSecondary} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={handleAddLocation}
              disabled={isLoadingLocation}
              style={[
                styles.addLocationButton,
                { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
              ]}
              testID="button-add-location"
            >
              <Feather
                name={isLoadingLocation ? "loader" : "map-pin"}
                size={18}
                color={theme.textSecondary}
              />
              <ThemedText style={[styles.addLocationText, { color: theme.textSecondary }]}>
                {isLoadingLocation ? "Getting location..." : "Add current location"}
              </ThemedText>
            </Pressable>
          )}
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
            Mood
          </ThemedText>
          <View style={styles.moodContainer}>
            {MOOD_OPTIONS.map((mood) => (
              <MoodChip
                key={mood}
                mood={mood}
                selected={selectedMoods.includes(mood)}
                onPress={() => toggleMood(mood)}
              />
            ))}
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsPrivate(!isPrivate);
            }}
            style={[
              styles.privacyToggle,
              { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
            ]}
            testID="toggle-privacy"
          >
            <View style={styles.privacyInfo}>
              <Feather
                name={isPrivate ? "lock" : "unlock"}
                size={18}
                color={theme.primary}
              />
              <View style={styles.privacyTextContainer}>
                <ThemedText style={[styles.privacyTitle, { color: theme.text }]}>
                  {isPrivate ? "Private" : "Public"}
                </ThemedText>
                <ThemedText style={[styles.privacySubtitle, { color: theme.textSecondary }]}>
                  {isPrivate
                    ? "Only you can see this encounter"
                    : "Visible in your journal"}
                </ThemedText>
              </View>
            </View>
            <View
              style={[
                styles.toggle,
                { backgroundColor: isPrivate ? theme.primary : theme.backgroundSecondary },
              ]}
            >
              <View
                style={[
                  styles.toggleKnob,
                  { transform: [{ translateX: isPrivate ? 20 : 2 }] },
                ]}
              />
            </View>
          </Pressable>
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
    padding: Spacing.lg,
  },
  photoContainer: {
    height: 180,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    marginBottom: Spacing.xl,
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  photoPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  photoButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  photoButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  photoText: {
    ...Typography.caption,
  },
  inputGroup: {
    marginBottom: Spacing.xl,
  },
  label: {
    ...Typography.label,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  input: {
    ...Typography.body,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontFamily: "Manrope_400Regular",
  },
  textArea: {
    minHeight: 100,
    paddingTop: Spacing.lg,
  },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.md,
  },
  locationText: {
    ...Typography.body,
    flex: 1,
  },
  addLocationButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: Spacing.md,
  },
  addLocationText: {
    ...Typography.body,
  },
  moodContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  privacyToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  privacyInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  privacyTextContainer: {
    flex: 1,
  },
  privacyTitle: {
    ...Typography.body,
    fontFamily: "Manrope_500Medium",
  },
  privacySubtitle: {
    ...Typography.caption,
  },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
  },
  headerButton: {
    ...Typography.body,
    fontFamily: "Manrope_500Medium",
  },
  headerButtonSave: {
    fontFamily: "Manrope_600SemiBold",
  },
});
