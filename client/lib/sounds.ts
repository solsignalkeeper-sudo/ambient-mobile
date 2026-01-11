export interface AmbientSound {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  url: string;
}

export const AMBIENT_SOUNDS: AmbientSound[] = [
  {
    id: "nature_birds",
    name: "Forest Birds",
    description: "Peaceful birdsong",
    icon: "sun",
    category: "Nature",
    url: "https://archive.org/download/various-bird-sounds/birds-in-forest-on-sunny-day-14444.mp3",
  },
  {
    id: "nature_rain",
    name: "Gentle Rain",
    description: "Light rainfall",
    icon: "cloud-rain",
    category: "Nature",
    url: "https://archive.org/download/rain-sounds-gentle-rain-thunderstorms/relaxing-rain-8228.mp3",
  },
  {
    id: "thunder",
    name: "Thunder Storm",
    description: "Distant thunder with rain",
    icon: "cloud-lightning",
    category: "Nature",
    url: "https://archive.org/download/RainSound13/Rain%20Sound%20with%20Thunderstorm.mp3",
  },
  {
    id: "cafe",
    name: "Coffee Shop",
    description: "Busy cafe ambiance",
    icon: "coffee",
    category: "Indoor",
    url: "https://archive.org/download/coffee-shop-sounds-12/Coffee%20Shop%20Sounds%2018.mp3",
  },
  {
    id: "office",
    name: "Office Typing",
    description: "Keyboard sounds",
    icon: "briefcase",
    category: "Indoor",
    url: "https://archive.org/download/SoundsOfTyping/typing.mp3",
  },
  {
    id: "city",
    name: "Rain on Window",
    description: "Cozy indoor rain",
    icon: "home",
    category: "Indoor",
    url: "https://archive.org/download/rain-sounds-gentle-rain-thunderstorms/rain-on-roof-or-window-nature-sounds-8312.mp3",
  },
];

export const SOUND_CATEGORIES = [...new Set(AMBIENT_SOUNDS.map((s) => s.category))];

export function getSoundById(id: string): AmbientSound | undefined {
  return AMBIENT_SOUNDS.find((s) => s.id === id);
}

export function getSoundsByCategory(category: string): AmbientSound[] {
  return AMBIENT_SOUNDS.filter((s) => s.category === category);
}

export function getDefaultSound(): AmbientSound {
  return AMBIENT_SOUNDS.find((s) => s.id === "nature_birds") || AMBIENT_SOUNDS[0];
}
