import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Post } from "@shared/schema";
import Navbar from "@/components/navbar";
import Map from "@/components/map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { MapPin, List, Search, Filter, Plus, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import LostFoundReportModal from "@/components/lost-found-report-modal";

export default function LostFound() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "LOST" | "FOUND">("ALL");
  const [speciesFilter, setSpeciesFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmPostId, setDeleteConfirmPostId] = useState<string | null>(null);
  const [, navigate] = useLocation();

  const { data: posts = [], isLoading } = useQuery<Post[]>({
    queryKey: ["/api/lost-found"],
    queryFn: async () => {
      const res = await fetch("/api/lost-found", {
        credentials: "include",
      });
      return res.json();
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: async (postId: string) => {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to delete post");
      }
      return res;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/lost-found"] });
      setDeleteConfirmPostId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const filteredPosts = posts.filter((post) => {
    const matchesStatus = statusFilter === "ALL" || post.status === statusFilter;
    const matchesSpecies = !speciesFilter || post.species.toLowerCase().includes(speciesFilter.toLowerCase());
    const matchesSearch = !searchQuery || 
      post.animalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.details?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.species.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSpecies && matchesSearch;
  });

  const lostCount = posts.filter(p => p.status === "LOST").length;
  const foundCount = posts.filter(p => p.status === "FOUND").length;

    return (
    <>
      {/* AlertDialog per conferma cancellazione */}
      <AlertDialog 
        open={deleteConfirmPostId !== null} 
        onOpenChange={(open) => {
          if (!open) setDeleteConfirmPostId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end pt-4">
            <AlertDialogCancel onClick={() => setDeleteConfirmPostId(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmPostId && deletePostMutation.mutate(deleteConfirmPostId)}
              className="bg-red-600 hover:bg-red-700"
              disabled={deletePostMutation.isPending}
            >
              {deletePostMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      <div className="min-h-screen">
        <Navbar />
        
        <div className="pt-20 min-h-screen">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="py-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Lost & Found Pets</h1>
                  <p className="text-gray-600">Help reunite pets with their families</p>
                </div>

                <div className="flex items-center space-x-4 mt-4 md:mt-0">
                  <div className="flex items-center space-x-2">
                    <Badge className="brand-badge-lost">{lostCount} Lost</Badge>
                    <Badge className="brand-badge-found">{foundCount} Found</Badge>
                  </div>
                  
                  <div className="flex items-center bg-white border rounded-lg p-1">
                    <Button
                      variant={viewMode === "map" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("map")}
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Map
                    </Button>
                    <Button
                      variant={viewMode === "list" ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode("list")}
                    >
                      <List className="w-4 h-4 mr-2" />
                      List
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters + Button */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by pet name, breed, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <Button
                    variant="default"
                    onClick={() => setIsReportModalOpen(true)}
                    className="flex items-center gap-2 whitespace-nowrap"
                  >
                    <Plus className="h-5 w-5" />
                    Report a lost/found pet
                  </Button>

                  <Select value={statusFilter} onValueChange={(value: "ALL" | "LOST" | "FOUND") => setStatusFilter(value)}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Posts</SelectItem>
                      <SelectItem value="LOST">Lost Pets Only</SelectItem>
                      <SelectItem value="FOUND">Found Pets Only</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Filter by species..."
                    value={speciesFilter}
                    onChange={(e) => setSpeciesFilter(e.target.value)}
                    className="w-48"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Content */}
            <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "map" | "list")}>
              <TabsContent value="map" className="mt-0">
                {/* ... il tuo contenuto della mappa rimane uguale ... */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Map View</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Map posts={filteredPosts} height="600px" />
                      </CardContent>
                    </Card>
                  </div>

          {/* Sidebar with all reports */}
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">All Reports</CardTitle>
                        <p className="text-sm text-gray-500">Most recent first • Scroll to see all</p>
               </CardHeader>
                  <CardContent className="space-y-4 max-h-[620px] overflow-y-auto pr-2">
                        {filteredPosts.length === 0 ? (
                          <p className="text-gray-500 text-center py-8">No reports found matching your filters</p>
                        ) : (
                          filteredPosts
                            .sort((a, b) => 
                              new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                            )
                            .map((post) => (
                              <div key={post.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-3 mb-2">
                                  <img
                                    src={post.mediaUrl || "https://via.placeholder.com/48"}
                                    alt={post.animalName || "Pet"}
                                    className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-semibold truncate">{post.animalName}</h4>
                                    <Badge 
                                      className={post.status === "LOST" 
                                        ? "brand-badge-lost" 
                                        : "brand-badge-found"
                                      }
                                    >
                                      {post.status}
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                  {post.details || "No additional details provided"}
                                </p>
                                {post.contact && (
                                  <p className="text-xs text-gray-500 mt-2">
                                    Contact: {post.contact}
                                  </p>
                                )}
                              </div>
                            ))
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

                          <TabsContent value="list" className="mt-0">
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
              ) : filteredPosts.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No lost or found pets in your area
                    </h3>
                    <p className="text-gray-600">
                      Check back later or adjust your search filters
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {filteredPosts.map((post) => (
                    <Card key={post.id} className="overflow-hidden">
                      <div className="md:flex">
                        <div className="md:w-1/3 min-h-[220px] bg-gray-100">
                          {post.mediaType === "image" ? (
                            <img
                              src={post.mediaUrl}
                              alt={post.animalName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <video
                              src={post.mediaUrl}
                              controls
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <CardContent className="p-4 md:flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                            <div>
                              <h3 className="text-xl font-semibold">{post.animalName}</h3>
                              <p className="text-sm text-gray-500">{post.species}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={post.status === "LOST" ? "brand-badge-lost" : "brand-badge-found"}>
                                {post.status}
                              </Badge>
                              {user && post.authorId === user.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteConfirmPostId(post.id)}
                                  className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-700 mt-3">{post.details}</p>
                          {post.contact && (
                            <p className="text-sm text-gray-500 mt-3">Contact: {post.contact}</p>
                          )}
                          {(post.lat || post.lng) && (
                            <p className="text-sm text-gray-500 mt-2">
                              Location: {post.lat ?? "?"}, {post.lng ?? "?"}
                            </p>
                          )}
                        </CardContent>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            </Tabs>

            {/* Modal per creare annuncio */}
            <LostFoundReportModal 
              open={isReportModalOpen} 
              onClose={() => setIsReportModalOpen(false)} 
            />
          </div>
        </div>
      </div>
    </>
  );
}