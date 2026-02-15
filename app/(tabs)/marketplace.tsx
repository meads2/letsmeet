/**
 * Marketplace Screen (Tab 3)
 *
 * Premium subscription tiers and features
 */

import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { SubscriptionCard } from '../../components/subscription/subscription-card';
import { useSubscription } from '../../hooks/use-subscription';
import { SUBSCRIPTION_PLANS } from '../../api/payments/subscription-config';
import { initiateCheckout } from '../../api/payments/subscriptions';
import { useAuth } from '@clerk/clerk-expo';

export default function MarketplaceScreen() {
  const { userId } = useAuth();
  const { tier } = useSubscription();

  const handleSelectPlan = async (priceId?: string) => {
    if (!userId) {
      Alert.alert('Error', 'Please sign in to continue');
      return;
    }

    if (!priceId) {
      Alert.alert('Info', 'You are already on the free plan');
      return;
    }

    try {
      Alert.alert(
        'Upgrade to Premium',
        'To complete your subscription, you will be redirected to Stripe Checkout.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Continue',
            onPress: async () => {
              try {
                await initiateCheckout(userId, priceId);
                // In production, open the Stripe Checkout URL
                // await Linking.openURL(checkoutUrl);

                // For demo purposes, show success message
                Alert.alert(
                  'Demo Mode',
                  'In production, this would open Stripe Checkout. For now, upgrade has been simulated.',
                  [{ text: 'OK' }]
                );
              } catch {
                Alert.alert('Error', 'Failed to start checkout. Please try again.');
              }
            },
          },
        ]
      );
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#FF6B9D', '#C06C84']}
        style={styles.headerGradient}
      >
        <Text style={styles.title}>Unlock Premium Features</Text>
        <Text style={styles.subtitle}>
          Get unlimited likes, see who liked you, and more!
        </Text>
      </LinearGradient>

      {/* Subscription Plans */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {SUBSCRIPTION_PLANS.map((plan) => (
          <SubscriptionCard
            key={plan.id}
            plan={plan}
            isCurrentPlan={tier === plan.id}
            onSelect={() => handleSelectPlan(plan.stripePriceId)}
          />
        ))}

        {/* Additional Info */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Why Go Premium?</Text>

          <View style={styles.benefitCard}>
            <Text style={styles.benefitEmoji}>💕</Text>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>More Matches</Text>
              <Text style={styles.benefitText}>
                Unlimited likes means unlimited potential matches
              </Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <Text style={styles.benefitEmoji}>👀</Text>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>See Who Likes You</Text>
              <Text style={styles.benefitText}>
                Match instantly with people who already liked you
              </Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <Text style={styles.benefitEmoji}>⚡</Text>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Get Noticed</Text>
              <Text style={styles.benefitText}>
                Boost your profile to be seen by more people
              </Text>
            </View>
          </View>

          <Text style={styles.termsText}>
            Cancel anytime. Subscriptions automatically renew unless turned off at least
            24 hours before the end of the current period.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerGradient: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 24,
    paddingBottom: 40,
  },
  infoSection: {
    marginTop: 32,
    paddingHorizontal: 16,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  benefitCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  benefitEmoji: {
    fontSize: 32,
    marginRight: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  benefitText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  termsText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 24,
    paddingHorizontal: 8,
    lineHeight: 18,
  },
});
