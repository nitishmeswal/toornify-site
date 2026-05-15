import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loader } from '@/components/ui/Loader';
import { 
  FileText, 
  Users, 
  Trophy, 
  Settings, 
  ExternalLink, 
  RefreshCw,
  Database,
  BarChart3,
  BookOpen,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { sanityService } from '@/lib/services';

interface SanityStats {
  blogPosts: number;
  teamMembers: number;
  tournaments: number;
  pages: number;
}

export default function AdminPanel() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<SanityStats>({
    blogPosts: 0,
    teamMembers: 0,
    tournaments: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  // Check if user is admin
  useEffect(() => {
    if (!authLoading && user && user.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    fetchSanityStats();
  }, []);

  const fetchSanityStats = async () => {
    setIsLoading(true);
    setError(null);
    setConnectionStatus('checking');

    try {
      // Fetch data from Sanity to get counts
      const [blogPosts, teamMembers, tournaments] = await Promise.allSettled([
        sanityService.getAllBlogPosts(),
        sanityService.getTeamMembers(),
        sanityService.getAllTournaments(),
      ]);

      setStats({
        blogPosts: blogPosts.status === 'fulfilled' ? blogPosts.value.length : 0,
        teamMembers: teamMembers.status === 'fulfilled' ? teamMembers.value.length : 0,
        tournaments: tournaments.status === 'fulfilled' ? tournaments.value.length : 0,
        pages: 0, // We can add page count later
      });

      setConnectionStatus('connected');
    } catch (err: any) {
      console.error('Failed to fetch Sanity stats:', err);
      setError(err.message || 'Failed to connect to Sanity');
      setConnectionStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const sanityProjectId = import.meta.env.VITE_SANITY_PROJECT_ID;
  const sanityDataset = import.meta.env.VITE_SANITY_DATASET || 'production';
  const studioUrl = `https://www.sanity.io/manage/project/${sanityProjectId}`;

  const quickLinks = [
    {
      title: 'Sanity Studio',
      description: 'Manage all content in Sanity Studio',
      icon: Database,
      href: '/studio',
      color: 'from-purple-600 to-purple-700',
      internal: true,
    },
    {
      title: 'Blog Posts',
      description: 'Create and edit blog posts',
      icon: FileText,
      href: '/studio/structure/blog',
      color: 'from-blue-600 to-blue-700',
      internal: true,
    },
    {
      title: 'Team Members',
      description: 'Manage team member profiles',
      icon: Users,
      href: '/studio/structure/teamMember',
      color: 'from-green-600 to-green-700',
      internal: true,
    },
    {
      title: 'Settings',
      description: 'Configure site settings',
      icon: Settings,
      href: '/studio/structure/siteSettings',
      color: 'from-orange-600 to-orange-700',
      internal: true,
    },
  ];

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-[#1a1625] via-[#13111c] to-[#0f0b15]">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1a1625] via-[#13111c] to-[#0f0b15] py-12 px-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Admin Panel
              </h1>
              <p className="text-gray-400 text-lg">
                Manage your Sanity CMS content
              </p>
            </div>
            <Button
              onClick={fetchSanityStats}
              variant="outline"
              className="border-[#3d3551] hover:border-purple-500"
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          {/* Connection Status */}
          <Card className="bg-[#18152a] border-[#3d3551]">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                {connectionStatus === 'checking' && (
                  <>
                    <Loader size="sm" />
                    <span className="text-gray-300">Checking Sanity connection...</span>
                  </>
                )}
                {connectionStatus === 'connected' && (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-gray-300">
                      Connected to Sanity Project: <span className="text-purple-400 font-mono">{sanityProjectId}</span>
                    </span>
                  </>
                )}
                {connectionStatus === 'error' && (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-400">
                      Failed to connect to Sanity. Check your configuration.
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-[#1f1a2e] to-[#18152a] border-[#3d3551] hover:border-purple-500/50 transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <FileText className="w-8 h-8 text-purple-400" />
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{stats.blogPosts}</p>
                    <p className="text-sm text-gray-400">Blog Posts</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-[#1f1a2e] to-[#18152a] border-[#3d3551] hover:border-purple-500/50 transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Users className="w-8 h-8 text-blue-400" />
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{stats.teamMembers}</p>
                    <p className="text-sm text-gray-400">Team Members</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-[#1f1a2e] to-[#18152a] border-[#3d3551] hover:border-purple-500/50 transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Trophy className="w-8 h-8 text-green-400" />
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{stats.tournaments}</p>
                    <p className="text-sm text-gray-400">Tournaments</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-[#1f1a2e] to-[#18152a] border-[#3d3551] hover:border-purple-500/50 transition-all">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <BookOpen className="w-8 h-8 text-orange-400" />
                  <div className="text-right">
                    <p className="text-3xl font-bold text-white">{stats.pages}</p>
                    <p className="text-sm text-gray-400">Custom Pages</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        </div>

        {/* Quick Links */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                {link.internal ? (
                  <div
                    onClick={() => navigate(link.href)}
                    className="block cursor-pointer"
                  >
                    <Card className="bg-gradient-to-br from-[#1f1a2e] to-[#18152a] border-[#3d3551] hover:border-purple-500 transition-all group">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg bg-gradient-to-br ${link.color}`}>
                              <link.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-white group-hover:text-purple-400 transition-colors">
                                {link.title}
                              </CardTitle>
                              <CardDescription className="text-gray-400 mt-1">
                                {link.description}
                              </CardDescription>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  </div>
                ) : (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Card className="bg-gradient-to-br from-[#1f1a2e] to-[#18152a] border-[#3d3551] hover:border-purple-500 transition-all group cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-lg bg-gradient-to-br ${link.color}`}>
                              <link.icon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-white group-hover:text-purple-400 transition-colors">
                                {link.title}
                              </CardTitle>
                              <CardDescription className="text-gray-400 mt-1">
                                {link.description}
                              </CardDescription>
                            </div>
                          </div>
                          <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-400 transition-colors" />
                        </div>
                      </CardHeader>
                    </Card>
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Documentation & Resources */}
        <Card className="bg-gradient-to-br from-[#1f1a2e] to-[#18152a] border-[#3d3551]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              Documentation & Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <a
                href="https://www.sanity.io/docs"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-[#18152a] rounded-lg border border-[#3d3551] hover:border-purple-500 transition-all group"
              >
                <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-400" />
                <div>
                  <p className="text-white font-medium group-hover:text-purple-400 transition-colors">
                    Sanity Documentation
                  </p>
                  <p className="text-sm text-gray-400">Learn how to use Sanity CMS</p>
                </div>
              </a>

              <a
                href={studioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-[#18152a] rounded-lg border border-[#3d3551] hover:border-purple-500 transition-all group"
              >
                <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-400" />
                <div>
                  <p className="text-white font-medium group-hover:text-purple-400 transition-colors">
                    Project Settings
                  </p>
                  <p className="text-sm text-gray-400">Manage your Sanity project</p>
                </div>
              </a>

              <a
                href="https://www.sanity.io/docs/groq"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 bg-[#18152a] rounded-lg border border-[#3d3551] hover:border-purple-500 transition-all group"
              >
                <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-purple-400" />
                <div>
                  <p className="text-white font-medium group-hover:text-purple-400 transition-colors">
                    GROQ Query Language
                  </p>
                  <p className="text-sm text-gray-400">Learn GROQ for querying data</p>
                </div>
              </a>

              <div
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-3 p-4 bg-[#18152a] rounded-lg border border-[#3d3551] hover:border-purple-500 transition-all group cursor-pointer"
              >
                <BarChart3 className="w-5 h-5 text-gray-400 group-hover:text-purple-400" />
                <div>
                  <p className="text-white font-medium group-hover:text-purple-400 transition-colors">
                    User Dashboard
                  </p>
                  <p className="text-sm text-gray-400">View your main dashboard</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Info */}
        {connectionStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <Card className="bg-red-500/10 border-red-500/50">
              <CardHeader>
                <CardTitle className="text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Configuration Error
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-red-300 mb-4">
                  Unable to connect to Sanity. Please check your configuration:
                </p>
                <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-gray-300">
                  <p>VITE_SANITY_PROJECT_ID: {sanityProjectId || '<not set>'}</p>
                  <p>VITE_SANITY_DATASET: {sanityDataset}</p>
                </div>
                <p className="text-red-300 mt-4">
                  Make sure these environment variables are set in your <code className="bg-black/50 px-2 py-1 rounded">.env</code> file.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
