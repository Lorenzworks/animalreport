import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PostWithDetails } from "@shared/schema";
import Navbar from "@/components/navbar";
import PostCard from "@/components/post-card";
import Map from "@/components/map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, List, Search, Filter } from "lucide-react";

export default function LostFound() {
  const [viewMode, setViewMode] = useState<"map" | "list">("map");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "LOST" | "FOUND">("ALL");
  const [speciesFilter, setSpeciesFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: posts = [], isLoading } = useQuery<PostWithDetails[]>({
    queryKey: ["/api/lost-found"],
    queryFn: async () => {
      const res = await fetch("/api/lost-found", {
        credentials: "include",
      });
      return res.json();
    },
  });

  const filteredPosts = posts.filter((post) => {
    const matchesStatus = statusFilter === "ALL" || post.status === statusFilter;
    const matchesSpecies = !speciesFilter || post.animal.species.toLowerCase().includes(speciesFilter.toLowerCase());
    const matchesSearch = !searchQuery || 
      post.animal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.animal.breed?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSpecies && matchesSearch;
  });

  const lostCount = posts.filter(p => p.status === "LOST").length;
  const foundCount = posts.filter(p => p.status === "FOUND").length;

  return (
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
                    className={viewMode === "map" ? "brand-button-primary" : ""}
                  >
                    <MapPin className="w-4 h-4 mr-2" />
                    Map
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "brand-button-primary" : ""}
                  >
                    <List className="w-4 h-4 mr-2" />
                    List
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Map */}
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
                
                {/* Sidebar with recent posts */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Reports</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {filteredPosts.slice(0, 3).map((post) => (
                        <div key={post.id} className="border rounded-lg p-3">
                          <div className="flex items-center space-x-3 mb-2">
                            <img
                              src={post.animal.avatarUrl || post.mediaUrl}
                              alt={post.animal.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div>
                              <h4 className="font-semibold">{post.animal.name}</h4>
                              <Badge className={post.status === "LOST" ? "brand-badge-lost" : "brand-badge-found"}>
                                {post.status}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 line-clamp-2">{post.caption}</p>
                          {post.contact && (
                            <p className="text-xs text-gray-500 mt-1">Contact: {post.contact}</p>
                          )}
                        </div>
                      ))}
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
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
