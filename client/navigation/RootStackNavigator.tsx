import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AmbientScreen from "@/screens/AmbientScreen";
import { useTheme } from "@/hooks/useTheme";

export type RootStackParamList = {
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.backgroundRoot },
      }}
    >
      <Stack.Screen name="Main" component={AmbientScreen} />
    </Stack.Navigator>
  );
}
