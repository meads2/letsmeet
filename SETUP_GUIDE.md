# 💕 LetsMeet Setup Guide

Complete guide to getting your LetsMeet dating app up and running.

---

## 📋 Prerequisites

- **Node.js** v18 or later
- **npm** or **pnpm**
- **Expo CLI** (install globally: `npm install -g expo-cli`)
- **iOS Simulator** (macOS) or **Android Emulator**
- **PostgreSQL** database (Neon recommended)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# Clerk Authentication (https://clerk.com)
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_key

# Stripe Payments (https://stripe.com)
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key

# Statsig Feature Flags (https://statsig.com)
EXPO_PUBLIC_STATSIG_CLIENT_KEY=your_statsig_client_key

# Neon Database (https://neon.tech)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Cloudinary Image Hosting (https://cloudinary.com)
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 3. Set Up Services

#### Clerk (Authentication)
1. Create account at https://clerk.com
2. Create new application
3. Copy publishable key to `.env`
4. Enable email/password authentication

#### Stripe (Payments)
1. Create account at https://stripe.com
2. Get test mode publishable key
3. Copy to `.env`
4. Create products:
   - Premium ($9.99/month)
   - Premium Plus ($19.99/month)
5. Note product and price IDs

#### Statsig (Feature Flags)
1. Create account at https://statsig.com
2. Create new project
3. Copy client SDK key to `.env`
4. Create feature gates:
   - `super_likes_enabled`
   - `boost_feature_enabled`
   - `see_who_liked_you`
   - `rewind_swipes`

#### Neon (Database)
1. Create account at https://neon.tech
2. Create new project
3. Copy connection string to `.env`
4. Run migration (see below)

#### Cloudinary (Images)
1. Create account at https://cloudinary.com
2. Get cloud name and upload preset
3. Configure unsigned upload preset in settings
4. Copy values to `.env`

### 4. Run Database Migration

Connect to your Neon database and run the migration:

```bash
psql $DATABASE_URL -f api/database/migrations/001_dating_schema.sql
```

Or using a PostgreSQL client, execute the SQL file contents.

### 5. Start Development Server

```bash
npm start
# or
npx expo start
```

Press `i` for iOS simulator or `a` for Android emulator.

---

## 📱 Platform-Specific Setup

### iOS

```bash
npm run ios
```

**Requirements:**
- macOS
- Xcode installed
- iOS Simulator

### Android

```bash
npm run android
```

**Requirements:**
- Android Studio installed
- Android Emulator configured
- Android SDK installed

### Web

```bash
npm run web
```

Opens in default browser at `http://localhost:19006`

---

## 🔧 Configuration

### Stripe Product IDs

Update `api/payments/subscription-config.ts` with your Stripe product IDs:

```typescript
{
  id: 'premium',
  name: 'Premium',
  // Add your IDs here:
  stripeProductId: 'prod_xxx',
  stripePriceId: 'price_xxx',
}
```

### Feature Flags

Configure Statsig gates in dashboard to enable/disable features:
- `super_likes_enabled` - Enable super likes
- `boost_feature_enabled` - Enable profile boost
- `see_who_liked_you` - See who liked you feature
- `rewind_swipes` - Rewind last swipe

---

## 🧪 Testing

### Create Test Accounts

1. Start the app
2. Click "Create Account"
3. Fill in profile with photos
4. Create multiple accounts to test matching

### Test Matching

1. Open two simulators/emulators
2. Sign in with different accounts
3. Swipe right on each other
4. Verify match modal appears
5. Test chat functionality

### Test Premium Features

Manually update a profile's `is_premium` field in database:

```sql
UPDATE profiles SET is_premium = true WHERE user_id = 'user_xxx';
```

Then test:
- Unlimited likes
- Super likes
- See who liked you
- Other premium features

---

## 🐛 Troubleshooting

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install

# Clear Expo cache
npx expo start -c
```

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check Neon project is active
- Ensure IP is whitelisted (if using IP restrictions)

### Image Upload Issues

- Verify Cloudinary credentials
- Check upload preset is "unsigned"
- Ensure folder permissions are correct

### Auth Issues

- Clear app data/reinstall
- Verify Clerk keys are correct
- Check Clerk dashboard for errors

---

## 📊 Database Schema

The app uses 5 main tables:

1. **users** - Clerk user sync
2. **profiles** - Dating profiles with photos, bio, preferences
3. **swipes** - Like/pass actions
4. **matches** - Mutual likes
5. **messages** - Chat messages

See `api/database/migrations/001_dating_schema.sql` for full schema.

---

## 🚢 Production Deployment

### Backend API Required

For production, you need a backend API for:

1. **Stripe Webhooks** - Handle subscription events
2. **Checkout Sessions** - Create Stripe checkout URLs
3. **Image Processing** - Optimize uploaded images
4. **Push Notifications** - Send match/message notifications

### Recommended Stack

- **Backend:** Node.js + Express or Next.js API routes
- **Hosting:** Vercel, Railway, or Render
- **Database:** Neon (already configured)

### Environment Variables

Update `.env` with production values:
- Production Clerk keys
- Production Stripe keys
- Production database URL
- Production Cloudinary account

---

## 📚 Additional Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Clerk Expo Guide](https://clerk.com/docs/quickstarts/expo)
- [Stripe React Native](https://docs.stripe.com/payments/accept-a-payment?platform=react-native)
- [Neon Documentation](https://neon.tech/docs/introduction)

---

## 💡 Tips

1. **Use Test Mode** - Keep Stripe in test mode during development
2. **Seed Data** - Create multiple test profiles for better testing
3. **Location Services** - Enable location in simulator for distance features
4. **Hot Reload** - Changes auto-reload during development
5. **Debug Menu** - Shake device or `Cmd+D` (iOS) / `Cmd+M` (Android)

---

## 🆘 Support

For issues or questions:
1. Check this guide first
2. Review error messages in console
3. Check service dashboards (Clerk, Stripe, etc.)
4. Review code comments for implementation details

---

**Happy Dating! 💕**
