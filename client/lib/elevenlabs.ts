import { Audio, AVPlaybackStatus } from "expo-av";
import { Platform } from "react-native";
import { VOICE_CHARACTERS } from "./types";
import type { AppSettings } from "./types";
import { getApiUrl } from "./query-client";
import { getRandomPhrase, MODE_PHRASES } from "./phrases";
import { getCustomPhrases } from "./storage";

let lastPhrase: string = "";

async function blobToBase64DataUri(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function personalizePhrase(phrase: string, userName: string): string {
  if (!userName || userName.trim() === "") {
    return phrase;
  }
  const name = userName.trim();
  const personalizations = [
    `${name}, ${phrase.charAt(0).toLowerCase()}${phrase.slice(1)}`,
    `Hey ${name}, ${phrase.charAt(0).toLowerCase()}${phrase.slice(1)}`,
    `${phrase.replace(/\.$/, "")}, ${name}.`,
    `${name}, ${phrase}`,
  ];
  return personalizations[Math.floor(Math.random() * personalizations.length)];
}

export async function generateAndPlayAffirmation(
  settings: AppSettings,
  duckBackgroundVolume?: (ducked: boolean) => void
): Promise<string> {
  let phrase: string;

  if (settings.useCustomPhrases) {
    const customPhrases = await getCustomPhrases();
    if (customPhrases.length > 0) {
      const filtered = customPhrases.filter((p) => p.text !== lastPhrase);
      const selected =
        filtered.length > 0
          ? filtered[Math.floor(Math.random() * filtered.length)]
          : customPhrases[Math.floor(Math.random() * customPhrases.length)];
      phrase = selected.text;
    } else {
      phrase = getRandomPhrase(settings.selectedVoice, settings.voiceMode, lastPhrase);
    }
  } else {
    phrase = getRandomPhrase(settings.selectedVoice, settings.voiceMode, lastPhrase);
  }

  lastPhrase = phrase;
  const personalizedPhrase = personalizePhrase(phrase, settings.userName);

  let voiceId = settings.selectedVoice;
  if (voiceId === "random") {
    const voices = VOICE_CHARACTERS.filter((v) => v.id !== "random");
    const randomVoice = voices[Math.floor(Math.random() * voices.length)];
    voiceId = randomVoice.id;
  }

  const voice = VOICE_CHARACTERS.find((v) => v.id === voiceId);
  if (!voice) return phrase;

  try {
    if (duckBackgroundVolume) {
      duckBackgroundVolume(true);
    }

    const apiUrl = getApiUrl();
    console.log("TTS endpoint:", new URL("/api/tts", apiUrl).toString());
    const response = await fetch(new URL("/api/tts", apiUrl).toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: personalizedPhrase,
        voiceId: voice.elevenLabsVoiceId,
        voiceSettings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

          if (!response.ok) {
        const text = await response.text().catch(() => "");
        console.warn("TTS API failed:", response.status, response.statusText, text);
        if (duckBackgroundVolume) duckBackgroundVolume(false);
        return phrase;
      }

    const audioBlob = await response.blob();
    let audioUri: string;
    let isObjectUrl = false;

    if (Platform.OS === "web") {
      audioUri = URL.createObjectURL(audioBlob);
      isObjectUrl = true;
    } else {
      audioUri = await blobToBase64DataUri(audioBlob);
    }

    const { sound } = await Audio.Sound.createAsync(
      { uri: audioUri },
      { volume: settings.voiceVolume, shouldPlay: true }
    );

    sound.setOnPlaybackStatusUpdate((status: AVPlaybackStatus) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync();
        if (isObjectUrl) {
          URL.revokeObjectURL(audioUri);
        }
        if (duckBackgroundVolume) {
          duckBackgroundVolume(false);
        }
      }
    });

    return personalizedPhrase;
  } catch (error) {
    console.error("Failed to generate affirmation:", error);
    if (duckBackgroundVolume) {
      duckBackgroundVolume(false);
    }
    return personalizedPhrase;
  }
}

export function getRandomAffirmation(voiceMode: AppSettings["voiceMode"]): string {
  const phrases = MODE_PHRASES[voiceMode];
  const filtered = phrases.filter((p) => p !== lastPhrase);
  const selected =
    filtered.length > 0
      ? filtered[Math.floor(Math.random() * filtered.length)]
      : phrases[Math.floor(Math.random() * phrases.length)];
  lastPhrase = selected;
  return selected;
}
