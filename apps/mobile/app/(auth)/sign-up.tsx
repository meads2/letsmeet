/**
 * Sign Up Screen
 *
 * Following Clerk's official custom authentication flow
 * https://clerk.com/docs/custom-flows/authentication/sign-in-or-up
 */

import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { AuroraBackground } from '../../components/auth/AuroraBackground';
import { Button, Input, Divider } from '@/components/ui';

WebBrowser.maybeCompleteAuthSession();

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignUpPress = useCallback(async () => {
    if (!isLoaded) return;

    setLoading(true);

    try {
      // Create the user account
      const result = await signUp.create({
        firstName,
        lastName,
        emailAddress,
        password
      });
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        router.navigate('/(home)/prospects');
      } else {
        console.log('result', result.status);
        Alert.alert('Error', 'Unable to complete sign up. Please try again.');
      }

    } catch (err: any) {
      console.error('Sign-up error:', JSON.stringify(err, null, 2));
      Alert.alert('Error', err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  }, [isLoaded, firstName, lastName, emailAddress, password, signUp, setActive, router]);

  return (
    <View className="flex-1 bg-neutral-900">
      <AuroraBackground />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerClassName="flex-grow p-5 pb-9 justify-center"
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            entering={FadeInDown.duration(700).springify()}
            className="self-center px-4 py-1 rounded-full border border-white/20 bg-white/5 mb-3"
          >
            <Text className="text-white/85 text-xs tracking-widest uppercase">Create Account</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.duration(750).springify()}
            className="rounded-2xl p-6 bg-white shadow-lg gap-4 w-full max-w-[440px] self-center"
          >
            <View className="gap-1">
              <Text className="text-2xl font-bold text-neutral-900">Join LetsMeet</Text>
              <Text className="text-sm text-neutral-600">
                Start discovering meaningful connections
              </Text>
            </View>

            <View className="gap-4">
              {/* First and last name side-by-side */}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Input
                    label="First name"
                    placeholder="Alex"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoComplete="given-name"
                    textContentType="givenName"
                    returnKeyType="next"
                    editable={!loading}
                  />
                </View>
                <View className="flex-1">
                  <Input
                    label="Last name"
                    placeholder="Rivera"
                    value={lastName}
                    onChangeText={setLastName}
                    autoComplete="family-name"
                    textContentType="familyName"
                    returnKeyType="next"
                    editable={!loading}
                  />
                </View>
              </View>

              <Input
                label="Email"
                placeholder="alex@example.com"
                value={emailAddress}
                onChangeText={setEmailAddress}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="next"
                editable={!loading}
              />

              <Input
                label="Password"
                placeholder="Create a strong password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType="newPassword"
                autoComplete="password-new"
                returnKeyType="done"
                onSubmitEditing={onSignUpPress}
                editable={!loading}
                helperText="Minimum 8 characters"
              />

              <Button
                onPress={onSignUpPress}
                disabled={!firstName || !lastName || !emailAddress || !password || loading || !isLoaded}
                loading={loading}
                className="mt-2"
              >
                Create Account
              </Button>

              <View className="flex-row items-center gap-2 my-2">
                <Divider className="flex-1" />
                <Text className="text-xs text-neutral-500">or</Text>
                <Divider className="flex-1" />
              </View>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.duration(800).delay(100)}
            className="mt-6 flex-row justify-center"
          >
            <Text className="text-sm text-white/70">Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-in')} activeOpacity={0.8}>
              <Text className="text-sm text-secondary-500 font-bold underline">Sign in</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
