import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Platform, Pressable } from "react-native";
import * as Location from "expo-location";
import { Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useEncounters } from "@/lib/hooks";
import { Spacing, BorderRadius, Shadows, Typography } from "@/constants/theme";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { Encounter } from "@/lib/types";

let MapView: any = null;
let Marker: any = null;

if (Platform.OS !== "web") {
  const Maps = require("react-native-maps");
  MapView = Maps.default;
  Marker = Maps.Marker;
}

const DEFAULT_REGION = {
  latitude: 37.7749,
  longitude: -122.4194,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export default function MapScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { theme, isDark } = useTheme();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const mapRef = useRef<any>(null);

  const [permission, requestPermission] = Location.useForegroundPermissions();
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [region, setRegion] = useState(DEFAULT_REGION);

  const { data: encounters } = useEncounters();

  const encountersWithLocation = encounters?.filter((e) => e.location !== null) ?? [];

  useEffect(() => {
    if (permission?.granted) {
      Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      }).then((location) => {
        setUserLocation(location);
        setRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      });
    }
  }, [permission?.granted]);

  const handleCenterOnUser = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: userLocation.coords.latitude,
        longitude: userLocation.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }
  };

  const handleMarkerPress = (encounter: Encounter) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("EncounterDetail", { id: encounter.id });
  };

  if (Platform.OS === "web") {
    return (
      <ThemedView style={[styles.container, { paddingTop: headerHeight }]}>
        <View style={styles.webFallback}>
          <Feather name="map" size={64} color={theme.textSecondary} />
          <ThemedText style={[styles.webTitle, { color: theme.text }]}>
            Map View
          </ThemedText>
          <ThemedText style={[styles.webMessage, { color: theme.textSecondary }]}>
            Run in Expo Go to explore encounters on an interactive map
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!permission) {
    return <ThemedView style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <ThemedView style={[styles.container, { paddingTop: headerHeight }]}>
        <View style={styles.permissionContainer}>
          <Feather name="map-pin" size={64} color={theme.primary} />
          <ThemedText style={[styles.permissionTitle, { color: theme.text }]}>
            Enable Location
          </ThemedText>
          <ThemedText style={[styles.permissionMessage, { color: theme.textSecondary }]}>
            Allow location access to see encounters on the map and discover nearby moments
          </ThemedText>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              requestPermission();
            }}
            style={({ pressed }) => [
              styles.permissionButton,
              { backgroundColor: theme.primary, opacity: pressed ? 0.8 : 1 },
            ]}
            testID="button-enable-location"
          >
            <ThemedText style={styles.permissionButtonText}>
              Enable Location
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      {MapView ? (
        <MapView
          ref={mapRef}
          style={StyleSheet.absoluteFill}
          initialRegion={region}
          showsUserLocation={true}
          showsMyLocationButton={false}
          userInterfaceStyle={isDark ? "dark" : "light"}
        >
          {Marker && encountersWithLocation.map((encounter) => (
            <Marker
              key={encounter.id}
              coordinate={{
                latitude: encounter.location!.latitude,
                longitude: encounter.location!.longitude,
              }}
              title={encounter.title}
              description={encounter.location!.label}
              onPress={() => handleMarkerPress(encounter)}
              pinColor={theme.accent}
            />
          ))}
        </MapView>
      ) : null}

      <Animated.View
        entering={FadeIn.delay(300)}
        style={[
          styles.locationButton,
          {
            bottom: tabBarHeight + Spacing.xl,
            backgroundColor: theme.backgroundDefault,
          },
          Shadows.fab,
        ]}
      >
        <Pressable
          onPress={handleCenterOnUser}
          style={({ pressed }) => [
            styles.locationButtonInner,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          testID="button-center-location"
        >
          <Feather name="navigation" size={22} color={theme.primary} />
        </Pressable>
      </Animated.View>

      {encountersWithLocation.length === 0 ? (
        <View
          style={[
            styles.noEncountersCard,
            { backgroundColor: theme.backgroundDefault, top: headerHeight + Spacing.lg },
            Shadows.card,
          ]}
        >
          <ThemedText style={[styles.noEncountersText, { color: theme.textSecondary }]}>
            No encounters with locations yet. Add a location when creating your next encounter!
          </ThemedText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["2xl"],
  },
  webTitle: {
    ...Typography.title,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  webMessage: {
    ...Typography.body,
    textAlign: "center",
    maxWidth: 280,
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing["2xl"],
  },
  permissionTitle: {
    ...Typography.title,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  permissionMessage: {
    ...Typography.body,
    textAlign: "center",
    maxWidth: 280,
    marginBottom: Spacing.xl,
  },
  permissionButton: {
    paddingHorizontal: Spacing["2xl"],
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  permissionButtonText: {
    ...Typography.body,
    color: "#FFFFFF",
    fontFamily: "Manrope_600SemiBold",
  },
  locationButton: {
    position: "absolute",
    right: Spacing.lg,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  locationButtonInner: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  noEncountersCard: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  noEncountersText: {
    ...Typography.caption,
    textAlign: "center",
  },
});
