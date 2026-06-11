import { router, useLocalSearchParams } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PrimaryButton, WanderableWordmark } from "@/components/wanderable";
import { wanderableTheme } from "@/constants/wanderableTheme";

type AuthMode = "signin" | "signup";
type SignUpStep = "name" | "credentials" | "code";

const AUTOSCAN_ROUTE = "/autoscan";
const GOOGLE_LOGO_URI =
  "https://developers.google.com/identity/images/g-logo.png";
const { colors } = wanderableTheme;

export default function AuthScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const scale = Math.min(width / 375, height / 812);
  const s = (value: number) => value * scale;
  const canvasLeft = (width - s(375)) / 2;
  const initialMode: AuthMode = mode === "signup" ? "signup" : "signin";
  const [authMode, setAuthMode] = useState<AuthMode>(initialMode);
  const [signUpStep, setSignUpStep] = useState<SignUpStep>("name");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");

  useEffect(() => {
    setAuthMode(initialMode);
    setSignUpStep("name");
  }, [initialMode]);

  const setMode = (nextMode: AuthMode) => {
    setAuthMode(nextMode);
    setSignUpStep("name");
    router.setParams({ mode: nextMode });
  };

  const isSignIn = authMode === "signin";
  const signUpTitle =
    signUpStep === "code" ? "Enter confirmation code" : "Create your account";

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

            <View
              className="mt-5 flex-1"
              style={{
                marginLeft: canvasLeft + s(12),
                width: s(351),
                borderRadius: s(30),
                backgroundColor: colors.background.surface,
                paddingHorizontal: s(20),
                paddingTop: s(20),
                paddingBottom: s(16),
              }}>
              <View
                className="flex-row"
                style={{
                  marginBottom: s(20),
                  borderRadius: s(18),
                  backgroundColor: "#F3F0F7",
                  padding: s(4),
                }}>
                <ModeButton
                  label="Sign In"
                  active={isSignIn}
                  scale={scale}
                  onPress={() => setMode("signin")}
                />
                <ModeButton
                  label="Sign Up"
                  active={!isSignIn}
                  scale={scale}
                  onPress={() => setMode("signup")}
                />
              </View>

              <Animated.View
                key={authMode}
                entering={FadeInRight.duration(220)}
                exiting={FadeOutLeft.duration(180)}>
                {isSignIn ? (
                  <>
                    <SocialAuthButton
                      label="Continue with Apple"
                      provider="apple"
                      scale={scale}
                    />
                    <SocialAuthButton
                      label="Continue with Google"
                      provider="google"
                      scale={scale}
                    />
                    <AuthDivider label="or use email" scale={scale} />

                    <AuthField
                      label="Email"
                      placeholder="you@example.com"
                      scale={scale}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                    <AuthField
                      label="Password"
                      placeholder="Enter password"
                      scale={scale}
                      secureTextEntry
                      value={password}
                      onChangeText={setPassword}
                    />

                    <View
                      className="mt-1 flex-row items-center justify-between"
                      style={{ marginBottom: s(28) }}>
                      <Pressable
                        accessibilityRole="button"
                        onPress={() => setMode("signup")}>
                        <Text
                          className="font-bold"
                          style={{
                            fontSize: s(13),
                            color: colors.brand.secondary,
                          }}>
                          Sign up with email
                        </Text>
                      </Pressable>
                      <Pressable accessibilityRole="button">
                        <Text
                          className="font-bold"
                          style={{
                            fontSize: s(13),
                            color: colors.brand.secondary,
                          }}>
                          Forgot?
                        </Text>
                      </Pressable>
                    </View>
                  </>
                ) : (
                  <>
                    <Text
                      className="font-extrabold"
                      style={{
                        fontSize: s(24),
                        lineHeight: s(30),
                        color: colors.text.primary,
                        marginBottom: s(24),
                      }}>
                      {signUpTitle}
                    </Text>

                    {signUpStep === "name" ? (
                      <>
                        <AuthField
                          label="First Name"
                          placeholder="Aydin"
                          scale={scale}
                          autoCapitalize="words"
                          value={firstName}
                          onChangeText={setFirstName}
                        />
                        <AuthField
                          label="Last Name"
                          placeholder="Carter"
                          scale={scale}
                          autoCapitalize="words"
                          value={lastName}
                          onChangeText={setLastName}
                        />
                      </>
                    ) : null}

                    {signUpStep === "credentials" ? (
                      <>
                        <AuthField
                          label="Email"
                          placeholder="you@example.com"
                          scale={scale}
                          keyboardType="email-address"
                          autoCapitalize="none"
                          value={email}
                          onChangeText={setEmail}
                        />
                        <AuthField
                          label="Password"
                          placeholder="Create password"
                          scale={scale}
                          secureTextEntry
                          value={password}
                          onChangeText={setPassword}
                        />
                      </>
                    ) : null}

                    {signUpStep === "code" ? (
                      <CodeField
                        scale={scale}
                        value={code}
                        onChangeText={setCode}
                      />
                    ) : null}

                    <View
                      className="mt-1 flex-row items-center justify-between"
                      style={{ marginBottom: s(28) }}>
                      <View />
                      {signUpStep !== "name" ? (
                        <Pressable
                          accessibilityRole="button"
                          onPress={() =>
                            setSignUpStep(
                              signUpStep === "credentials" ? "name" : "credentials"
                            )
                          }>
                          <Text
                            className="font-bold"
                            style={{
                              fontSize: s(13),
                              color: colors.brand.secondary,
                            }}>
                            Back
                          </Text>
                        </Pressable>
                      ) : (
                        <View />
                      )}
                    </View>
                  </>
                )}
              </Animated.View>

              <PrimaryButton
                title={
                  isSignIn
                    ? "Sign In"
                    : "Continue"
                }
                scale={scale}
                style={{ width: "100%", height: s(52) }}
                onPress={() => {
                  if (isSignIn) {
                    router.replace(AUTOSCAN_ROUTE);
                    return;
                  }

                  if (signUpStep === "name") {
                    setSignUpStep("credentials");
                    return;
                  }

                  if (signUpStep === "credentials") {
                    setSignUpStep("code");
                    return;
                  }

                  router.replace(AUTOSCAN_ROUTE);
                }}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

