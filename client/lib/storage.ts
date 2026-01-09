import AsyncStorage from "@react-native-async-storage/async-storage";
<<<<<<< HEAD
import type { AppSettings, CustomPhrase } from "./types";
import { DEFAULT_SETTINGS } from "./types";

const SETTINGS_KEY = "@ambient_settings";
const CUSTOM_PHRASES_KEY = "@ambient_custom_phrases";

export async function getSettings(): Promise<AppSettings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!data) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (error) {
    console.error("Failed to load settings:", error);
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings:", error);
    throw error;
  }
}

export async function getCustomPhrases(): Promise<CustomPhrase[]> {
  try {
    const data = await AsyncStorage.getItem(CUSTOM_PHRASES_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load custom phrases:", error);
=======
import type { Encounter, UserProfile } from "./types";

const ENCOUNTERS_KEY = "@ambient_encounters";
const PROFILE_KEY = "@ambient_profile";

export async function getEncounters(): Promise<Encounter[]> {
  try {
    const data = await AsyncStorage.getItem(ENCOUNTERS_KEY);
    if (!data) return [];
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load encounters:", error);
>>>>>>> 8dbaa34 (Update app configuration and navigation for mobile platforms)
    return [];
  }
}

<<<<<<< HEAD
export async function saveCustomPhrases(phrases: CustomPhrase[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CUSTOM_PHRASES_KEY, JSON.stringify(phrases));
  } catch (error) {
    console.error("Failed to save custom phrases:", error);
=======
export async function saveEncounter(encounter: Encounter): Promise<void> {
  try {
    const encounters = await getEncounters();
    encounters.unshift(encounter);
    await AsyncStorage.setItem(ENCOUNTERS_KEY, JSON.stringify(encounters));
  } catch (error) {
    console.error("Failed to save encounter:", error);
>>>>>>> 8dbaa34 (Update app configuration and navigation for mobile platforms)
    throw error;
  }
}

<<<<<<< HEAD
export async function addCustomPhrase(text: string): Promise<CustomPhrase> {
  const phrases = await getCustomPhrases();
  const newPhrase: CustomPhrase = {
    id: generateId(),
    text: text.trim(),
    createdAt: Date.now(),
  };
  phrases.push(newPhrase);
  await saveCustomPhrases(phrases);
  return newPhrase;
}

export async function deleteCustomPhrase(id: string): Promise<void> {
  const phrases = await getCustomPhrases();
  const filtered = phrases.filter((p) => p.id !== id);
  await saveCustomPhrases(filtered);
}

export async function updateCustomPhrase(id: string, newText: string): Promise<void> {
  const phrases = await getCustomPhrases();
  const updated = phrases.map((p) =>
    p.id === id ? { ...p, text: newText.trim() } : p
  );
  await saveCustomPhrases(updated);
}

export async function importPhrases(lines: string[]): Promise<number> {
  const phrases = await getCustomPhrases();
  const existingTexts = new Set(phrases.map((p) => p.text.toLowerCase()));
  
  let addedCount = 0;
  for (const line of lines) {
    const text = line.trim();
    if (text && text.length > 3 && !existingTexts.has(text.toLowerCase())) {
      phrases.push({
        id: generateId(),
        text,
        createdAt: Date.now(),
      });
      existingTexts.add(text.toLowerCase());
      addedCount++;
    }
  }
  
  await saveCustomPhrases(phrases);
  return addedCount;
=======
export async function updateEncounter(encounter: Encounter): Promise<void> {
  try {
    const encounters = await getEncounters();
    const index = encounters.findIndex((e) => e.id === encounter.id);
    if (index !== -1) {
      encounters[index] = encounter;
      await AsyncStorage.setItem(ENCOUNTERS_KEY, JSON.stringify(encounters));
    }
  } catch (error) {
    console.error("Failed to update encounter:", error);
    throw error;
  }
}

export async function deleteEncounter(id: string): Promise<void> {
  try {
    const encounters = await getEncounters();
    const filtered = encounters.filter((e) => e.id !== id);
    await AsyncStorage.setItem(ENCOUNTERS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Failed to delete encounter:", error);
    throw error;
  }
}

export async function getProfile(): Promise<UserProfile> {
  try {
    const data = await AsyncStorage.getItem(PROFILE_KEY);
    if (!data) {
      return { displayName: "Wanderer", avatarType: 1 };
    }
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to load profile:", error);
    return { displayName: "Wanderer", avatarType: 1 };
  }
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.error("Failed to save profile:", error);
    throw error;
  }
>>>>>>> 8dbaa34 (Update app configuration and navigation for mobile platforms)
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
