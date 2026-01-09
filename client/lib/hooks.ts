import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
<<<<<<< HEAD
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
=======
  getEncounters,
  saveEncounter,
  updateEncounter,
  deleteEncounter,
  getProfile,
  saveProfile,
} from "./storage";
import type { Encounter, UserProfile } from "./types";

export function useEncounters() {
  return useQuery({
    queryKey: ["encounters"],
    queryFn: getEncounters,
  });
}

export function useCreateEncounter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveEncounter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encounters"] });
>>>>>>> 8dbaa34 (Update app configuration and navigation for mobile platforms)
    },
  });
}

<<<<<<< HEAD
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
=======
export function useUpdateEncounter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateEncounter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encounters"] });
    },
  });
}

export function useDeleteEncounter() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEncounter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["encounters"] });
    },
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: getProfile,
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: saveProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
>>>>>>> 8dbaa34 (Update app configuration and navigation for mobile platforms)
    },
  });
}
