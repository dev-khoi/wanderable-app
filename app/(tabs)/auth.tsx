import { router, useLocalSearchParams } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AuthFormCard } from "@/components/auth/AuthFormCard";
import { useAuthScreen } from "@/components/auth/useAuthScreen";
import { WanderableWordmark } from "@/components/wanderable";
import { wanderableTheme } from "@/constants/wanderableTheme";

const { colors } = wanderableTheme;

export default function AuthScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const scale = Math.min(width / 375, height / 812);
  const s = (value: number) => value * scale;
  const canvasLeft = (width - s(375)) / 2;
  const auth = useAuthScreen(mode);

  return (
    <View
      className="flex-1"
      style={{ backgroundColor: colors.background.deepSpace }}>
      <View
        className="absolute"
        style={{
          top: -s(72),
          right: -s(96),
          width: s(240),
          height: s(240),
          borderRadius: s(120),
          backgroundColor: colors.brand.primary,
          opacity: 0.18,
        }}
      />
      <View
        className="absolute"
        style={{
          bottom: s(120),
          left: -s(64),
          width: s(188),
          height: s(188),
          borderRadius: s(94),
          backgroundColor: colors.brand.secondary,
          opacity: 0.18,
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          bounces={false}
          keyboardShouldPersistTaps="handled">
          <View
            className="flex-1"
            style={{
              minHeight: height,
              paddingTop: insets.top + s(20),
              paddingBottom: Math.max(insets.bottom, s(24)),
            }}>
            <Pressable
              accessibilityRole="button"
              style={{
                marginLeft: canvasLeft + s(24),
                marginBottom: s(28),
                alignSelf: "flex-start",
              }}
              onPress={() => router.back()}>
              <Text
                className="font-bold"
                style={{ fontSize: s(15), color: colors.text.inverse }}>
                Back
              </Text>
            </Pressable>

            <WanderableWordmark
              scale={scale}
              textColor={colors.text.inverse}
              style={{ marginBottom: s(18), alignSelf: "center" }}
            />

            <View style={{ marginLeft: canvasLeft + s(12) }}>
              <AuthFormCard
                authMode={auth.authMode}
                email={auth.email}
                errorMessage={auth.errorMessage}
                firstName={auth.firstName}
                infoMessage={auth.infoMessage}
                isSignIn={auth.isSignIn}
                lastName={auth.lastName}
                password={auth.password}
                primaryButtonTitle={auth.primaryButtonTitle}
                scale={scale}
                setEmail={auth.setEmail}
                setFirstName={auth.setFirstName}
                setLastName={auth.setLastName}
                setMode={auth.setMode}
                setPassword={auth.setPassword}
                setSignUpStep={auth.setSignUpStep}
                signUpStep={auth.signUpStep}
                signUpTitle={auth.signUpTitle}
                onGoogleAuth={() => {
                  void auth.handleGoogleAuth();
                }}
                onPrimaryAction={auth.handlePrimaryAction}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
