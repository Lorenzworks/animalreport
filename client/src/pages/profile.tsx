import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Animal } from "@shared/schema";
import Navbar from "@/components/navbar";
import AnimalForm from "@/components/animal-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Heart, Camera, Settings } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAnimalForm, setShowAnimalForm] = useState(false);
  const [editingAnimal, setEditingAnimal] = useState<Animal | null>(null);

  const { data: animals = [], isLoading: animalsLoading } = useQuery<Animal[]>({
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

  const deleteAnimalMutation = useMutation({
    mutationFn: async (animalId: string) => {
      await apiRequest("DELETE", `/api/animals/${animalId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Pet removed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/me/animals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEditAnimal = (animal: Animal) => {
    setEditingAnimal(animal);
    setShowAnimalForm(true);
  };

  const handleDeleteAnimal = (animalId: string) => {
    if (confirm("Are you sure you want to remove this pet?")) {
      deleteAnimalMutation.mutate(animalId);
    }
  };

  const handleCloseForm = () => {
    setShowAnimalForm(false);
    setEditingAnimal(null);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      
      <div className="pt-20 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Profile Header */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={user?.avatarUrl} alt={user?.displayName} />
                    <AvatarFallback className="text-2xl">
                      {user?.displayName?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
                    <h1 className="text-2xl font-bold text-gray-900">{user?.displayName}</h1>
                    {user?.role !== "USER" && (
                      <Badge className="brand-badge-vet w-fit">
                        {user?.role}
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1">{user?.bio || "Pet lover"}</p>
                  <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
                </div>
                
                <Button variant="outline" className="flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Edit Profile</span>
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-6 mt-6 pt-6 border-t">
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-green">{animals.length}</p>
                  <p className="text-gray-600 text-sm">Pets</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-green">{profile?.postsCount || 0}</p>
                  <p className="text-gray-600 text-sm">Posts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-green">{profile?.followersCount || 0}</p>
                  <p className="text-gray-600 text-sm">Followers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* My Pets Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl">My Pets</CardTitle>
                <Button
                  onClick={() => setShowAnimalForm(true)}
                  className="brand-button-primary flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Pet</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {animalsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 h-48 rounded-lg mb-3"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              ) : animals.length === 0 ? (
                <div className="text-center py-12">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No pets added yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Add your first pet to start sharing their adventures!
                  </p>
                  <Button
                    onClick={() => setShowAnimalForm(true)}
                    className="brand-button-primary"
                  >
                    Add Your First Pet
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {animals.map((animal) => (
                    <Card key={animal.id} className="overflow-hidden">
                      <div className="relative">
                        <img
                          src={animal.avatarUrl || "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"}
                          alt={animal.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 right-2 flex space-x-1">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-8 w-8"
                            onClick={() => handleEditAnimal(animal)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-8 w-8"
                            onClick={() => handleDeleteAnimal(animal.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-lg mb-1">{animal.name}</h3>
                        <p className="text-gray-600 text-sm mb-2">
                          {animal.breed || animal.species}
                          {animal.age && ` • ${animal.age}`}
                          {animal.sex && ` • ${animal.sex}`}
                        </p>
                        {animal.bio && (
                          <p className="text-gray-700 text-sm line-clamp-2">{animal.bio}</p>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3"
                          asChild
                        >
                          <a href={`/animal/${animal.id}`}>View Profile</a>
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Animal Form Modal */}
      <Dialog open={showAnimalForm} onOpenChange={handleCloseForm}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingAnimal ? "Edit Pet" : "Add New Pet"}
            </DialogTitle>
          </DialogHeader>
          <AnimalForm
            animal={editingAnimal}
            onSuccess={handleCloseForm}
            onCancel={handleCloseForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
