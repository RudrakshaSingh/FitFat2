export default {
  expo: {
    scheme: "acme",
    userInterfaceStyle: "light",
    orientation: "default",
    name: "FitFat2",
    slug: "FitFat2",
    icon: "./assets/app.png",
    splash: {
      image: "./assets/app.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    web: {
      output: "server",
    },
    android: {
      permissions: ["android.permission.ACTIVITY_RECOGNITION"],
      package: "com.rudrakshasingh.FitFat2",
      adaptiveIcon: {
        foregroundImage: "./assets/app.png",
        backgroundColor: "#ffffff",
      },
    },
    plugins: [
      "expo-router",
      "expo-web-browser",
      [
        "expo-sensors",
        {
          motionPermission:
            "Allow $(PRODUCT_NAME) to access your device motion for step counting.",
        },
      ],
    ],
    extra: {
      eas: {
        projectId: "efd718ad-95ca-420d-9d58-facc4ae8ffae",
      },
      // These will be populated from environment variables during EAS build
      clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
      sanityApiToken: process.env.EXPO_PUBLIC_SANITY_API_TOKEN,
      groqApiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY,
      rapidApiKey: process.env.EXPO_PUBLIC_RAPIDAPI_KEY,
      rapidApiHost: process.env.EXPO_PUBLIC_RAPIDAPI_HOST,
    },
  },
};
