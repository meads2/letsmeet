/**
 * Profile Screen (Tab 4)
 *
 * User profile editing and settings
 * TODO: Implement profile editing, photo management, and settings
 */

import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSubscription } from '../../hooks/use-subscription';
import { Button, Card, Avatar } from '../../components/ui';

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { tier, isPremium } = useSubscription();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');
  const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('');

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      {/* Header */}
      <View className="py-4 px-5 bg-white border-b border-neutral-200">
        <Text className="text-2xl font-bold text-neutral-800">Profile</Text>
      </View>

      <View className="flex-1 p-6">
        {/* User Info */}
        <Card variant="elevated" padding="lg" className="items-center mb-6">
          <Avatar
            initials={initials}
            size="xl"
            className="mb-4"
          />

          <Text className="text-2xl font-bold text-neutral-800 mb-2">
            {displayName}
          </Text>

          {isPremium && (
            <LinearGradient
              colors={['#FF6B6B', '#9B7EBD']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ borderRadius: 16, marginBottom: 8 }}
            >
              <View className="flex-row items-center px-3 py-1.5 gap-1.5">
                <Ionicons name="diamond" size={16} color="#FFFFFF" />
                <Text className="text-white text-sm font-bold">
                  {tier === 'premium' ? 'Premium' : tier.replace('_', ' ')}
                </Text>
              </View>
            </LinearGradient>
          )}

          <Text className="text-base text-neutral-500">
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </Card>

        {/* Sign Out */}
        <Button
          variant="danger"
          size="lg"
          onPress={handleSignOut}
          className="mb-8"
        >
          Sign Out
        </Button>

        <Text className="text-base text-neutral-500 text-center">
          Profile Settings Coming Soon
        </Text>
      </View>
    </SafeAreaView>
  );
}
