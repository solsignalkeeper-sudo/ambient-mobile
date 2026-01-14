export interface VoiceCharacter {
  id: string;
  name: string;
  description: string;
  persona: string;
  personaDescription: string;
  elevenLabsVoiceId: string;
}

export interface CustomPhrase {
  id: string;
  text: string;
  createdAt: number;
}

export interface AppSettings {
  selectedSound: string;
  backgroundVolume: number;
  voiceVolume: number;
  selectedVoice: string;
  voiceMode: "gentle" | "motivating" | "calm";
  encouragementFrequency: number;
  isPlaying: boolean;
  useCustomPhrases: boolean;
  userName: string;
  themeMode: "light" | "dark" | "system";
}

export const VOICE_CHARACTERS: VoiceCharacter[] = [
  {
    id: "sarah",
    name: "Sarah",
    description: "Warm female",
    persona: "Warm & Supportive Friend",
    personaDescription:
      "Like a caring best friend who always knows the right thing to say",
    elevenLabsVoiceId: "EXAVITQu4vr4xnSDxMaL",
  },
  {
    id: "bill",
    name: "Bill",
    description: "Calm male",
    persona: "Calm Mentor",
    personaDescription: "A steady, reassuring voice of experience and wisdom",
    elevenLabsVoiceId: "pqHfZKP75CvOlQylNhV4",
  },
  {
    id: "george",
    name: "George",
    description: "Wise grandfather",
    persona: "Wise Grandfather",
    personaDescription: "A gentle, wise soul with life experience and warmth",
    elevenLabsVoiceId: "JBFqnCBsd6RMkjVDRZzb",
  },
  {
    id: "charlie",
    name: "Charlie",
    description: "Chill hippy",
    persona: "Chill Hippy Philosopher",
    personaDescription: "A relaxed, free-spirited soul with unconventional wisdom",
    elevenLabsVoiceId: "IKne3meq5aSn9XLyUdCD",
  },
  {
    id: "random",
    name: "Random",
    description: "Mix it up",
    persona: "Random Voice",
    personaDescription: "A different voice each time for variety",
    elevenLabsVoiceId: "random",
  },
];

export const VOICE_MODES = [
  { id: "gentle", name: "Gentle", description: "Supportive & kind" },
  { id: "motivating", name: "Motivating", description: "Energizing & upbeat" },
  { id: "calm", name: "Calm", description: "Peaceful & soothing" },
];

export const FREQUENCY_OPTIONS = [
  { value: 1, label: "1 min" },
  { value: 3, label: "3 min" },
  { value: 5, label: "5 min" },
  { value: 10, label: "10 min" },
  { value: 15, label: "15 min" },
];

export const DEFAULT_SETTINGS: AppSettings = {
  selectedSound: "nature_birds",
  backgroundVolume: 0.5,
  voiceVolume: 0.7,
  selectedVoice: "sarah",
  voiceMode: "gentle",
  encouragementFrequency: 5,
  isPlaying: false,
  useCustomPhrases: false,
  userName: "",
  themeMode: "system",
};
