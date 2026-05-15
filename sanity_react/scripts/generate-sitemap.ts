import { sanityService } from '../src/lib/services/sanity.service';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://sanity-react-one.vercel.app'; // Update with your production URL

interface SitemapPage {
  url: string;
  priority: string;
  changefreq: string;
  lastmod?: string;
}

async function generateSitemap() {
  console.log('Generating sitemap...');

  try {
    // Fetch all blog posts
    const blogs = await sanityService.getAllBlogPosts();
    
    // Static pages
    const staticPages: SitemapPage[] = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/tournaments', priority: '0.9', changefreq: 'daily' },
      { url: '/teams', priority: '0.9', changefreq: 'daily' },
      { url: '/brackets', priority: '0.8', changefreq: 'daily' },
      { url: '/games', priority: '0.8', changefreq: 'weekly' },
      { url: '/blogs', priority: '0.7', changefreq: 'weekly' },
      { url: '/news', priority: '0.7', changefreq: 'daily' },
      { url: '/about', priority: '0.6', changefreq: 'monthly' },
      { url: '/signin', priority: '0.5', changefreq: 'monthly' },
      { url: '/signup', priority: '0.5', changefreq: 'monthly' },
    ];

    // Dynamic blog pages
    const blogPages: SitemapPage[] = blogs.map(blog => ({
      url: `/blogs/${blog.slug.current}`,
      priority: '0.7',
      changefreq: 'monthly',
      lastmod: new Date(blog._updatedAt).toISOString().split('T')[0],
    }));

    // Combine all pages
    const allPages = [...staticPages, ...blogPages];

    // Generate sitemap XML
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${allPages
  .map(
    (page) => `  
  <url>
    <loc>${BASE_URL}${page.url}</loc>
    ${page.lastmod ? `<lastmod>${page.lastmod}</lastmod>` : '<lastmod>' + new Date().toISOString().split('T')[0] + '</lastmod>'}
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
  
</urlset>`;

    // Write sitemap to public folder
    const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap);

    console.log(`✅ Sitemap generated successfully with ${allPages.length} URLs`);
    console.log(`   - Static pages: ${staticPages.length}`);
    console.log(`   - Blog posts: ${blogPages.length}`);
    console.log(`   📄 Location: ${sitemapPath}`);
  } catch (error) {
    console.error('❌ Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();
