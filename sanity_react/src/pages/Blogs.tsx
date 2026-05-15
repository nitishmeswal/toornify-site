import { motion } from "framer-motion";
import { BookOpen, Calendar, User, ArrowRight, ChevronDown, Clock, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { useNavigate } from "react-router-dom";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import SEO from "@/components/SEO";
import { sanityService, type SanityBlogPost } from "@/lib/services/sanity.service";
import { urlFor } from "@/lib/sanity-client";
import { getCharacterAvatar } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useIsMobile } from "@/hooks/useMediaQuery";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  dateLabel: string;
  category: string;
  featured?: boolean;
  image?: string;
  readTime: string;
}

export function Blogs() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Get unique categories from posts
  const categories = ['All', ...Array.from(new Set(posts.map(post => post.category).filter(Boolean)))];

  // Fetch blogs from Sanity
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        console.log('Fetching blogs from Sanity...');
        const sanityPosts = await sanityService.getAllBlogPosts();
        console.log('Fetched posts:', sanityPosts);
        console.log('Number of posts:', sanityPosts?.length || 0);
        
        if (!sanityPosts || sanityPosts.length === 0) {
          console.warn('No blog posts found in Sanity');
          setPosts([]);
          setError(null);
          setLoading(false);
          return;
        }
        
        // Transform Sanity posts to BlogPost format
        const transformedPosts: BlogPost[] = sanityPosts.map((post: SanityBlogPost) => ({
          id: post._id,
          slug: post.slug?.current || '',
          title: post.title,
          excerpt: post.excerpt || '',
          author: post.author || 'Anonymous',
          dateLabel: (post.modifiedAt || post._updatedAt) ? 'Updated' : 'Published',
          date: (post.modifiedAt || post._updatedAt || post.publishedAt || post.scheduledAt)
            ? new Date(post.modifiedAt || post._updatedAt || post.publishedAt || post.scheduledAt || '').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : new Date(post._createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          category: post.categories?.[0] || 'General',
          featured: !!post.featured,
          image: post.featuredImage ? urlFor(post.featuredImage).width(800).height(400).url() : undefined,
          readTime: estimateReadTime(post.content),
        }));

        console.log('Transformed posts:', transformedPosts);
        setPosts(transformedPosts);
        setError(null);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        console.error('Error details:', err instanceof Error ? err.message : err);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Estimate read time based on content
  const estimateReadTime = (content: any[]): string => {
    if (!content || content.length === 0) return '5 min read';
    
    const wordCount = content.reduce((count, block) => {
      if (block._type === 'block' && block.children) {
        return count + block.children.reduce((acc: number, child: any) => {
          return acc + (child.text ? child.text.split(' ').length : 0);
        }, 0);
      }
      return count;
    }, 0);

    const readTime = Math.ceil(wordCount / 200); // Average reading speed: 200 words per minute
    return `${readTime} min read`;
  };

  // Filter posts by category
  const filteredPosts = selectedCategory === 'All' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  // Featured logic: prioritize explicitly featured post, else fallback to first item
  const featuredPost = filteredPosts.find((post) => post.featured) || filteredPosts[0] || null;
  const gridPosts = featuredPost
    ? filteredPosts.filter((post) => post.id !== featuredPost.id)
    : filteredPosts;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1625] via-[#13111c] to-[#0f0b15] py-12 px-4 relative overflow-hidden">
      <SEO
        title="Gaming Blog & Esports Insights"
        description="Latest news, strategies, and insights from the world of competitive gaming. Read about tournaments, teams, and gaming trends."
        keywords="gaming blog, esports news, tournament insights, competitive gaming articles, gaming strategies"
      />
      <BackgroundEffects />
      <div className="max-w-[1920px] mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Blog & Insights
          </h1>
          <p className="text-gray-400 text-lg">
            Latest news, strategies, and insights from the world of competitive gaming
          </p>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-3 mb-8">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === selectedCategory ? 'default' : 'outline'}
              className={
                category === selectedCategory
                  ? 'bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#7C3AED] hover:to-[#5B21B6] text-white border-0 shadow-lg shadow-purple-500/50'
                  : 'border-[#3d3551] hover:border-purple-500 hover:bg-purple-500/10 text-gray-300 hover:text-white transition-all'
              }
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader size="lg" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 mb-8">
            <p className="text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* No posts state */}
        {!loading && !error && filteredPosts.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="h-24 w-24 text-purple-400/50 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No blog posts yet</h3>
            <p className="text-gray-400 mb-4">
              {selectedCategory === 'All' 
                ? 'Get started by creating your first blog post in Sanity Studio.' 
                : `No posts found in the "${selectedCategory}" category.`}
            </p>
            {selectedCategory === 'All' && (
              <Button
                onClick={() => window.open('/studio', '_blank')}
                className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#7C3AED]"
              >
                Open Sanity Studio
              </Button>
            )}
            {selectedCategory !== 'All' && (
              <Button
                onClick={() => setSelectedCategory('All')}
                variant="outline"
                className="border-[#3d3551] hover:border-purple-500"
              >
                View All Categories
              </Button>
            )}
          </div>
        )}

        {/* Content */}
        {!loading && !error && filteredPosts.length > 0 && (
          <>
            {/* Featured Post */}
            {featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
            onClick={() => navigate(`/blogs/${featuredPost.slug}`)}
          >
            <Card className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] overflow-hidden group cursor-pointer backdrop-blur-sm">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto overflow-hidden">
                  {featuredPost.image ? (
                    <img
                      src={featuredPost.image}
                      alt={featuredPost.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1a1625] to-[#0f0b15] flex items-center justify-center">
                      <BookOpen className="h-24 w-24 text-purple-400/50" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white text-xs font-medium rounded-full">
                      Featured
                    </span>
                  </div>
                </div>
                <CardContent className="p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4 text-sm text-gray-400">
                    <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded">
                      {featuredPost.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {featuredPost.dateLabel}: {featuredPost.date}
                    </span>
                    <span>{featuredPost.readTime}</span>
                  </div>
                  <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
                    {featuredPost.title}
                  </h2>
                  <p className="text-gray-400 mb-6">{featuredPost.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={getCharacterAvatar(featuredPost.author || featuredPost.id)}
                        alt={featuredPost.author}
                        className="h-10 w-10 rounded-full object-cover border border-purple-400/30"
                      />
                      <div>
                        <p className="text-white font-medium">{featuredPost.author}</p>
                      </div>
                    </div>
                    <Button 
                      className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#7C3AED]"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/blogs/${featuredPost.slug}`);
                      }}
                    >
                      Read More <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {gridPosts.map((post, index) => (
            <BlogCard key={post.id} post={post} index={index} />
          ))}
        </div>
          </>
        )}
      </div>
    </div>
  );
}

function BlogCard({ post, index }: { post: BlogPost; index: number }) {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);

  // Desktop: hover-driven (CSS handles glow + collapse). Mobile: tap to toggle.
  const handleToggle = () => {
    if (isMobile) setIsOpen((prev) => !prev);
  };

  const handleReadMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/blogs/${post.slug}`);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.08 }}
      onMouseEnter={() => !isMobile && setIsOpen(true)}
      onMouseLeave={() => !isMobile && setIsOpen(false)}
      className="self-start"
    >
      <Card
        className={`neon-card ${isOpen ? "is-active" : ""} border-0 overflow-hidden cursor-pointer group`}
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-label={`${post.title} — ${isMobile ? "tap to expand" : "hover to expand"}`}
        onClick={handleToggle}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            isMobile ? setIsOpen((p) => !p) : navigate(`/blogs/${post.slug}`);
          }
        }}
      >
        {/* ALWAYS VISIBLE: title + category + toggle hint (preserves SEO/scan) */}
        <div className="relative z-10 p-5 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 text-[11px] font-bold uppercase tracking-wider rounded border border-purple-500/30">
                {post.category}
              </span>
              <span className="flex items-center gap-1 text-[11px] text-gray-400 uppercase tracking-wider">
                <Clock className="h-3 w-3" />
                {post.readTime}
              </span>
            </div>
            <h3 className="text-white text-lg font-bold leading-tight tracking-tight group-hover:text-purple-300 transition-colors line-clamp-2">
              {post.title}
            </h3>
          </div>
          <div
            className={`flex-shrink-0 w-8 h-8 rounded-md bg-purple-500/15 border border-purple-500/40 flex items-center justify-center transition-transform duration-300 ${
              isOpen ? "rotate-180 bg-purple-500/30" : ""
            }`}
            aria-hidden="true"
          >
            <ChevronDown className="h-4 w-4 text-purple-300" />
          </div>
        </div>

        {/* COLLAPSIBLE: image + excerpt + meta + CTA */}
        <div className={`collapse-grid ${isOpen ? "is-open" : ""} relative z-10`}>
          <div className="collapse-inner">
            <div className="relative h-44 overflow-hidden mx-5 rounded-md border border-[#3d3551]/60">
              {post.image ? (
                <img
                  src={post.image}
                  alt={post.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1f1a2e] to-[#0f0b15] flex items-center justify-center">
                  <BookOpen className="h-14 w-14 text-purple-400/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f0b15] via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-sm rounded border border-purple-500/30">
                <Zap className="h-3 w-3 text-purple-300" />
                <span className="text-[10px] text-purple-200 font-bold uppercase tracking-wider">
                  Esports
                </span>
              </div>
            </div>

            <CardContent className="pt-4 pb-5 px-5">
              <p className="text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3">
                {post.excerpt}
              </p>

              <div className="flex items-center justify-between gap-3 mb-4 pb-4 border-b border-[#3d3551]/60">
                <div className="flex items-center gap-2 min-w-0">
                  <img
                    src={getCharacterAvatar(post.author || post.id)}
                    alt={post.author}
                    className="h-8 w-8 flex-shrink-0 rounded-full object-cover border border-purple-400/30"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-white text-xs font-semibold truncate flex items-center gap-1">
                      <User className="h-3 w-3 text-purple-400" />
                      {post.author}
                    </span>
                    <span className="text-gray-500 text-[10px] flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" />
                      {post.dateLabel}: {post.date}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleReadMore}
                className="w-full bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#7C3AED] text-white font-bold uppercase tracking-wider text-xs h-10 shadow-lg shadow-purple-500/30 border border-purple-400/30"
              >
                Read Full Drop
                <ArrowRight className="ml-2 h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </div>
        </div>
      </Card>
    </motion.article>
  );
}
