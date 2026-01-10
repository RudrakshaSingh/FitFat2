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

use npx sanity schema extract
whenever you change sanity schema
npx sanity typegen generate

made automatic cmd npm run typegen in cd sanity

run this even after defining query grok and need to create query with unique name each type

### imp
eas build --profile development --platform android
The command eas build --profile development --platform android will initiate a build of your Expo project on the Expo Application Services (EAS) cloud servers, specifically for the Android platform using the development build profile. 
just run on laptop while debugging
npx expo start --dev-client