import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Animal } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, X, Camera } from "lucide-react";

const createPostSchema = z.object({
  animalId: z.string().min(1, "Please select a pet"),
  caption: z.string().optional(),
  status: z.enum(["NORMAL", "LOST", "FOUND"]).default("NORMAL"),
  contact: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  confirmAnimal: z.boolean().refine((val) => val === true, {
    message: "You must confirm that the content shows an animal",
  }),
});

type CreatePostFormData = z.infer<typeof createPostSchema>;

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreatePostModal({ open, onClose }: CreatePostModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: animals = [] } = useQuery<Animal[]>({
    queryKey: ["/api/me/animals"],
    queryFn: async () => {
      const res = await fetch("/api/me/animals", {
        credentials: "include",
      });
      return res.json();
    },
    enabled: open,
  });

  const form = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      status: "NORMAL",
      confirmAnimal: false,
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostFormData & { media: File }) => {
      const formData = new FormData();
      formData.append("media", data.media);
      formData.append("animalId", data.animalId);
      formData.append("status", data.status);
      if (data.caption) formData.append("caption", data.caption);
      if (data.contact) formData.append("contact", data.contact);
      if (data.lat) formData.append("lat", data.lat.toString());
      if (data.lng) formData.append("lng", data.lng.toString());

      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error || "Failed to create post");
      }

      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your post has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      onClose();
      form.reset();
      setSelectedFile(null);
      setPreviewUrl(null);
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
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const onSubmit = (data: CreatePostFormData) => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select a photo or video to upload.",
        variant: "destructive",
      });
      return;
    }

    createPostMutation.mutate({ ...data, media: selectedFile });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Post</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Pet Selection */}
            <FormField
              control={form.control}
              name="animalId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Pet</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose which pet this post is about" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {animals.map((animal) => (
                        <SelectItem key={animal.id} value={animal.id}>
                          {animal.name} ({animal.species})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Media Upload */}
            <div>
              <Label>Photo/Video</Label>
              <div className="mt-2">
                {previewUrl ? (
                  <div className="relative">
                    {selectedFile?.type.startsWith('video/') ? (
                      <video src={previewUrl} controls className="w-full h-64 object-cover rounded-lg" />
                    ) : (
                      <img src={previewUrl} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
                    )}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removeFile}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-2">Drag & drop or click to upload</p>
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="media-upload"
                    />
                    <Label htmlFor="media-upload" className="cursor-pointer">
                      <Button type="button" variant="outline" asChild>
                        <span>
                          <Camera className="w-4 h-4 mr-2" />
                          Choose File
                        </span>
                      </Button>
                    </Label>
                  </div>
                )}
              </div>
            </div>

            {/* Caption */}
            <FormField
              control={form.control}
              name="caption"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Caption</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Tell us about your pet's day..."
                      className="focus-ring"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Post Type */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Post Type</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant={field.value === "NORMAL" ? "default" : "outline"}
                        onClick={() => field.onChange("NORMAL")}
                        className="w-full"
                      >
                        Normal
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === "LOST" ? "default" : "outline"}
                        onClick={() => field.onChange("LOST")}
                        className={`w-full ${field.value === "LOST" ? "brand-button-yellow" : ""}`}
                      >
                        Lost Pet
                      </Button>
                      <Button
                        type="button"
                        variant={field.value === "FOUND" ? "default" : "outline"}
                        onClick={() => field.onChange("FOUND")}
                        className={`w-full ${field.value === "FOUND" ? "brand-button-azure" : ""}`}
                      >
                        Found Pet
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Info for Lost/Found */}
            {(form.watch("status") === "LOST" || form.watch("status") === "FOUND") && (
              <FormField
                control={form.control}
                name="contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Information</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Phone number or email for contact"
                        className="focus-ring"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {/* Animal Content Confirmation */}
            <FormField
              control={form.control}
              name="confirmAnimal"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm text-gray-700">
                      I confirm that this content shows an animal and complies with community guidelines
                    </FormLabel>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 brand-button-primary"
                disabled={createPostMutation.isPending}
              >
                {createPostMutation.isPending ? "Sharing..." : "Share Post"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
