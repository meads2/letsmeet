/**
 * Profile Screen (Tab 4)
 *
 * User profile editing and settings
 * TODO: Implement profile editing, photo management, and settings
 */

import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSubscription } from '../../hooks/use-subscription';

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { tier, isPremium } = useSubscription();

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>
      <View style={styles.content}>
        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={styles.name}>
            {user?.firstName} {user?.lastName}
          </Text>
          {isPremium && (
            <LinearGradient
              colors={['#FF6B9D', '#C06C84']}
              style={styles.premiumBadge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Ionicons name="diamond" size={16} color="#FFFFFF" />
              <Text style={styles.premiumText}>
                {tier === 'premium_plus' ? 'Premium Plus' : 'Premium'}
              </Text>
            </LinearGradient>
          )}
          <Text style={styles.email}>
            {user?.primaryEmailAddress?.emailAddress}
          </Text>
        </View>

        {/* Subscription Card */}
        {!isPremium && (
          <TouchableOpacity
            style={styles.upgradeCard}
            onPress={() => router.push('/(tabs)/marketplace')}
          >
            <LinearGradient
              colors={['#FF6B9D', '#C06C84']}
              style={styles.upgradeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.upgradeContent}>
                <Ionicons name="diamond-outline" size={32} color="#FFFFFF" />
                <View style={styles.upgradeText}>
                  <Text style={styles.upgradeTitle}>Upgrade to Premium</Text>
                  <Text style={styles.upgradeSubtitle}>
                    Unlimited likes, see who liked you & more!
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.placeholder}>Profile Settings Coming Soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    marginBottom: 8,
  },
  premiumText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: '#666',
  },
  upgradeCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  upgradeGradient: {
    padding: 20,
  },
  upgradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  upgradeText: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  upgradeSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  signOutButton: {
    backgroundColor: '#FF6B9D',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
