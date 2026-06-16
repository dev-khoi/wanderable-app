import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text } from "react-native";

import { wanderableTheme } from "@/constants/wanderableTheme";
import { useAuth } from "@/lib/auth";

const { colors } = wanderableTheme;

export function SignOutButton() {
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handlePress = async () => {
    if (isSigningOut) {
      return;
    }

    try {
      setIsSigningOut(true);
      await signOut();
      router.replace({ pathname: "/auth", params: { mode: "signin" } });
    } catch (error) {
      console.warn("Failed to sign out.", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <Pressable accessibilityRole="button" onPress={() => void handlePress()}>
      <Text
        className="font-extrabold"
        style={{ fontSize: 14, color: colors.brand.secondary, opacity: isSigningOut ? 0.5 : 1 }}>
        {isSigningOut ? "Signing out..." : "Sign out"}
      </Text>
    </Pressable>
  );
}
