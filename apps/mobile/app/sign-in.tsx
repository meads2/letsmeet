/**
 * Sign In Screen
 *
 * Modernized Clerk authentication sign-in flow with animated gradient backdrop
 */

import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuth, useSignIn, useSSO } from '@clerk/clerk-expo';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as WebBrowser from 'expo-web-browser';

import { AuroraBackground } from '../components/auth/AuroraBackground';
import type { SignInResource } from '@clerk/types';

// Handle OAuth redirect
WebBrowser.maybeCompleteAuthSession();

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  const isPrimaryDisabled =
    !identifier.trim() || !password || loading || googleLoading;

  useEffect(() => {
    if (isSignedIn) {
      router.replace('/(tabs)/explore');
    }
  }, [isSignedIn, router]);

  const activateSessionAndRedirect = async (sessionId?: string | null) => {
    if (!sessionId) {
      setError('Unable to start a new session. Please try again.');
      return;
    }

    await setActive({ session: sessionId });
    router.replace('/(tabs)/explore');
  };

  const resolveSignInAttempt = async (resource: SignInResource | undefined | null) => {
    if (!resource) return;

    if (resource.status === 'complete') {
      await activateSessionAndRedirect(resource.createdSessionId);
      return;
    }

    if (resource.status === 'needs_first_factor') {
      try {
        const factorAttempt = await signIn?.attemptFirstFactor({
          strategy: 'password',
          password,
        });

        if (factorAttempt?.status === 'complete') {
          await activateSessionAndRedirect(factorAttempt.createdSessionId);
          return;
        }

        if (factorAttempt?.status === 'needs_second_factor') {
          setError('Two-step verification required. Please finish the second factor.');
          return;
        }
      } catch (factorError: any) {
        setError(factorError.errors?.[0]?.message || 'Failed to complete password verification.');
        return;
      }
    }

    if (resource.status === 'needs_second_factor') {
      setError('Two-step verification required. Please finish the second factor.');
      return;
    }

    setError('Additional authentication steps are required. Please check your inbox for instructions.');
  };

  const handleSignIn = async () => {
    if (!isLoaded || isPrimaryDisabled) return;

    setLoading(true);
    setError('');

    try {
      const result = await signIn.create({
        identifier: identifier.trim(),
        password,
      });

      await resolveSignInAttempt(result);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = useCallback(async () => {
    if (googleLoading) return;

    setGoogleLoading(true);
    setError('');

    try {
      const { createdSessionId, setActive: setActiveSession } = await startSSOFlow({
        strategy: 'oauth_google',
      });

      if (createdSessionId) {
        await setActiveSession!({ session: createdSessionId });
        router.replace('/(tabs)/explore');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Failed to sign in with Google');
    } finally {
      setGoogleLoading(false);
    }
  }, [googleLoading, router, startSSOFlow]);

  return (
    <View style={styles.screen}>
      <AuroraBackground />

      <KeyboardAvoidingView
        style={styles.avoider}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View entering={FadeInDown.duration(700).springify()} style={styles.badge}>
            <Text style={styles.badgeText}>Welcome Back</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(750).springify()} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>Sign in to LetsMeet</Text>
              <Text style={styles.subtitle}>
                Continue discovering curated matches with credentials that suit you.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Email, username or phone</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. alex@hey.com or @alexander"
                  placeholderTextColor="rgba(255,255,255,0.45)"
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  autoComplete="username"
                  textContentType="username"
                  keyboardType="default"
                  returnKeyType="next"
                />
                <Text style={styles.hint}>Use whichever identifier you registered with.</Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="rgba(255,255,255,0.45)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  textContentType="password"
                  autoComplete="password"
                  returnKeyType="done"
                />
                <Text style={styles.hint}>Minimum 8 characters.</Text>
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.primaryButton, isPrimaryDisabled && styles.disabledButton]}
                onPress={handleSignIn}
                disabled={isPrimaryDisabled}
                activeOpacity={0.9}
              >
                {loading ? (
                  <ActivityIndicator color="#ECFEFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Sign In</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.line} />
              </View>

              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleSignIn}
                disabled={googleLoading || loading}
                activeOpacity={0.8}
              >
                {googleLoading ? (
                  <ActivityIndicator color="#F8FAFC" />
                ) : (
                  <View style={styles.googleContent}>
                    <AntDesign name="google" size={18} color="#F8FAFC" style={styles.googleIcon} />
                    <Text style={styles.googleText}>Continue with Google</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).delay(100)} style={styles.footer}>
            <Text style={styles.footerText}>New to LetsMeet? </Text>
            <TouchableOpacity onPress={() => router.push('/sign-up')} activeOpacity={0.8}>
              <Text style={styles.footerLink}>Create an account</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#050416',
  },
  avoider: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 36,
    justifyContent: 'center',
  },
  badge: {
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 12,
  },
  badgeText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  card: {
    borderRadius: 20,
    padding: 20,
    backgroundColor: 'rgba(2, 6, 23, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.2)',
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.2,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 20 },
    gap: 16,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  cardHeader: {
    gap: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(191, 219, 254, 0.85)',
    lineHeight: 20,
  },
  form: {
    gap: 14,
  },
  field: {
    gap: 6,
  },
  label: {
    color: 'rgba(248,250,252,0.8)',
    fontSize: 13,
    fontWeight: '600',
  },
  input: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#FFFFFF',
    backgroundColor: 'rgba(15,23,42,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.25)',
  },
  hint: {
    fontSize: 11,
    color: 'rgba(248,250,252,0.55)',
  },
  primaryButton: {
    marginTop: 6,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    backgroundColor: '#1D4ED8',
    shadowColor: '#2563EB',
    shadowOpacity: 0.45,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  disabledButton: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  primaryButtonText: {
    color: '#E0F2FE',
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dividerText: {
    fontSize: 11,
    color: 'rgba(248,250,252,0.65)',
    letterSpacing: 0.5,
  },
  googleButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.25)',
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(15,23,42,0.8)',
  },
  googleContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    marginRight: 10,
  },
  googleText: {
    color: '#E0F2FE',
    fontSize: 14,
    fontWeight: '600',
  },
  error: {
    color: '#FCA5A5',
    fontSize: 13,
    textAlign: 'center',
  },
  footer: {
    marginTop: 22,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: 'rgba(248,250,252,0.7)',
    fontSize: 13,
  },
  footerLink: {
    color: '#8B5CF6',
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
