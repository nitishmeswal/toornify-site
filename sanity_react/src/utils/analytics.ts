/**
 * Google Analytics utility functions
 * Tracks page views, events, and user interactions
 */

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

const GA_TRACKING_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX'; // Replace with your actual GA4 Measurement ID

/**
 * Check if Google Analytics is loaded and available
 */
export const isGALoaded = (): boolean => {
  return typeof window.gtag !== 'undefined';
};

/**
 * Track page view
 * @param url - Page URL or path
 * @param title - Page title
 */
export const trackPageView = (url: string, title?: string): void => {
  if (!isGALoaded()) return;
  
  window.gtag?.('config', GA_TRACKING_ID, {
    page_path: url,
    page_title: title,
  });
};

/**
 * Track custom event
 * @param action - Event action (e.g., 'click', 'signup', 'purchase')
 * @param category - Event category (e.g., 'Tournament', 'User', 'Navigation')
 * @param label - Event label (optional)
 * @param value - Event value (optional)
 */
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
): void => {
  if (!isGALoaded()) return;
  
  window.gtag?.('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

/**
 * Track user signup
 * @param method - Signup method (e.g., 'email', 'google', 'discord')
 */
export const trackSignup = (method: string): void => {
  trackEvent('sign_up', 'User', method);
};

/**
 * Track user login
 * @param method - Login method
 */
export const trackLogin = (method: string): void => {
  trackEvent('login', 'User', method);
};

/**
 * Track tournament creation
 * @param tournamentName - Name of the tournament
 */
export const trackTournamentCreate = (tournamentName: string): void => {
  trackEvent('create_tournament', 'Tournament', tournamentName);
};

/**
 * Track tournament join/register
 * @param tournamentId - Tournament ID
 */
export const trackTournamentJoin = (tournamentId: string): void => {
  trackEvent('join_tournament', 'Tournament', tournamentId);
};

/**
 * Track team creation
 * @param teamName - Name of the team
 */
export const trackTeamCreate = (teamName: string): void => {
  trackEvent('create_team', 'Team', teamName);
};

/**
 * Track bracket creation
 * @param bracketType - Type of bracket
 */
export const trackBracketCreate = (bracketType: string): void => {
  trackEvent('create_bracket', 'Bracket', bracketType);
};

/**
 * Track search query
 * @param searchTerm - Search term
 * @param category - Search category (e.g., 'tournaments', 'teams', 'games')
 */
export const trackSearch = (searchTerm: string, category?: string): void => {
  trackEvent('search', 'Search', `${category || 'global'}: ${searchTerm}`);
};

/**
 * Track social share
 * @param method - Share method (e.g., 'facebook', 'twitter', 'copy_link')
 * @param contentType - Type of content being shared
 */
export const trackShare = (method: string, contentType: string): void => {
  trackEvent('share', 'Social', `${method} - ${contentType}`);
};

/**
 * Track error
 * @param errorMessage - Error message
 * @param errorCategory - Error category
 */
export const trackError = (errorMessage: string, errorCategory: string): void => {
  trackEvent('error', 'Error', `${errorCategory}: ${errorMessage}`);
};

/**
 * Track timing/performance
 * @param name - Name of the metric
 * @param value - Time in milliseconds
 * @param category - Category
 */
export const trackTiming = (name: string, value: number, category: string): void => {
  if (!isGALoaded()) return;
  
  window.gtag?.('event', 'timing_complete', {
    name: name,
    value: value,
    event_category: category,
  });
};

/**
 * Set user properties
 * @param properties - User properties object
 */
export const setUserProperties = (properties: Record<string, any>): void => {
  if (!isGALoaded()) return;
  
  window.gtag?.('set', 'user_properties', properties);
};

/**
 * Track outbound link click
 * @param url - External URL
 */
export const trackOutboundLink = (url: string): void => {
  trackEvent('click', 'Outbound Link', url);
};
