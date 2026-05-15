import { type ClassValue, clsx } from "clsx"
import { API_CONFIG } from "@/lib/api-config"

const CHARACTER_AVATAR_IMAGES = [
  '/Character Avatar Ai-01.png',
  '/Character Avatar Ai-02.png',
  '/Character Avatar Ai-03.png',
  '/Character Avatar Ai-04.png',
  '/Character Avatar Ai-06.png',
  '/Character Avatar Ai-07.png',
]

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

/**
 * Construct a full image URL from a relative path or return the URL as-is if it's already absolute
 * @param imagePath - The image path (relative or absolute)
 * @returns Full image URL or the original path if it's already absolute
 */
export function getImageUrl(imagePath: string | undefined | null): string | undefined {
  if (!imagePath || typeof imagePath !== 'string') return undefined;

  const trimmedPath = imagePath.trim();
  if (!trimmedPath) return undefined;

  // Return as-is if it's already a full URL or data URI
  if (trimmedPath.startsWith('http://') || trimmedPath.startsWith('https://') || trimmedPath.startsWith('data:')) {
    return trimmedPath;
  }

  // Construct full URL for relative paths
  if (trimmedPath.startsWith('/')) {
    return `${API_CONFIG.BASE_URL}${trimmedPath}`;
  }

  // For other relative paths, prepend base URL
  return `${API_CONFIG.BASE_URL}/${trimmedPath}`;
}

/**
 * Returns a randomized character avatar image path from local public assets.
 * If a seed is provided, the selected avatar stays stable for that seed.
 */
export function getCharacterAvatar(seed?: string | number): string {
  if (seed === undefined || seed === null || seed === '') {
    const randomIndex = Math.floor(Math.random() * CHARACTER_AVATAR_IMAGES.length)
    return CHARACTER_AVATAR_IMAGES[randomIndex]
  }

  const value = String(seed)
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  const index = Math.abs(hash) % CHARACTER_AVATAR_IMAGES.length
  return CHARACTER_AVATAR_IMAGES[index]
}

/**
 * Returns the user image URL when available, otherwise a character avatar.
 */
export function getAvatarUrl(imagePath: string | undefined | null, seed?: string | number): string {
  return getImageUrl(imagePath) ?? getCharacterAvatar(seed)
}

/**
 * Return the preferred image source for a team-like object.
 * Preference order: explicit base64/data URI -> absolute URL -> other known fields (logo_url, teamIcon)
 */
export function getPreferredTeamLogo(team: any): string | undefined {
  if (!team) return undefined;
  const candidates: (string | undefined)[] = [team.logo, (team as any).logo_url, team.teamIcon];

  let fallback: string | undefined;
  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== 'string') continue;
    const value = candidate.trim();
    if (!value) continue;

    // Prefer data URIs (base64)
    if (value.startsWith('data:')) return value;

    // Accept http(s) URLs immediately
    if (value.startsWith('http://') || value.startsWith('https://')) return value;

    // Accept root-relative paths immediately
    if (value.startsWith('/')) return getImageUrl(value);

    // otherwise remember the first non-empty candidate as fallback
    if (!fallback) fallback = getImageUrl(value);
  }

  return fallback;
}
