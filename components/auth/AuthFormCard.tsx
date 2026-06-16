import { Image, Pressable, Text, TextInput, View } from "react-native";
import Animated, { FadeInRight, FadeOutLeft } from "react-native-reanimated";

import { PrimaryButton } from "@/components/wanderable";
import { wanderableTheme } from "@/constants/wanderableTheme";

import type { AuthMode, SignUpStep } from "./useAuthScreen";

const GOOGLE_LOGO_URI =
  "https://developers.google.com/identity/images/g-logo.png";
const { colors } = wanderableTheme;

type AuthFormCardProps = {
  authMode: AuthMode;
  email: string;
  errorMessage: string | null;
  firstName: string;
  infoMessage: string | null;
  isSignIn: boolean;
  lastName: string;
  password: string;
  primaryButtonTitle: string;
  scale: number;
  setEmail: (value: string) => void;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setMode: (mode: AuthMode) => void;
  setPassword: (value: string) => void;
  setSignUpStep: (step: SignUpStep) => void;
  signUpStep: SignUpStep;
  signUpTitle: string;
  onGoogleAuth: () => void;
  onPrimaryAction: () => void;
};

export function AuthFormCard({
  authMode,
  email,
  errorMessage,
  firstName,
  infoMessage,
  isSignIn,
  lastName,
  password,
  primaryButtonTitle,
  scale,
  setEmail,
  setFirstName,
  setLastName,
  setMode,
  setPassword,
  setSignUpStep,
  signUpStep,
  signUpTitle,
  onGoogleAuth,
  onPrimaryAction,
}: AuthFormCardProps) {
  const s = (value: number) => value * scale;

  return (
    <View
      className="mt-5 flex-1"
      style={{
        width: s(351),
        borderRadius: s(30),
        backgroundColor: colors.background.surface,
        paddingHorizontal: s(20),
        paddingTop: s(20),
        paddingBottom: s(16),
      }}>
      <Animated.View
        key={authMode}
        entering={FadeInRight.duration(220)}
        exiting={FadeOutLeft.duration(180)}>
        {isSignIn ? (
          <SignInSection
            email={email}
            password={password}
            scale={scale}
            setEmail={setEmail}
            setMode={setMode}
            setPassword={setPassword}
            onGoogleAuth={onGoogleAuth}
          />
        ) : (
          <SignUpSection
            email={email}
            firstName={firstName}
            lastName={lastName}
            password={password}
            scale={scale}
            setEmail={setEmail}
            setFirstName={setFirstName}
            setLastName={setLastName}
            setPassword={setPassword}
            setSignUpStep={setSignUpStep}
            signUpStep={signUpStep}
            signUpTitle={signUpTitle}
          />
        )}
      </Animated.View>

      {errorMessage ? (
        <AuthFeedbackMessage kind="error" message={errorMessage} scale={scale} />
      ) : null}

      {infoMessage ? (
        <AuthFeedbackMessage kind="info" message={infoMessage} scale={scale} />
      ) : null}

      <PrimaryButton
        title={primaryButtonTitle}
        scale={scale}
        style={{ width: "100%", height: s(52) }}
        onPress={onPrimaryAction}
      />
    </View>
  );
}

type SignInSectionProps = {
  email: string;
  password: string;
  scale: number;
  setEmail: (value: string) => void;
  setMode: (mode: AuthMode) => void;
  setPassword: (value: string) => void;
  onGoogleAuth: () => void;
};

function SignInSection({
  email,
  password,
  scale,
  setEmail,
  setMode,
  setPassword,
  onGoogleAuth,
}: SignInSectionProps) {
  const s = (value: number) => value * scale;

  return (
    <>
      <SocialAuthButton
        label="Continue with Google"
        scale={scale}
        onPress={onGoogleAuth}
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
        <Pressable accessibilityRole="button" onPress={() => setMode("signup")}>
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
  );
}

type SignUpSectionProps = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  scale: number;
  setEmail: (value: string) => void;
  setFirstName: (value: string) => void;
  setLastName: (value: string) => void;
  setPassword: (value: string) => void;
  setSignUpStep: (step: SignUpStep) => void;
  signUpStep: SignUpStep;
  signUpTitle: string;
};

function SignUpSection({
  email,
  firstName,
  lastName,
  password,
  scale,
  setEmail,
  setFirstName,
  setLastName,
  setPassword,
  setSignUpStep,
  signUpStep,
  signUpTitle,
}: SignUpSectionProps) {
  const s = (value: number) => value * scale;

  return (
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

      {signUpStep === "confirmation" ? (
        <ConfirmationMessage scale={scale} email={email.trim()} />
      ) : null}

      <View
        className="mt-1 flex-row items-center justify-between"
        style={{ marginBottom: s(28) }}>
        <View />
        {signUpStep !== "name" && signUpStep !== "confirmation" ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => setSignUpStep("name")}>
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
  );
}

type SocialAuthButtonProps = {
  label: string;
  scale: number;
  onPress: () => void;
};

function SocialAuthButton({ label, scale, onPress }: SocialAuthButtonProps) {
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
        <AuthGoogleIcon scale={scale} />
      </View>
      <Text
        className="font-bold"
        style={{ fontSize: 14 * scale, color: colors.text.primary }}>
        {label}
      </Text>
    </Pressable>
  );
}

function AuthGoogleIcon({ scale }: { scale: number }) {
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

function ConfirmationMessage({ scale, email }: { scale: number; email: string }) {
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
          borderColor: "#ECE7F1",
          backgroundColor: "#FBFAFD",
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
          We sent a confirmation link to {email || "your email address"}. Confirm
          it, then come back here and sign in.
        </Text>
      </View>
    </View>
  );
}

function AuthFeedbackMessage({
  kind,
  message,
  scale,
}: {
  kind: "error" | "info";
  message: string;
  scale: number;
}) {
  return (
    <View
      style={{
        marginBottom: 16 * scale,
        borderRadius: 16 * scale,
        paddingHorizontal: 14 * scale,
        paddingVertical: 12 * scale,
        backgroundColor:
          kind === "error"
            ? "rgba(223, 59, 111, 0.1)"
            : "rgba(36, 165, 158, 0.1)",
      }}>
      <Text
        className="font-semibold"
        style={{
          fontSize: 13 * scale,
          lineHeight: 18 * scale,
          color:
            kind === "error" ? colors.brand.secondary : colors.brand.primary,
        }}>
        {message}
      </Text>
    </View>
  );
}
