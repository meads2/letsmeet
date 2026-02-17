/**
 * Sign In Screen
 *
 * Following Clerk's official custom authentication flow
 * https://clerk.com/docs/custom-flows/authentication/sign-in-or-up
 */

import { useSignIn } from '@clerk/clerk-expo';
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

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    setLoading(true);

    try {
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace('/(home)/prospects');
      } else {
        // Handle other statuses like needs_first_factor, needs_second_factor, etc.
        console.error('Sign-in not complete:', JSON.stringify(signInAttempt, null, 2));
        Alert.alert('Error', 'Unable to complete sign in. Please try again.');
      }
    } catch (err: any) {
      console.error('Sign-in error:', JSON.stringify(err, null, 2));
      Alert.alert('Error', err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  }, [isLoaded, emailAddress, password, signIn, setActive, router]);

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
            <Text className="text-white/85 text-xs tracking-widest uppercase">Welcome Back</Text>
          </Animated.View>

          <Animated.View
            entering={FadeInUp.duration(750).springify()}
            className="rounded-2xl p-6 bg-white shadow-lg gap-4 w-full max-w-[420px] self-center"
          >
            <View className="gap-1">
              <Text className="text-2xl font-bold text-neutral-900">Sign in to LetsMeet</Text>
              <Text className="text-sm text-neutral-600">
                Continue discovering meaningful connections
              </Text>
            </View>

            <View className="gap-4">
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
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                textContentType="password"
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={onSignInPress}
                editable={!loading}
              />

              <Button
                onPress={onSignInPress}
                disabled={!emailAddress || !password || loading || !isLoaded}
                loading={loading}
                className="mt-2"
              >
                Sign In
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
            <Text className="text-sm text-white/70">New to LetsMeet? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/sign-up')} activeOpacity={0.8}>
              <Text className="text-sm text-secondary-500 font-bold underline">Create an account</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
