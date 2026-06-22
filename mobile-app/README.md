# CSJMU Labour Mobile App (React Native + Expo)

## Setup Instructions

1. Install dependencies
```bash
cd mobile-app
npm install
```

2. Update Supabase credentials in `lib/supabase.ts`
```ts
const supabaseUrl = 'https://YOUR_PROJECT_REF.supabase.co';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

3. Run the development server
```bash
npx expo start
```

## Build Android APK

**Using EAS (Recommended):**

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile production
```

**Local build (requires Android Studio):**

```bash
npx expo prebuild
cd android && ./gradlew assembleRelease
```

The APK will be located at:
`android/app/build/outputs/apk/release/app-release.apk`

## Features
- Supabase Auth (Labour login)
- Real-time product list
- Camera barcode scanner (expo-camera)
- Stock In / Stock Out
- Photo upload to Supabase Storage
- Full offline-ready mobile experience

This is a standalone React Native application that connects to the same Supabase backend as the Admin Web Panel.
