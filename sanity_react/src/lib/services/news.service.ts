import { api } from '@/lib/api-client';
import { API_CONFIG } from '@/lib/api-config';

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  url: string;
  image: string;
  publishedAt: string;
  lang: string;
  source: {
    id: string;
    name: string;
    url: string;
    country: string;
  };
}

export interface NewsQueryParams {
  query: string;
  lang?: string;
  country?: string;
  limit?: number;
  sortBy?: 'publishedAt' | 'relevance';
}

export interface NewsResponse {
  statusCode: number;
  data: {
    articles: NewsArticle[];
  };
  message: string;
  success: boolean;
}

export const newsService = {
  /**
   * Fetch news articles
   */
  async getNews(params: NewsQueryParams): Promise<NewsArticle[]> {
    try {
      const queryParams = new URLSearchParams();
      queryParams.set('query', params.query);
      
      if (params.lang) queryParams.set('lang', params.lang);
      if (params.country) queryParams.set('country', params.country);
      if (params.limit) queryParams.set('limit', params.limit.toString());
      if (params.sortBy) queryParams.set('sortBy', params.sortBy);

      const response = await api.get<NewsResponse>(
        `${API_CONFIG.NEWS.GET_NEWS}?${queryParams.toString()}`
      );
      
      return response.data.data.articles;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Fetch esports news articles
   */
  async getGamingNews(limit: number = 10): Promise<NewsArticle[]> {
    return this.getNews({
      query: 'esports OR tournaments OR competitive',
      lang: 'en',
      limit,
      sortBy: 'publishedAt',
    });
  },

  /**
   * Fetch esports news
   */
  async getEsportsNews(limit: number = 10): Promise<NewsArticle[]> {
    return this.getNews({
      query: 'esports OR competitive OR tournament',
      lang: 'en',
      limit,
      sortBy: 'publishedAt',
    });
  },

  /**
   * Fetch news by category
   */
  async getNewsByCategory(category: string, limit: number = 10): Promise<NewsArticle[]> {
    return this.getNews({
      query: category,
      lang: 'en',
      limit,
      sortBy: 'publishedAt',
    });
  },
};

export default newsService;
