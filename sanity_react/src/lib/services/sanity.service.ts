import { fetchFromSanity } from '@/lib/sanity-client';

// Types for Sanity content
export interface SanityBlogPost {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: {
    current: string;
  };
  excerpt?: string;
  content: any[]; // Portable Text
  author?: string;
  featuredImage?: any;
  categories?: string[];
  tags?: string[];
  modifiedAt?: string;
  publishedAt?: string;
  scheduledAt?: string;
  featured?: boolean;
}

export interface SanityNewsPost {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  title: string;
  slug: {
    current: string;
  };
  excerpt?: string;
  content: any[];
  category?: string;
  categories?: string[];
  featuredImage?: any;
  sourceUrl?: string;
  modifiedAt?: string;
  publishedAt?: string;
  scheduledAt?: string;
  featured?: boolean;
}

export interface SanityTeamMember {
  _id: string;
  name: string;
  role: string;
  bio?: string;
  image?: any;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface SanityTournament {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  description?: string;
  game: string;
  startDate: string;
  endDate?: string;
  entryFee?: number;
  prizePool?: number;
  maxParticipants?: number;
  status: 'upcoming' | 'active' | 'completed';
  image?: any;
  rules?: any[]; // Portable Text
}

export interface SanityPage {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
  content: any[]; // Portable Text
  seo?: {
    title?: string;
    description?: string;
    image?: any;
  };
}

/**
 * Sanity Service
 * Handles all data fetching from Sanity CMS
 */
export const sanityService = {
  /**
   * Blog Posts
   */
  async getAllBlogPosts(): Promise<SanityBlogPost[]> {
    const query = `*[
      _type in ["blog", "post"] &&
      (!defined(publishedAt) || publishedAt <= now()) &&
      (!defined(scheduledAt) || scheduledAt <= now())
    ] | order(coalesce(scheduledAt, publishedAt, _createdAt) desc) {
      _id,
      _createdAt,
      _updatedAt,
      title,
      slug,
      excerpt,
      content,
      author,
      featuredImage,
      categories,
      tags,
      modifiedAt,
      publishedAt,
      scheduledAt,
      featured
    }`;
    return fetchFromSanity<SanityBlogPost[]>(query);
  },

  async getBlogPost(slug: string): Promise<SanityBlogPost | null> {
    const query = `*[
      _type in ["blog", "post"] &&
      slug.current == $slug &&
      (!defined(publishedAt) || publishedAt <= now()) &&
      (!defined(scheduledAt) || scheduledAt <= now())
    ][0] {
      _id,
      _createdAt,
      _updatedAt,
      title,
      slug,
      excerpt,
      content,
      author,
      featuredImage,
      categories,
      tags,
      modifiedAt,
      publishedAt,
      scheduledAt,
      featured
    }`;
    return fetchFromSanity<SanityBlogPost | null>(query, { slug });
  },

  /**
   * News
   */
  async getAllNews(): Promise<SanityNewsPost[]> {
    const query = `*[
      _type == "news" &&
      (!defined(publishedAt) || publishedAt <= now()) &&
      (!defined(scheduledAt) || scheduledAt <= now())
    ] | order(coalesce(scheduledAt, publishedAt, _createdAt) desc) {
      _id,
      _createdAt,
      _updatedAt,
      title,
      slug,
      excerpt,
      content,
      category,
      "categories": coalesce(categories[]->title, categories),
      featuredImage,
      sourceUrl,
      modifiedAt,
      publishedAt,
      scheduledAt,
      featured
    }`;
    return fetchFromSanity<SanityNewsPost[]>(query);
  },

  async getNewsPost(slug: string): Promise<SanityNewsPost | null> {
    const query = `*[
      _type == "news" &&
      slug.current == $slug &&
      (!defined(publishedAt) || publishedAt <= now()) &&
      (!defined(scheduledAt) || scheduledAt <= now())
    ][0] {
      _id,
      _createdAt,
      _updatedAt,
      title,
      slug,
      excerpt,
      content,
      category,
      "categories": coalesce(categories[]->title, categories),
      featuredImage,
      sourceUrl,
      modifiedAt,
      publishedAt,
      scheduledAt,
      featured
    }`;
    return fetchFromSanity<SanityNewsPost | null>(query, { slug });
  },

  /**
   * Team Members
   */  /**
   * Team Members
   */
  async getTeamMembers(): Promise<SanityTeamMember[]> {
    const query = `*[_type == "teamMember"] | order(order asc) {
      _id,
      name,
      role,
      bio,
      image,
      socialLinks
    }`;
    return fetchFromSanity<SanityTeamMember[]>(query);
  },

  /**
   * Tournaments (if you're storing them in Sanity)
   */
  async getAllTournaments(): Promise<SanityTournament[]> {
    const query = `*[_type == "tournament"] | order(startDate desc) {
      _id,
      title,
      slug,
      description,
      game,
      startDate,
      endDate,
      entryFee,
      prizePool,
      maxParticipants,
      status,
      image,
      rules
    }`;
    return fetchFromSanity<SanityTournament[]>(query);
  },

  async getTournament(slug: string): Promise<SanityTournament | null> {
    const query = `*[_type == "tournament" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      description,
      game,
      startDate,
      endDate,
      entryFee,
      prizePool,
      maxParticipants,
      status,
      image,
      rules
    }`;
    return fetchFromSanity<SanityTournament | null>(query, { slug });
  },

  /**
   * Pages (for custom pages like About, FAQ, etc.)
   */
  async getPage(slug: string): Promise<SanityPage | null> {
    const query = `*[_type == "page" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      content,
      seo
    }`;
    return fetchFromSanity<SanityPage | null>(query, { slug });
  },

  /**
   * Site Settings (global config)
   */
  async getSiteSettings(): Promise<any> {
    const query = `*[_type == "siteSettings"][0] {
      title,
      description,
      logo,
      socialLinks,
      contactEmail
    }`;
    return fetchFromSanity<any>(query);
  },
};

export default sanityService;
