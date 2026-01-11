import AsyncStorage from "@react-native-async-storage/async-storage";
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
    return [];
  }
}

export async function saveCustomPhrases(phrases: CustomPhrase[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CUSTOM_PHRASES_KEY, JSON.stringify(phrases));
  } catch (error) {
    console.error("Failed to save custom phrases:", error);
    throw error;
  }
}

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
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
