/**
 * Sign Up Screen
 *
 * Modernized Clerk authentication sign-up flow with animated gradient backdrop
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
import { useAuth, useSignUp, useSSO } from '@clerk/clerk-expo';
import { AntDesign } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as WebBrowser from 'expo-web-browser';

import { AuroraBackground } from '../components/auth/AuroraBackground';

// Handle OAuth redirect
WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const { startSSOFlow } = useSSO();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingOnboarding, setPendingOnboarding] = useState(false);

  const isPrimaryDisabled =
    !firstName.trim() ||
    !lastName.trim() ||
    !email.trim() ||
    !password ||
    loading ||
    googleLoading;

  useEffect(() => {
    if (pendingOnboarding && isSignedIn) {
      router.replace('/onboarding');
    }
  }, [pendingOnboarding, isSignedIn, router]);

  const activateAndRedirectToOnboarding = async (sessionId?: string | null) => {
    if (!sessionId) {
      setError('Unable to start a new session. Please try again.');
      return;
    }

    await setActive({ session: sessionId });
    setPendingOnboarding(true);
    router.replace('/onboarding');
  };

  const handleSignUp = async () => {
    if (!isLoaded || isPrimaryDisabled) return;

    setLoading(true);
    setError('');

    try {
      const result = await signUp.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim() || undefined,
        emailAddress: email.trim(),
        phoneNumber: phone.trim() || undefined,
        password,
      });

      if (result.status === 'missing_requirements') {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      }

      if (result.status === 'complete') {
        await activateAndRedirectToOnboarding(result.createdSessionId);
        return;
      }

      if (result.status === 'missing_requirements') {
        if (result.requiredFields?.includes('email_address_verification')) {
          await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        }
        if (result.requiredFields?.includes('phone_number')) {
          await signUp.preparePhoneNumberVerification({ strategy: 'phone_code' });
        }
        setError('Check your inbox to finish verification before continuing.');
        return;
      }

      setError('Additional information is required to finish creating your account.');
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = useCallback(async () => {
    if (googleLoading) return;

    setGoogleLoading(true);
    setError('');

    try {
      const { createdSessionId, setActive: setActiveSession } = await startSSOFlow({
        strategy: 'oauth_google',
      });

      if (createdSessionId) {
        await setActiveSession!({ session: createdSessionId });
        setPendingOnboarding(true);
        router.replace('/onboarding');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Failed to sign up with Google');
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
            <Text style={styles.badgeText}>Create Account</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(750).springify()} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>Craft your profile</Text>
              <Text style={styles.subtitle}>
                Email, username, phone number or Google - choose what feels right and start connecting.
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={styles.label}>First name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Alex"
                    placeholderTextColor="rgba(255,255,255,0.45)"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoComplete="given-name"
                    textContentType="givenName"
                    returnKeyType="next"
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.label}>Last name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Rivera"
                    placeholderTextColor="rgba(255,255,255,0.45)"
                    value={lastName}
                    onChangeText={setLastName}
                    autoComplete="family-name"
                    textContentType="familyName"
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="@alexander"
                  placeholderTextColor="rgba(255,255,255,0.45)"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  autoComplete="username"
                  textContentType="username"
                  returnKeyType="next"
                />
                <Text style={styles.hint}>
                  {"Pick something unique - we'll show this on your profile."}
                </Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="alex@hey.com"
                  placeholderTextColor="rgba(255,255,255,0.45)"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Phone number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+1 555 010 2000"
                  placeholderTextColor="rgba(255,255,255,0.45)"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  textContentType="telephoneNumber"
                  autoComplete="tel-national"
                  returnKeyType="next"
                />
                <Text style={styles.hint}>
                  {"We'll text you a verification code if required."}
                </Text>
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Create a strong password"
                  placeholderTextColor="rgba(255,255,255,0.45)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  textContentType="newPassword"
                  autoComplete="password-new"
                  returnKeyType="done"
                />
                <Text style={styles.hint}>Minimum 8 characters with a mix of letters & numbers.</Text>
              </View>

              {error ? <Text style={styles.error}>{error}</Text> : null}

              <TouchableOpacity
                style={[styles.primaryButton, isPrimaryDisabled && styles.disabledButton]}
                onPress={handleSignUp}
                disabled={isPrimaryDisabled}
                activeOpacity={0.9}
              >
                {loading ? (
                  <ActivityIndicator color="#ECFEFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Create account</Text>
                )}
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.line} />
              </View>

              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleSignUp}
                disabled={googleLoading || loading}
                activeOpacity={0.8}
              >
                {googleLoading ? (
                  <ActivityIndicator color="#F8FAFC" />
                ) : (
                  <View style={styles.googleContent}>
                    <AntDesign name="google" size={18} color="#E0F2FE" style={styles.googleIcon} />
                    <Text style={styles.googleText}>Sign up with Google</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(800).delay(100)} style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/sign-in')} activeOpacity={0.8}>
              <Text style={styles.footerLink}>Sign in</Text>
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
    borderColor: 'rgba(96,165,250,0.18)',
    shadowColor: '#2563EB',
    shadowOpacity: 0.22,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 22 },
    gap: 16,
    width: '100%',
    maxWidth: 440,
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
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
    gap: 6,
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
    backgroundColor: '#2563EB',
    shadowColor: '#1D4ED8',
    shadowOpacity: 0.45,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
  },
  disabledButton: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  primaryButtonText: {
    color: '#DBEAFE',
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
    color: '#60A5FA',
    fontSize: 13,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});
