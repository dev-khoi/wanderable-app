import * as Linking from "expo-linking";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";

import { useAuth } from "@/lib/auth";
import {
  createSessionFromUrl,
  signInWithEmailPassword,
  signInWithGoogle,
  signUpWithEmailPassword,
} from "@/lib/supabase-auth";

export type AuthMode = "signin" | "signup";
export type SignUpStep = "name" | "credentials" | "confirmation";

const TRIP_HOME_ROUTE = "/trip-card";
const MIN_PASSWORD_LENGTH = 8;

export function useAuthScreen(mode?: string) {
  const incomingUrl = Linking.useURL();
  const { isLoading: isAuthLoading, session } = useAuth();
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

  const clearMessages = () => {
    setErrorMessage(null);
    setInfoMessage(null);
  };

  useEffect(() => {
    setAuthMode(initialMode);
    setSignUpStep("name");
  }, [initialMode]);

  useEffect(() => {
    if (session) {
      router.replace(TRIP_HOME_ROUTE);
    }
  }, [session]);

  useEffect(() => {
    if (!incomingUrl || handledUrlRef.current === incomingUrl) {
      return;
    }

    handledUrlRef.current = incomingUrl;
    clearMessages();
    setInfoMessage("Finishing sign-in...");
    setIsSubmitting(true);

    void createSessionFromUrl(incomingUrl)
      .then((nextSession) => {
        if (nextSession) {
          router.replace(TRIP_HOME_ROUTE);
          return;
        }

        setInfoMessage(null);
      })
      .catch((error: unknown) => {
        setErrorMessage(
          error instanceof Error ? error.message : "Unable to finish sign-in.",
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
    clearMessages();
    router.replace({
      pathname: "/auth",
      params: { mode: nextMode },
    });
  };

  const handleGoogleAuth = async () => {
    try {
      clearMessages();
      setIsSubmitting(true);

      const nextSession = await signInWithGoogle();

      if (nextSession) {
        router.replace(TRIP_HOME_ROUTE);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to sign in with Google.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSignIn = async () => {
    if (!email.trim() || !password) {
      setErrorMessage("Enter both your email and password.");
      return;
    }

    try {
      clearMessages();
      setIsSubmitting(true);
      await signInWithEmailPassword(email.trim(), password);
      router.replace(TRIP_HOME_ROUTE);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to sign in.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailSignUp = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setErrorMessage("Add your first and last name to continue.");
      return;
    }

    if (!email.trim() || !password) {
      setErrorMessage("Enter an email and password to create your account.");
      return;
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setErrorMessage(
        `Use at least ${MIN_PASSWORD_LENGTH} characters for your password.`,
      );
      return;
    }

    try {
      clearMessages();
      setIsSubmitting(true);

      const data = await signUpWithEmailPassword({
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
      });

      if (data.session) {
        router.replace(TRIP_HOME_ROUTE);
        return;
      }

      setSignUpStep("confirmation");
      setInfoMessage(
        "Check your email for the confirmation link, then come back and sign in.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create your account.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrimaryAction = () => {
    if (isSubmitting || isAuthLoading) {
      return;
    }

    if (authMode === "signin") {
      void handleEmailSignIn();
      return;
    }

    if (signUpStep === "name") {
      clearMessages();
      setSignUpStep("credentials");
      return;
    }

    if (signUpStep === "credentials") {
      void handleEmailSignUp();
      return;
    }

    setMode("signin");
  };

  const signUpTitle =
    signUpStep === "confirmation"
      ? "Confirm your email"
      : "Create your account";
  const primaryButtonTitle =
    isSubmitting || isAuthLoading
      ? "Working..."
      : authMode === "signin"
        ? "Sign In"
        : signUpStep === "name"
          ? "Continue"
          : signUpStep === "credentials"
            ? "Create account"
            : "Go to Sign In";

  return {
    authMode,
    email,
    errorMessage,
    firstName,
    handleGoogleAuth,
    handlePrimaryAction,
    infoMessage,
    isAuthLoading,
    isSignIn: authMode === "signin",
    isSubmitting,
    lastName,
    password,
    primaryButtonTitle,
    setEmail,
    setFirstName,
    setLastName,
    setMode,
    setPassword,
    setSignUpStep,
    signUpStep,
    signUpTitle,
  };
}
