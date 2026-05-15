import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url';
import { API_CONFIG } from './api-config';

// Sanity client configuration
export const sanityClient = createClient({
  projectId: API_CONFIG.SANITY.PROJECT_ID || 'gblobdeg',
  dataset: API_CONFIG.SANITY.DATASET || 'production',
  apiVersion: API_CONFIG.SANITY.API_VERSION || '2025-03-15',
  useCdn: true, // Set to false if you need fresh data
  token: import.meta.env.VITE_SANITY_TOKEN, // Only needed for write operations
});

// Image URL builder
const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// Helper function to fetch data with error handling
export async function fetchFromSanity<T>(query: string, params: Record<string, any> = {}): Promise<T> {
  try {
    const result = await sanityClient.fetch<T>(query, params);
    return result;
  } catch (error) {
    console.error('Sanity fetch error:', error);
    throw error;
  }
}
