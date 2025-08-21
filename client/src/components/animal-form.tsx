import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Animal, insertAnimalSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Upload, X } from "lucide-react";

const animalFormSchema = insertAnimalSchema.omit({ ownerId: true });
type AnimalFormData = z.infer<typeof animalFormSchema>;

interface AnimalFormProps {
  animal?: Animal | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const SPECIES_OPTIONS = [
  "Dog", "Cat", "Bird", "Fish", "Rabbit", "Hamster", "Guinea Pig", 
  "Reptile", "Horse", "Other"
];

const SEX_OPTIONS = ["Male", "Female", "Unknown"];

export default function AnimalForm({ animal, onSuccess, onCancel }: AnimalFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(animal?.avatarUrl || null);

  const form = useForm<AnimalFormData>({
    resolver: zodResolver(animalFormSchema),
    defaultValues: {
      name: animal?.name || "",
      species: animal?.species || "",
      breed: animal?.breed || "",
      sex: animal?.sex || "",
      age: animal?.age || "",
      bio: animal?.bio || "",
      avatarUrl: animal?.avatarUrl || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AnimalFormData) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("species", data.species);
      if (data.breed) formData.append("breed", data.breed);
      if (data.sex) formData.append("sex", data.sex);
      if (data.age) formData.append("age", data.age);
      if (data.bio) formData.append("bio", data.bio);
      if (selectedFile) {
        formData.append("avatar", selectedFile);
      } else if (data.avatarUrl) {
        formData.append("avatarUrl", data.avatarUrl);
      }

      const res = await fetch("/api/animals", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to create pet");
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Pet added successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/me/animals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/me"] });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: AnimalFormData) => {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("species", data.species);
      if (data.breed) formData.append("breed", data.breed);
      if (data.sex) formData.append("sex", data.sex);
      if (data.age) formData.append("age", data.age);
      if (data.bio) formData.append("bio", data.bio);
      if (selectedFile) {
        formData.append("avatar", selectedFile);
      } else if (data.avatarUrl) {
        formData.append("avatarUrl", data.avatarUrl);
      }

      const res = await fetch(`/api/animals/${animal!.id}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to update pet");
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Pet updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/me/animals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/animals", animal!.id] });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(animal?.avatarUrl || null);
  };

  const onSubmit = (data: AnimalFormData) => {
    if (animal) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Avatar Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pet Photo
          </label>
          <div className="flex items-center space-x-4">
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Pet preview"
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={removeFile}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300">
                <Upload className="w-6 h-6 text-gray-400" />
              </div>
            )}
            
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="avatar-upload"
              />
              <label htmlFor="avatar-upload">
                <Button type="button" variant="outline" asChild>
                  <span>Choose Photo</span>
                </Button>
              </label>
              <p className="text-xs text-gray-500 mt-1">
                JPG, PNG or GIF (max 10MB)
              </p>
            </div>
          </div>
        </div>

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pet Name *</FormLabel>
              <FormControl>
                <Input placeholder="Enter your pet's name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Species */}
        <FormField
          control={form.control}
          name="species"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Species *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select species" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SPECIES_OPTIONS.map((species) => (
                    <SelectItem key={species} value={species}>
                      {species}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Breed */}
        <FormField
          control={form.control}
          name="breed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Breed</FormLabel>
              <FormControl>
                <Input placeholder="Enter breed (optional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Sex */}
          <FormField
            control={form.control}
            name="sex"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sex</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select sex" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SEX_OPTIONS.map((sex) => (
                      <SelectItem key={sex} value={sex}>
                        {sex}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Age */}
          <FormField
            control={form.control}
            name="age"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Age</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 2 years" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Bio */}
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>About Your Pet</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Tell us about your pet's personality, favorite activities, etc."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex space-x-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 brand-button-primary"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : animal ? "Update Pet" : "Add Pet"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
