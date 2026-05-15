import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, ArrowLeft, Clock, Tag } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Loader } from "@/components/ui/Loader";
import { BackgroundEffects } from "@/components/BackgroundEffects";
import SEO from "@/components/SEO";
import { sanityService, type SanityBlogPost } from "@/lib/services/sanity.service";
import { urlFor } from "@/lib/sanity-client";
import { PortableText } from "@/components/PortableText";
import { getCharacterAvatar } from "@/lib/utils";

export function BlogDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<SanityBlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlogPost = async () => {
      if (!slug) return;

      try {
        setLoading(true);
        console.log('Fetching blog post with slug:', slug);
        const blogPost = await sanityService.getBlogPost(slug);
        console.log('Fetched blog post:', blogPost);
        
        if (!blogPost) {
          setError('Blog post not found');
        } else {
          setPost(blogPost);
        }
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [slug]);

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

    const readTime = Math.ceil(wordCount / 200);
    return `${readTime} min read`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1a1625] via-[#13111c] to-[#0f0b15] flex items-center justify-center">
        <BackgroundEffects />
        <Loader size="lg" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen min-w-screen bg-gradient-to-b from-[#1a1625] via-[#13111c] to-[#0f0b15] py-12 px-4">
        <BackgroundEffects />
        <div className="min-w-screen mx-auto text-center relative z-10">
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-6 mb-8">
            <p className="text-red-400">{error || 'Blog post not found'}</p>
          </div>
          <Button
            onClick={() => navigate('/blogs')}
            variant="outline"
            className="border-[#3d3551] hover:border-purple-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blogs
          </Button>
        </div>
      </div>
    );
  }

  const publishDate = (post.modifiedAt || post._updatedAt || post.publishedAt || post.scheduledAt)
    ? new Date(post.modifiedAt || post._updatedAt || post.publishedAt || post.scheduledAt || '').toLocaleDateString('en-US', {
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      })
    : new Date(post._createdAt).toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
  const publishLabel = (post.modifiedAt || post._updatedAt) ? 'Updated' : 'Published';

  const readTime = estimateReadTime(post.content);
  
  // Get image URL for SEO
  const imageUrl = post.featuredImage 
    ? urlFor(post.featuredImage).width(1200).height(630).url()
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1625] via-[#13111c] to-[#0f0b15] py-12 px-4 relative overflow-hidden">
      <SEO
        title={post.title}
        description={post.excerpt || `Read ${post.title} on Toornify`}
        keywords={post.tags?.join(', ')}
        image={imageUrl}
        type="article"
        author={post.author}
        publishedTime={post.publishedAt || post._createdAt}
        modifiedTime={post.modifiedAt || post._updatedAt}
      />
      <BackgroundEffects />
      
      <div className="max-w-screen mx-auto relative z-10">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Button
            onClick={() => navigate('/blogs')}
            variant="outline"
            className="border-[#3d3551] hover:border-purple-500"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blogs
          </Button>
        </motion.div>

        {/* Article Header */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-b from-[#1f1a2e] to-[#18152a] border border-[#3d3551] rounded-2xl overflow-hidden backdrop-blur-sm"
        >
          {/* Featured Image */}
          {post.featuredImage && (
            <div className="relative h-max overflow-hidden">
              <img
                src={urlFor(post.featuredImage).width(1200).height(600).url()}
                alt={post.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#18152a] to-transparent" />
            </div>
          )}

          {/* Content */}
          <div className="p-8 md:p-12">
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-gray-400">
              {post.categories && post.categories.length > 0 && (
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                  {post.categories[0]}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {publishLabel}: {publishDate}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {readTime}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Author */}
            <div className="flex items-center gap-3 mb-8 pb-8 border-b border-[#3d3551]">
              <img
                src={getCharacterAvatar(post.author || post._id)}
                alt={post.author || 'Anonymous'}
                className="h-12 w-12 rounded-full object-cover border border-purple-400/30"
              />
              <div>
                <p className="text-white font-medium">{post.author || 'Anonymous'}</p>
                <p className="text-sm text-gray-400">Author</p>
              </div>
            </div>

            {/* Excerpt */}
            {post.excerpt && (
              <div className="text-xl text-gray-300 mb-8 leading-relaxed italic border-l-4 border-purple-500 pl-6">
                {post.excerpt}
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-invert prose-lg max-w-none">
              <PortableText value={post.content} />
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-[#3d3551]">
                <div className="flex flex-wrap items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#1f1a2e] border border-[#3d3551] text-gray-300 rounded-full text-sm hover:border-purple-500 transition-colors cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.article>

        {/* Back Button Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 text-center"
        >
          <Button
            onClick={() => navigate('/blogs')}
            className="bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] hover:from-[#A78BFA] hover:to-[#7C3AED]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Blogs
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
