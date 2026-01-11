import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getSettings,
  saveSettings,
  getCustomPhrases,
  saveCustomPhrases,
  addCustomPhrase,
  deleteCustomPhrase,
  updateCustomPhrase,
  importPhrases,
} from "./storage";
import type { AppSettings, CustomPhrase } from "./types";

export function useSettings() {
  return useQuery({
    queryKey: ["settings"],
    queryFn: getSettings,
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
    },
  });
}

export function useCustomPhrases() {
  return useQuery({
    queryKey: ["customPhrases"],
    queryFn: getCustomPhrases,
  });
}

export function useAddCustomPhrase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCustomPhrase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customPhrases"] });
    },
  });
}

export function useDeleteCustomPhrase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCustomPhrase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customPhrases"] });
    },
  });
}

export function useUpdateCustomPhrase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) =>
      updateCustomPhrase(id, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customPhrases"] });
    },
  });
}

export function useImportPhrases() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: importPhrases,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customPhrases"] });
    },
  });
}
