import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";

//client safe config to be used in the studio and the front-end
export const config = {
  projectId: "hfe964r3",
  dataset: "production",
  apiVersion: "2024-01-01",
  useCdn: false,
};

export const client = createClient(config);

//admin level client USED for backend operations only
//admin client for mutations and other admin tasks
export const adminConfig = {
  ...config,
  token: process.env.EXPO_PUBLIC_SANITY_API_TOKEN,
};
export const adminClient = createClient(adminConfig);

//image url builder
const builder = createImageUrlBuilder(client);

export const urlFor = (source: string) => builder.image(source);
