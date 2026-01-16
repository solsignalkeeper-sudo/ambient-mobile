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
import type { AppSettings } from "./types";

export function useSettings() {
  return useQuery({
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

export function useCustomPhrases() {
  return useQuery({
    queryKey: ["customPhrases"],
    queryFn: getCustomPhrases,
  });
}

export function useSaveCustomPhrases() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveCustomPhrases,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customPhrases"] });
    },
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
    mutationFn: async (id: string) => {
      console.log("[DELETE/HOOK] mutationFn called", id);
      return deleteCustomPhrase(id);
    },
    onSuccess: async (_data, id) => {
      console.log("[DELETE/HOOK] onSuccess", id);
      await queryClient.invalidateQueries({ queryKey: ["customPhrases"] });
      await queryClient.refetchQueries({ queryKey: ["customPhrases"] });
    },
    onError: (e, id) => {
      console.log("[DELETE/HOOK] onError", id, String(e));
    },
    onSettled: (_data, _err, id) => {
      console.log("[DELETE/HOOK] onSettled", id);
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
