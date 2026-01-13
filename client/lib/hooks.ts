import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSettings,
  saveSettings,
  getCustomPhrases,
  addCustomPhrase,
  deleteCustomPhrase,
  updateCustomPhrase,
  importPhrases,
} from "./storage";
import type { AppSettings, CustomPhrase } from "./types";

/**
 * Settings
 */
export function useSettings() {
  return useQuery<AppSettings>({
    queryKey: ["settings"],
    queryFn: getSettings,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (settings: AppSettings) => saveSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

/**
 * Custom Phrases
 */
export function useCustomPhrases() {
  return useQuery<CustomPhrase[]>({
    queryKey: ["customPhrases"],
    queryFn: getCustomPhrases,
  });
}

export function useAddCustomPhrase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => addCustomPhrase(text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customPhrases"] });
    },
  });
}

export function useDeleteCustomPhrase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCustomPhrase(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customPhrases"] });
    },
  });
}

export function useUpdateCustomPhrase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: { id: string; text: string }) =>
      updateCustomPhrase(args.id, args.text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customPhrases"] });
    },
  });
}

export function useImportPhrases() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (phrases: string[] | string) => importPhrases(phrases as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customPhrases"] });
    },
  });
}