type ModeButtonProps = {
  label: string;
  active: boolean;
  scale: number;
  onPress: () => void;
};

function ModeButton({ label, active, scale, onPress }: ModeButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className="flex-1 items-center justify-center"
      style={{
        height: 44 * scale,
        borderRadius: 14 * scale,
        backgroundColor: active ? colors.background.surface : "transparent",
      }}
      onPress={onPress}>
      <Text
        className="font-extrabold"
        style={{
          fontSize: 14 * scale,
          color: active ? colors.text.primary : colors.text.subtle,
        }}>
        {label}
      </Text>
    </Pressable>
  );
}

type SocialAuthButtonProps = {
  label: string;
  provider: "apple" | "google";
  scale: number;
};

function SocialAuthButton({ label, provider, scale }: SocialAuthButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      className="flex-row items-center justify-center"
      style={{
        height: 52 * scale,
        borderRadius: 16 * scale,
        borderWidth: 1,
        borderColor: "#ECE7F1",
        backgroundColor: colors.background.surface,
        marginBottom: 12 * scale,
      }}>
      <View
        className="items-center justify-center"
        style={{
          width: 24 * scale,
          height: 24 * scale,
          marginRight: 10 * scale,
        }}>
        <SocialAuthIcon provider={provider} scale={scale} />
      </View>
      <Text
        className="font-bold"
        style={{ fontSize: 14 * scale, color: colors.text.primary }}>
        {label}
      </Text>
    </Pressable>
  );
}

type SocialAuthIconProps = {
  provider: "apple" | "google";
  scale: number;
};

