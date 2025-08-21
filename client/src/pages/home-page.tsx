import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PostWithDetails } from "@shared/schema";
import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";
import PostCard from "@/components/post-card";
import CreatePostModal from "@/components/create-post-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, TrendingUp, Lightbulb, Heart } from "lucide-react";

export default function HomePage() {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [postType, setPostType] = useState<'NORMAL' | 'LOST' | 'FOUND'>('NORMAL');
  const [offset, setOffset] = useState(0);

  const { data: posts = [], isLoading } = useQuery<PostWithDetails[]>({
    queryKey: ["/api/feed", { limit: 20, offset }],
    queryFn: async () => {
      const res = await fetch(`/api/feed?limit=20&offset=${offset}`, {
        credentials: "include",
      });
      return res.json();
    },
  });

  const { data: lostFoundPosts = [] } = useQuery<PostWithDetails[]>({
    queryKey: ["/api/lost-found"],
    queryFn: async () => {
      const res = await fetch("/api/lost-found", {
        credentials: "include",
      });
      return res.json();
    },
  });

  const loadMorePosts = () => {
    setOffset(prev => prev + 20);
  };

  return (
    <div className="min-h-screen">
      <Navbar 
        onCreatePost={() => {
          setPostType('NORMAL');
          setShowCreatePost(true);
        }}
        onCreateLostPost={() => {
          setPostType('LOST');
          setShowCreatePost(true);
        }}
        onCreateFoundPost={() => {
          setPostType('FOUND');
          setShowCreatePost(true);
        }}
      />
      
      <div className="pt-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Feed */}
            <main className="flex-1 space-y-6">
              {/* Create Post Trigger */}
              <Card>
                <CardContent className="p-6">
                  <button
                    onClick={() => setShowCreatePost(true)}
                    className="w-full flex items-center space-x-4 text-left"
                  >
                    <div className="w-12 h-12 bg-brand-green text-white rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6" />
                    </div>
                    <div className="flex-1 bg-gray-100 hover:bg-gray-200 rounded-full py-3 px-4 text-gray-600 transition-colors">
                      What's your pet up to today?
                    </div>
                    <Button className="brand-button-primary rounded-full px-6">
                      Share
                    </Button>
                  </button>
                </CardContent>
              </Card>

              {/* Posts Feed */}
              {isLoading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-24"></div>
                              <div className="h-3 bg-gray-200 rounded w-32"></div>
                            </div>
                          </div>
                          <div className="h-96 bg-gray-200 rounded-lg"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  {posts.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          No posts yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                          Be the first to share your pet's story!
                        </p>
                        <Button 
                          onClick={() => setShowCreatePost(true)}
                          className="brand-button-primary"
                        >
                          Create Your First Post
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-6">
                      {posts.map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                      
                      {posts.length >= 20 && (
                        <div className="text-center py-8">
                          <Button 
                            onClick={loadMorePosts}
                            className="brand-button-primary px-8 py-3"
                          >
                            Load More Posts
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </main>

            {/* Right Sidebar */}
            <aside className="lg:w-80 space-y-6">
              {/* Lost & Found Map */}
              <Card>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Lost & Found Nearby</CardTitle>
                    <Button variant="ghost" size="sm" asChild>
                      <a href="/lost-found" className="text-brand-green hover:text-brand-green-600">
                        View All
                      </a>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-48 rounded-lg bg-gradient-to-br from-green-100 to-blue-100 mb-4 flex items-center justify-center">
                    <div className="text-center text-gray-600">
                      <MapPin className="w-8 h-8 mx-auto mb-2" />
                      <p>Interactive map coming soon</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-brand-yellow rounded-full"></div>
                        <span>{lostFoundPosts.filter(p => p.status === 'LOST').length} Lost pets</span>
                      </div>
                      <span className="text-gray-500">nearby</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-brand-azure rounded-full"></div>
                        <span>{lostFoundPosts.filter(p => p.status === 'FOUND').length} Found pets</span>
                      </div>
                      <span className="text-gray-500">nearby</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pet Care Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Pet Care Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Lightbulb className="w-5 h-5 text-brand-green mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm mb-1">Daily Exercise</h4>
                        <p className="text-gray-600 text-xs">
                          Dogs need at least 30 minutes of exercise daily for optimal health.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <Heart className="w-5 h-5 text-brand-azure mt-0.5" />
                      <div>
                        <h4 className="font-medium text-sm mb-1">Regular Checkups</h4>
                        <p className="text-gray-600 text-xs">
                          Schedule annual vet visits to keep your pet healthy.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </div>

      <CreatePostModal 
        open={showCreatePost} 
        onClose={() => setShowCreatePost(false)}
        defaultStatus={postType}
      />
    </div>
  );
}
