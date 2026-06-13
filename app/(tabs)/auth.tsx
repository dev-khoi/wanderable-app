import * as Linking from 'expo-linking';
import { router, useLocalSearchParams } from "expo-router";
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
import { useAuth } from '@/lib/auth';
import {
  createSessionFromUrl,
  signInWithEmailPassword,
  signInWithGoogle,
  signUpWithEmailPassword,
} from '@/lib/supabase-auth';

type AuthMode = "signin" | "signup";
type SignUpStep = "name" | "credentials" | "confirmation";

const AUTOSCAN_ROUTE = "/autoscan";
const GOOGLE_LOGO_URI =
  "https://developers.google.com/identity/images/g-logo.png";
const { colors } = wanderableTheme;
const MIN_PASSWORD_LENGTH = 8;

export default function AuthScreen() {
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const incomingUrl = Linking.useURL();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { isLoading: isAuthLoading, session } = useAuth();
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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handledUrlRef = useRef<string | null>(null);

  useEffect(() => {
    setAuthMode(initialMode);
    setSignUpStep("name");
  }, [initialMode]);

  useEffect(() => {
    if (session) {
      router.replace(AUTOSCAN_ROUTE);
    }
  }, [session]);

  useEffect(() => {
    if (!incomingUrl || handledUrlRef.current === incomingUrl) {
      return;
    }

    handledUrlRef.current = incomingUrl;
    setErrorMessage(null);
    setInfoMessage('Finishing sign-in...');
    setIsSubmitting(true);

    void createSessionFromUrl(incomingUrl)
      .then((nextSession) => {
        if (nextSession) {
          router.replace(AUTOSCAN_ROUTE);
          return;
        }

        setInfoMessage(null);
      })
      .catch((error: unknown) => {
        setErrorMessage(
          error instanceof Error ? error.message : 'Unable to finish sign-in.',
        );
        setInfoMessage(null);
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  }, [incomingUrl]);

  const setMode = (nextMode: AuthMode) => {
    setAuthMode(nextMode);
    setSignUpStep("name");
    setErrorMessage(null);
    setInfoMessage(null);
    router.setParams({ mode: nextMode });
  };

  const handleGoogleAuth = async () => {
    try {
      setErrorMessage(null);
      setInfoMessage(null);
      setIsSubmitting(true);

      const nextSession = await signInWithGoogle();

      if (nextSession) {
        router.replace(AUTOSCAN_ROUTE);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to sign in with Google.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email.trim() || !password) {
      setErrorMessage('Enter both your email and password.');
      return;
    }

    try {
      setErrorMessage(null);
      setInfoMessage(null);
      setIsSubmitting(true);
      await signInWithEmailPassword(email.trim(), password);
      router.replace(AUTOSCAN_ROUTE);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to sign in.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSignUp = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage('Add your first and last name to continue.');
      return;
    }

    if (!email.trim() || !password) {
      setErrorMessage('Enter an email and password to create your account.');
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(`Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`);
      return;
    }

    try {
      setErrorMessage(null);
      setInfoMessage(null);
      setIsSubmitting(true);

      const data = await signUpWithEmailPassword({
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
      });

      if (data.session) {
        router.replace(AUTOSCAN_ROUTE);
        return;
      }

      setSignUpStep('confirmation');
      setInfoMessage('Check your email for the confirmation link, then come back and sign in.');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to create your account.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const isSignIn = authMode === "signin";
  const signUpTitle =
    signUpStep === 'confirmation'
      ? 'Confirm your email'
      : 'Create your account';

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
                      label="Continue with Google"
                      provider="google"
                      scale={scale}
                      onPress={handleGoogleAuth}
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
                      <View />
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

                    {signUpStep === 'confirmation' ? (
                      <ConfirmationMessage scale={scale} email={email.trim()} />
                    ) : null}

                    <View
                      className="mt-1 flex-row items-center justify-between"
                      style={{ marginBottom: s(28) }}>
                      <View />
                      {signUpStep !== 'name' && signUpStep !== 'confirmation' ? (
                        <Pressable
                          accessibilityRole="button"
                          onPress={() =>
                            setSignUpStep(
                              signUpStep === 'credentials' ? 'name' : 'credentials'
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

              {errorMessage ? (
                <AuthFeedbackMessage kind="error" message={errorMessage} scale={scale} />
              ) : null}

              {infoMessage ? (
                <AuthFeedbackMessage kind="info" message={infoMessage} scale={scale} />
              ) : null}

              <PrimaryButton
                title={
                  isSubmitting || isAuthLoading
                    ? 'Working...'
                    : isSignIn
                      ? 'Sign In'
                      : signUpStep === 'name'
                        ? 'Continue'
                        : signUpStep === 'credentials'
                          ? 'Create account'
                          : 'Go to Sign In'
                }
                scale={scale}
                style={{ width: "100%", height: s(52) }}
                onPress={() => {
                  if (isSubmitting || isAuthLoading) {
                    return;
                  }

                  if (isSignIn) {
                    void handleEmailSignIn();
                    return;
                  }

                  if (signUpStep === "name") {
                    setErrorMessage(null);
                    setInfoMessage(null);
                    setSignUpStep("credentials");
                    return;
                  }

                  if (signUpStep === "credentials") {
                    void handleEmailSignUp();
                    return;
                  }

                  setMode('signin');
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
  provider: 'google';
  scale: number;
  onPress: () => void;
};

function SocialAuthButton({ label, provider, scale, onPress }: SocialAuthButtonProps) {
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
       }}
      onPress={onPress}>
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
  provider: 'google';
  scale: number;
};

function SocialAuthIcon({ provider, scale }: SocialAuthIconProps) {
  return (
    <Image
      source={{ uri: GOOGLE_LOGO_URI }}
      resizeMode="contain"
      style={{ width: 20 * scale, height: 20 * scale }}
    />
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

type ConfirmationMessageProps = {
  scale: number;
  email: string;
};

function ConfirmationMessage({ scale, email }: ConfirmationMessageProps) {
  return (
    <View style={{ marginBottom: 18 * scale }}>
      <Text
        className="mb-2 font-bold"
        style={{ fontSize: 13 * scale, color: colors.text.primary }}>
        One more step
      </Text>
      <View
        style={{
          borderRadius: 16 * scale,
          borderWidth: 1,
          borderColor: '#ECE7F1',
          backgroundColor: '#FBFAFD',
          paddingHorizontal: 16 * scale,
          paddingVertical: 14 * scale,
        }}>
        <Text
          className="font-medium"
          style={{
            fontSize: 14 * scale,
            lineHeight: 20 * scale,
            color: colors.text.primary,
          }}>
          We sent a confirmation link to {email || 'your email address'}. Confirm it,
          then come back here and sign in.
        </Text>
      </View>
    </View>
  );
}

type AuthFeedbackMessageProps = {
  kind: 'error' | 'info';
  message: string;
  scale: number;
};

function AuthFeedbackMessage({ kind, message, scale }: AuthFeedbackMessageProps) {
  return (
    <View
      style={{
        marginBottom: 16 * scale,
        borderRadius: 16 * scale,
        paddingHorizontal: 14 * scale,
        paddingVertical: 12 * scale,
        backgroundColor:
          kind === 'error' ? 'rgba(223, 59, 111, 0.1)' : 'rgba(36, 165, 158, 0.1)',
      }}>
      <Text
        className="font-semibold"
        style={{
          fontSize: 13 * scale,
          lineHeight: 18 * scale,
          color:
            kind === 'error' ? colors.brand.secondary : colors.brand.primary,
        }}>
        {message}
      </Text>
    </View>
  );
}
