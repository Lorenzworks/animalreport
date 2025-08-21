import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PostWithDetails } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Heart, MessageCircle, Share2, Bookmark, Send, Phone, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PostCardProps {
  post: PostWithDetails;
}

export default function PostCard({ post }: PostCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState("");
  const [showComments, setShowComments] = useState(false);

  const likeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/posts/${post.id}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}`] });
    },
  });

  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      await apiRequest("POST", `/api/posts/${post.id}/comments`, { content });
    },
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
      queryClient.invalidateQueries({ queryKey: [`/api/posts/${post.id}/comments`] });
    },
  });

  const followMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/follow", { animalId: post.animalId });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `You are now following ${post.animal.name}!`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/feed"] });
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      commentMutation.mutate(newComment.trim());
    }
  };

  const handleFollow = () => {
    followMutation.mutate();
  };

  const getStatusBorderColor = () => {
    switch (post.status) {
      case "LOST":
        return "border-l-4 border-brand-yellow";
      case "FOUND":
        return "border-l-4 border-brand-azure";
      default:
        return "";
    }
  };

  const getStatusBadge = () => {
    switch (post.status) {
      case "LOST":
        return <Badge className="brand-badge-lost">LOST</Badge>;
      case "FOUND":
        return <Badge className="brand-badge-found">FOUND</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className={`post-card overflow-hidden ${getStatusBorderColor()}`}>
      {/* Post Header */}
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Avatar className="w-12 h-12">
              <AvatarImage src={post.animal.avatarUrl} alt={post.animal.name} />
              <AvatarFallback>
                {post.animal.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="font-semibold">{post.animal.name}</h4>
                {getStatusBadge()}
                <span className="text-gray-500">•</span>
                <span className="text-gray-500 text-sm">{post.author.displayName}</span>
              </div>
              <p className="text-gray-600 text-sm">
                {formatDistanceToNow(new Date(post.createdAt!), { addSuffix: true })}
                {post.status !== "NORMAL" && post.lat && post.lng && " • Location shared"}
              </p>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleFollow}
            disabled={followMutation.isPending}
            className="brand-button-primary"
          >
            {followMutation.isPending ? "Following..." : "Follow"}
          </Button>
        </div>

        {/* Post Content */}
        {post.caption && (
          <div className="mb-4">
            <p className="text-gray-800">{post.caption}</p>
          </div>
        )}

        {/* Lost/Found Info */}
        {(post.status === "LOST" || post.status === "FOUND") && (
          <div className="mb-4 p-3 bg-gray-50 border rounded-lg text-sm">
            {post.contact && (
              <p><strong>Contact:</strong> {post.contact}</p>
            )}
            {post.lat && post.lng && (
              <p><strong>Location:</strong> {post.lat.toFixed(4)}, {post.lng.toFixed(4)}</p>
            )}
            {post.status === "LOST" && (
              <p className="text-yellow-700 font-medium mt-2">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Please share to help reunite this pet with their family
              </p>
            )}
          </div>
        )}
      </CardContent>

      {/* Post Image/Video */}
      {post.mediaType === "image" ? (
        <img 
          src={post.mediaUrl} 
          alt={`${post.animal.name}'s post`}
          className="w-full h-96 object-cover"
        />
      ) : (
        <video 
          src={post.mediaUrl}
          controls
          className="w-full h-96 object-cover"
        />
      )}

      {/* Post Actions */}
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-6">
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-2 transition-colors ${
                post.isLiked ? "text-red-500" : "text-gray-700 hover:text-red-500"
              }`}
              disabled={likeMutation.isPending}
            >
              <Heart className={`w-5 h-5 ${post.isLiked ? "fill-current" : ""}`} />
              <span>{post.likesCount}</span>
            </button>
            
            <button 
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-700 hover:text-blue-500 transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              <span>{post.commentsCount}</span>
            </button>
            
            <button className="text-gray-700 hover:text-green-500 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>

            {(post.status === "LOST" || post.status === "FOUND") && (
              <Button
                size="sm"
                className={post.status === "LOST" ? "brand-button-yellow" : "brand-button-azure"}
              >
                <Phone className="w-4 h-4 mr-2" />
                Contact
              </Button>
            )}
          </div>
          
          <button className="text-gray-700 hover:text-gray-500 transition-colors">
            <Bookmark className="w-5 h-5" />
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="space-y-3 border-t pt-4">
            {post.comments.slice(0, 2).map((comment) => (
              <div key={comment.id} className="flex items-start space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.author.avatarUrl} alt={comment.author.displayName} />
                  <AvatarFallback>
                    {comment.author.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold">{comment.author.displayName}</span>{" "}
                    {comment.content}
                  </p>
                </div>
              </div>
            ))}
            
            {post.commentsCount > 2 && (
              <button className="text-gray-500 text-sm hover:text-gray-700">
                View all {post.commentsCount} comments
              </button>
            )}
          </div>
        )}

        {/* Add Comment */}
        <form onSubmit={handleComment} className="flex items-center space-x-3 mt-4">
          <Avatar className="w-8 h-8">
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <Input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="flex-1 bg-gray-100 border-0 rounded-full focus-ring"
          />
          <Button
            type="submit"
            variant="ghost"
            size="icon"
            disabled={!newComment.trim() || commentMutation.isPending}
            className="text-brand-green hover:text-brand-green-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