function SocialAuthIcon({ provider, scale }: SocialAuthIconProps) {
  if (provider === "google") {
    return (
      <Image
        source={{ uri: GOOGLE_LOGO_URI }}
        resizeMode="contain"
        style={{ width: 20 * scale, height: 20 * scale }}
      />
    );
  }

  if (Platform.OS === "ios") {
    return (
      <SymbolView
        name="applelogo"
        type="monochrome"
        tintColor={colors.text.primary}
        style={{ width: 20 * scale, height: 20 * scale }}
      />
    );
  }

  return (
    <Text
      className="font-extrabold"
      style={{
        fontSize: 18 * scale,
        lineHeight: 20 * scale,
        color: colors.text.primary,
      }}>
      
    </Text>
  );
}

type AuthDividerProps = {
  label: string;
  scale: number;
};

function AuthDivider({ label, scale }: AuthDividerProps) {
  return (
    <View
      className="flex-row items-center"
      style={{ marginTop: 4 * scale, marginBottom: 18 * scale }}>
      <View style={{ flex: 1, height: 1, backgroundColor: "#ECE7F1" }} />
      <Text
        className="font-medium"
        style={{
          marginHorizontal: 12 * scale,
          fontSize: 12 * scale,
          color: colors.text.subtle,
        }}>
        {label}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: "#ECE7F1" }} />
    </View>
  );
}

type AuthFieldProps = {
  label: string;
  placeholder: string;
  scale: number;
  value?: string;
  onChangeText?: (value: string) => void;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
};

function AuthField({
  label,
  placeholder,
  scale,
  value,
  onChangeText,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
}: AuthFieldProps) {
  return (
    <View style={{ marginBottom: 18 * scale }}>
      <Text
        className="mb-2 font-bold"
        style={{ fontSize: 13 * scale, color: colors.text.primary }}>
        {label}
      </Text>
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={colors.text.subtle}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoCorrect={false}
        className="font-medium"
        style={{
          height: 52 * scale,
          borderRadius: 16 * scale,
          borderWidth: 1,
          borderColor: "#ECE7F1",
          paddingHorizontal: 16 * scale,
          fontSize: 15 * scale,
          color: colors.text.primary,
          backgroundColor: "#FBFAFD",
        }}
      />
    </View>
  );
}

type CodeFieldProps = {
  scale: number;
  value: string;
  onChangeText: (value: string) => void;
};

function CodeField({ scale, value, onChangeText }: CodeFieldProps) {
  const inputRef = useRef<TextInput>(null);
  const nextValue = value.slice(0, 6);

  return (
    <View style={{ marginBottom: 18 * scale }}>
      <Text
        className="mb-2 font-bold"
        style={{ fontSize: 13 * scale, color: colors.text.primary }}>
        Confirmation Code
      </Text>
      <TextInput
        ref={inputRef}
        placeholder="123456"
        placeholderTextColor={colors.text.subtle}
        value={nextValue}
        onChangeText={(text) =>
          onChangeText(text.replace(/\D/g, "").slice(0, 6))
        }
        keyboardType="number-pad"
        autoCapitalize="none"
        autoCorrect={false}
        className="font-medium"
        style={{
          position: "absolute",
          opacity: 0,
          width: 1,
          height: 1,
        }}
      />
      <Pressable
        accessibilityRole="button"
        onPress={() => inputRef.current?.focus()}
        style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {Array.from({ length: 6 }).map((_, index) => (
          <View
            key={index}
            className="items-center justify-center"
            style={{
              width: 44 * scale,
              height: 52 * scale,
              borderRadius: 16 * scale,
              borderWidth: 1,
              borderColor: "#ECE7F1",
              backgroundColor: "#FBFAFD",
            }}>
            <Text
              className="font-extrabold"
              style={{ fontSize: 18 * scale, color: colors.text.primary }}>
              {nextValue[index] ?? ""}
            </Text>
          </View>
        ))}
      </Pressable>
    </View>
  );
}
