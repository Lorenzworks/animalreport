import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Camera, Search, Heart } from "lucide-react";
import { Animal } from "@shared/schema";

export default function Sidebar() {
  const { user } = useAuth();

  const { data: animals = [] } = useQuery<Animal[]>({
    queryKey: ["/api/me/animals"],
    queryFn: async () => {
      const res = await fetch("/api/me/animals", {
        credentials: "include",
      });
      return res.json();
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["/api/me"],
    queryFn: async () => {
      const res = await fetch("/api/me", {
        credentials: "include",
      });
      return res.json();
    },
  });

  return (
    <aside className="lg:w-80 space-y-6">
      {/* User Profile Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user?.avatarUrl} alt={user?.displayName} />
              <AvatarFallback>
                {user?.displayName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{user?.displayName}</h3>
              <p className="text-gray-600 text-sm">{user?.bio || "Pet lover"}</p>
              {user?.role !== "USER" && (
                <Badge className="brand-badge-vet mt-1">
                  {user?.role}
                </Badge>
              )}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-semibold text-brand-green">{animals.length}</p>
              <p className="text-gray-600 text-sm">Pets</p>
            </div>
            <div>
              <p className="font-semibold text-brand-green">{profile?.postsCount || 0}</p>
              <p className="text-gray-600 text-sm">Posts</p>
            </div>
            <div>
              <p className="font-semibold text-brand-green">{profile?.followersCount || 0}</p>
              <p className="text-gray-600 text-sm">Followers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Pets */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">My Pets</CardTitle>
            <Link href="/me">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {animals.length === 0 ? (
            <div className="text-center py-8">
              <Heart className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 text-sm mb-4">No pets added yet</p>
              <Link href="/me">
                <Button className="brand-button-primary text-sm">
                  Add Your First Pet
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {animals.map((animal) => (
                <Link key={animal.id} href={`/animal/${animal.id}`}>
                  <a className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={animal.avatarUrl} alt={animal.name} />
                      <AvatarFallback>
                        {animal.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{animal.name}</p>
                      <p className="text-gray-600 text-sm">{animal.breed || animal.species}</p>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/create">
            <Button className="w-full brand-button-primary flex items-center justify-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>New Post</span>
            </Button>
          </Link>
          <Link href="/lost-found">
            <Button className="w-full brand-button-yellow flex items-center justify-center space-x-2">
              <Search className="w-4 h-4" />
              <span>Report Lost Pet</span>
            </Button>
          </Link>
          <Link href="/lost-found">
            <Button className="w-full brand-button-azure flex items-center justify-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>Found Pet</span>
            </Button>
          </Link>
        </CardContent>
      </Card>
    </aside>
  );
}
