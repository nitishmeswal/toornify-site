import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  author,
  publishedTime,
  modifiedTime,
}) => {
  const location = useLocation();
  const baseUrl = 'https://sanity-react-one.vercel.app';
  
  const siteTitle = 'Toornify - Esports Tournaments & Competitive Platform';
  const defaultDescription = 'Join competitive esports tournaments, create brackets, manage teams, and compete in events. The ultimate platform for players and tournament organizers.';
  const defaultImage = `${baseUrl}/og-image.jpg`;
  
  const pageTitle = title ? `${title} | Toornify` : siteTitle;
  const pageDescription = description || defaultDescription;
  const pageImage = image || defaultImage;
  const pageUrl = url || `${baseUrl}${location.pathname}`;
  const pageKeywords = keywords || 'esports tournaments, competitive esports, brackets, esports platform, tournament organizer';

  useEffect(() => {
    // Update document title
    document.title = pageTitle;

    // Update or create meta tags
    const updateMetaTag = (property: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${property}"]`);
      
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, property);
        document.head.appendChild(element);
      }
      
      element.setAttribute('content', content);
    };

    // Primary meta tags
    updateMetaTag('title', pageTitle);
    updateMetaTag('description', pageDescription);
    updateMetaTag('keywords', pageKeywords);
    if (author) updateMetaTag('author', author);

    // Open Graph tags
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:url', pageUrl, true);
    updateMetaTag('og:title', pageTitle, true);
    updateMetaTag('og:description', pageDescription, true);
    updateMetaTag('og:image', pageImage, true);
    updateMetaTag('og:site_name', 'Toornify', true);
    if (publishedTime) updateMetaTag('article:published_time', publishedTime, true);
    if (modifiedTime) updateMetaTag('article:modified_time', modifiedTime, true);
    if (author) updateMetaTag('article:author', author, true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:url', pageUrl);
    updateMetaTag('twitter:title', pageTitle);
    updateMetaTag('twitter:description', pageDescription);
    updateMetaTag('twitter:image', pageImage);

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', pageUrl);

    // JSON-LD structured data for better SEO
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': type === 'article' ? 'Article' : 'WebPage',
      headline: pageTitle,
      description: pageDescription,
      image: pageImage,
      url: pageUrl,
      ...(author && { author: { '@type': 'Person', name: author } }),
      ...(publishedTime && { datePublished: publishedTime }),
      ...(modifiedTime && { dateModified: modifiedTime }),
    };

    let script = document.querySelector('script[type="application/ld+json"]');
    if (!script) {
      script = document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(structuredData);
  }, [pageTitle, pageDescription, pageImage, pageUrl, pageKeywords, type, author, publishedTime, modifiedTime]);

  return null;
};

export default SEO;
