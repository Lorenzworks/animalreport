import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Camera } from "lucide-react";

const createPostSchema = z.object({
  animalName: z.string().min(1, "Pet name is required"),
  species: z.string().min(1, "Species is required"),  // ← NUOVO CAMPO
  details: z.string().min(10, "Please provide more details (at least 10 characters)"),
  location: z.string().min(3, "Please enter a location"),
  status: z.enum(["LOST", "FOUND"]),
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
  defaultStatus?: 'LOST' | 'FOUND';
}

export default function CreatePostModal({ open, onClose, defaultStatus = 'LOST' }: CreatePostModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<CreatePostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      status: defaultStatus,
      confirmAnimal: false,
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: CreatePostFormData & { media: File }) => {
      let lat = data.lat;
      let lng = data.lng;

      // Geocoding: converti l'indirizzo in coordinate
      if (data.location && (!lat || !lng)) {
        try {
          console.log(`🔍 Geocoding address: ${data.location}`);
          
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(data.location)}&limit=1&addressdetails=1`,
            {
              headers: {
                'User-Agent': 'Mypet-LostAndFound-App/1.0'
              }
            }
          );

          if (!response.ok) throw new Error('Geocoding request failed');

          const geoData = await response.json();

          if (geoData && geoData.length > 0) {
            lat = parseFloat(geoData[0].lat);
            lng = parseFloat(geoData[0].lon);
            console.log(`✅ Geocoded "${data.location}" → ${lat}, ${lng}`);
          } else {
            console.warn(`⚠️ No geocoding results for: ${data.location}`);
          }
        } catch (error) {
          console.warn("Geocoding failed:", error);
        }
      }

      const formData = new FormData();
      formData.append("media", data.media);
      formData.append("animalName", data.animalName);
      formData.append("species", data.species);
      formData.append("details", data.details || "");
      formData.append("status", data.status);
      if (data.contact) formData.append("contact", data.contact);
      if (data.location) formData.append("location", data.location);   // ← importante
      if (lat !== undefined && lat !== null) formData.append("lat", lat.toString());
      if (lng !== undefined && lng !== null) formData.append("lng", lng.toString());

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
        description: "Your lost/found report has been created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/lost-found"] });
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto z-[9999]">
        <DialogHeader>
          <DialogTitle>Report Lost or Found Pet</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            {/* Nome animale */}
            <FormField
              control={form.control}
              name="animalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pet's Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Max, Luna, Whiskers..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Specie animale - NUOVO CAMPO */}
            <FormField
              control={form.control}
              name="species"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Species</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g. Dog, Cat, Parrot, Rabbit, Horse..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Upload media */}
            <div>
              <Label>Photo / Video</Label>
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
                        {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="es. Central Park, New York o Via Roma 45, Milano"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dettagli + reward */}
            <FormField
              control={form.control}
              name="details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Further Details and Reward</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="Further details and reward..."
                      className="focus-ring"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo report */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Report Type</FormLabel>
                  <FormControl>
                    <div className="grid grid-cols-2 gap-3">
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

            {/* Contact */}
            <FormField
              control={form.control}
              name="contact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Information (phone/email)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="How people can contact you about this pet"
                      className="focus-ring"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Conferma */}
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

            {/* Submit */}
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
                {createPostMutation.isPending ? "Submitting..." : "Submit Report"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}