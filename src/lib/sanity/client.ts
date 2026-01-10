import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";
import Constants from "expo-constants";

// Get token from app config (works in production) or fallback to process.env (works in dev)
const sanityToken = Constants.expoConfig?.extra?.sanityApiToken || process.env.EXPO_PUBLIC_SANITY_API_TOKEN;

// Client safe config to be used in the studio and the front-end
export const config = {
  projectId: "hfe964r3",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
};

export const client = createClient(config);

// Admin client for mutations and other admin tasks
export const adminConfig = {
  ...config,
  token: sanityToken,
};
export const adminClient = createClient(adminConfig);

// Image url builder
const builder = createImageUrlBuilder(client);

export const urlFor = (source: string) => builder.image(source);

