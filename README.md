# FitFat2

FitFat2 is the upgraded, more intelligent version of the original FitFat fitness application, redesigned with a modern technology stack and a significantly enhanced user experience. Built using React Native, Expo, TypeScript, and NativeWind for Tailwind styling, the app delivers a clean, fast, and responsive interface across devices. Content is managed through Sanity, while Clerk provides secure and seamless user authentication.

A core highlight of FitFat2 is its integration with OpenAI, which introduces real-time AI coaching inside the app. Users can receive detailed exercise instructions, guidance on correct form for every step of their fitness journey. This AI-driven layer makes the experience more interactive, adaptive, and supportive compared to traditional fitness apps.

FitFat2 expands on the first version by offering smoother navigation, improved performance, organized workout categories, saved routines, progress tracking, and a refined user interface. With its combination of advanced technologies and intelligent fitness coaching, FitFat2 provides a smarter, more personalized, and highly engaging fitness experience designed to help users stay consistent and achieve their goals more effectively.

## 🛠 Tech Stack

- **React Native + Expo**
- **TypeScript**
- **Expo Router**
- **NativeWind** (Tailwind CSS for RN)
- **Clerk** (Authentication)
- **Sanity CMS** (Content Management)
- **OpenAI API** (AI Exercise Coaching)
- **Cloudinary** (Image Uploads)

## ✨ Features

- 🔐 Secure user authentication (Clerk)
- 🤖 AI-powered exercise guidance (OpenAI)
- 🏋️ Categorized exercise library
- 📊 Workout history & progress tracking
- 📂 Saved routines & quick access workouts
- 🎨 Beautiful UI with NativeWind
- 📱 Smooth navigation with Expo Router
- ☁️ Cloud image handling with Cloudinary
- 🧩 Dynamic CMS-driven content (Sanity)
- 💾 Local caching for faster performance

## 🚀 Important Commands

### Development

```bash
# Start the development server (requires dev client build)
npx expo start --dev-client

# Start with tunnel for remote testing
npx expo start --dev-client --tunnel

# Clear cache and start fresh
npx expo start --dev-client --clear
```

### Sanity CMS

```bash
# Navigate to sanity directory first
cd sanity

# Generate types after changing schema (recommended)
npm run typegen

# Or run commands separately:
npx sanity schema extract    # Extract schema to JSON
npx sanity typegen generate  # Generate TypeScript types

# Start Sanity Studio locally
npx sanity dev
```

> **Note:** Run `npm run typegen` after:
> - Changing any Sanity schema
> - Defining new GROQ queries (each query needs a unique name)

### EAS Build Commands

```bash
# Development build (for testing with dev client on mobile connect to laptop)
eas build --profile development --platform android
eas build --profile development --platform ios
npx expo start --dev-clien

# Preview build (for internal testing)
eas build --profile preview --platform android
eas build --profile preview --platform ios

# Production build (for app stores)
eas build --profile production --platform android
eas build --profile production --platform ios

# Build for all platforms
eas build --profile production --platform all
```

### EAS Submit (App Store/Play Store)

```bash
# Submit to Google Play Store
eas submit --platform android

# Submit to Apple App Store
eas submit --platform ios
```

### Other Useful Commands

```bash
# Install dependencies
npm install

# Run TypeScript type check
npx tsc --noEmit

# Update Expo SDK
npx expo install --fix

# Check for outdated packages
npm outdated

# Generate app icons and splash screens
npx expo-optimize
```

## 📁 Project Structure

```
FitFat2/
├── src/
│   ├── app/           # Expo Router screens
│   ├── components/    # Reusable components
│   ├── lib/           # Utilities & configs
│   └── store/         # State management
├── sanity/            # Sanity CMS studio
├── assets/            # Images, fonts, etc.
└── ...
```
