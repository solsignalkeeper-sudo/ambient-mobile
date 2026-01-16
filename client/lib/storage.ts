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

function coerceCustomPhrases(raw: any): CustomPhrase[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((p) => {
      const text = typeof p?.text === "string" ? p.text : "";
      const createdAt = typeof p?.createdAt === "number" ? p.createdAt : Date.now();
      const id = typeof p?.id === "string" && p.id.trim() ? p.id : generateId();
      return { id, text, createdAt } as CustomPhrase;
    })
    .filter((p) => p.text.trim().length > 0);
}

export async function getCustomPhrases(): Promise<CustomPhrase[]> {
  try {
    const data = await AsyncStorage.getItem(CUSTOM_PHRASES_KEY);
    if (!data) return [];

    const parsed = JSON.parse(data);
    const coerced = coerceCustomPhrases(parsed);

    // If we had to repair/migrate anything (missing ids, bad shapes), persist it.
    // Compare lengths and also whether any item is missing an id in the original.
    const originalHadIssues =
      !Array.isArray(parsed) || parsed.some((p: any) => typeof p?.id !== "string" || !p.id);

    if (originalHadIssues) {
      await AsyncStorage.setItem(CUSTOM_PHRASES_KEY, JSON.stringify(coerced));
    }

    return coerced;
  } catch (error) {
    console.error("Failed to load custom phrases:", error);
    return [];
  }
}

export async function saveCustomPhrases(phrases: CustomPhrase[]): Promise<void> {
  try {
    // Also normalize before saving (never store broken shapes)
    const normalized = coerceCustomPhrases(phrases);
    await AsyncStorage.setItem(CUSTOM_PHRASES_KEY, JSON.stringify(normalized));
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
  const updated = phrases.map((p) => (p.id === id ? { ...p, text: newText.trim() } : p));
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
