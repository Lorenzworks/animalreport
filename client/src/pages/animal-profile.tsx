import { useParams } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimalWithStats, PostWithDetails } from "@shared/schema";
import Navbar from "@/components/navbar";
import PostCard from "@/components/post-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, Users, Camera, UserPlus, Calendar, MapPin } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AnimalProfile() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: animal, isLoading: animalLoading } = useQuery<AnimalWithStats>({
    queryKey: ["/api/animals", id],
    queryFn: async () => {
      const res = await fetch(`/api/animals/${id}`, {
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Animal not found");
      }
      return res.json();
    },
    enabled: !!id,
  });

  const { data: posts = [], isLoading: postsLoading } = useQuery<PostWithDetails[]>({
    queryKey: ["/api/animals", id, "posts"],
    queryFn: async () => {
      const res = await fetch(`/api/feed?animalId=${id}`, {
        credentials: "include",
      });
      return res.json();
    },
    enabled: !!id,
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/follow", { animalId: id });
    },
    onSuccess: (data: { following: boolean }) => {
      toast({
        title: "Success",
        description: data.following 
          ? `You are now following ${animal?.name}!`
          : `You unfollowed ${animal?.name}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/animals", id] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFollow = () => {
    followMutation.mutate();
  };

  if (animalLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-green"></div>
        </div>
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="pt-20 min-h-screen flex items-center justify-center">
          <Card className="w-full max-w-md mx-4">
            <CardContent className="pt-6">
              <div className="text-center">
                <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h1 className="text-xl font-bold text-gray-900 mb-2">Pet Not Found</h1>
                <p className="text-gray-600">
                  The pet you're looking for doesn't exist or may have been removed.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-20 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
                {/* Avatar */}
                <div className="relative">
                  <Avatar className="w-32 h-32">
                    <AvatarImage src={animal.avatarUrl} alt={animal.name} />
                    <AvatarFallback className="text-3xl">
                      {animal.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">{animal.name}</h1>
                    <Badge variant="outline" className="w-fit">
                      {animal.species}
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    {animal.breed && (
                      <span className="flex items-center">
                        <Heart className="w-4 h-4 mr-1" />
                        {animal.breed}
                      </span>
                    )}
                    {animal.age && (
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {animal.age}
                      </span>
                    )}
                    {animal.sex && (
                      <span>{animal.sex}</span>
                    )}
                  </div>
                  
                  {animal.bio && (
                    <p className="text-gray-700 mb-4">{animal.bio}</p>
                  )}
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Users className="w-4 h-4 mr-1" />
                    <span>Owned by {animal.owner.displayName}</span>
                    <span className="mx-2">•</span>
                    <span>
                      Member since {formatDistanceToNow(new Date(animal.createdAt!), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <Button
                    onClick={handleFollow}
                    disabled={followMutation.isPending}
                    className={animal.isFollowing ? "brand-button-primary" : "brand-button-primary"}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    {followMutation.isPending 
                      ? "Updating..." 
                      : animal.isFollowing 
                        ? "Following" 
                        : "Follow"
                    }
                  </Button>
                </div>
              </div>
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-8 pt-6 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-green">{animal.postsCount}</p>
                  <p className="text-gray-600 text-sm">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-green">{animal.followersCount}</p>
                  <p className="text-gray-600 text-sm">Followers</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-green">
                    {posts.reduce((sum, post) => sum + post.likesCount, 0)}
                  </p>
                  <p className="text-gray-600 text-sm">Total Likes</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="posts" className="flex items-center space-x-2">
                <Camera className="w-4 h-4" />
                <span>Posts</span>
              </TabsTrigger>
              <TabsTrigger value="about" className="flex items-center space-x-2">
                <Heart className="w-4 h-4" />
                <span>About</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="mt-6">
              {postsLoading ? (
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
              ) : posts.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No posts yet
                    </h3>
                    <p className="text-gray-600">
                      {animal.name} hasn't shared any adventures yet. Follow to be notified when they do!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="about" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Pet Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Species</label>
                      <p className="text-gray-900">{animal.species}</p>
                    </div>
                    {animal.breed && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Breed</label>
                        <p className="text-gray-900">{animal.breed}</p>
                      </div>
                    )}
                    {animal.age && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Age</label>
                        <p className="text-gray-900">{animal.age}</p>
                      </div>
                    )}
                    {animal.sex && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Sex</label>
                        <p className="text-gray-900">{animal.sex}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Owner Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={animal.owner.avatarUrl} alt={animal.owner.displayName} />
                        <AvatarFallback>
                          {animal.owner.displayName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{animal.owner.displayName}</p>
                        {animal.owner.role !== "USER" && (
                          <Badge className="brand-badge-vet text-xs">
                            {animal.owner.role}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {animal.owner.bio && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">About</label>
                        <p className="text-gray-900">{animal.owner.bio}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
