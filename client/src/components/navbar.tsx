import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Heart, Search, Home, MapPin, Plus, Bell, User, LogOut, Settings } from "lucide-react";

interface NavbarProps {
  onCreatePost?: () => void;
  onCreateLostPost?: () => void;
  onCreateFoundPost?: () => void;
}

export default function Navbar({ onCreatePost, onCreateLostPost, onCreateFoundPost }: NavbarProps) {
  const { user, logoutMutation } = useAuth();
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      console.log("Search for:", searchQuery);
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
        <Link href="/" className="flex items-center">
  <h1 className="text-2xl font-bold text-brand-green">
    <Heart className="inline-block w-6 h-6 mr-2" />
    Mypet
  </h1>
</Link>
          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Search pets, users, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 rounded-full py-2 px-4 pl-10 focus-ring transition-all"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </form>
          </div>

          {/* Navigation Menu */}
          <div className="flex items-center space-x-8">
            <Link href="/">
              <a className="text-gray-700 hover:text-brand-green transition-colors">
                <Home className="w-5 h-5" />
              </a>
            </Link>
            
            <Link href="/lost-found">
              <a className="text-gray-700 hover:text-brand-green transition-colors">
                <MapPin className="w-5 h-5" />
              </a>
            </Link>
            
            {/* Quick Actions */}
            <div className="flex items-center space-x-4">
              {onCreatePost && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onCreatePost}
                  className="text-gray-700 hover:text-brand-green transition-colors"
                  title="Create Normal Post"
                >
                  <Plus className="w-5 h-5" />
                </Button>
              )}
              
              {onCreateLostPost && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCreateLostPost}
                  className="text-gray-700 hover:text-brand-yellow transition-colors px-3 py-1 text-xs font-medium"
                  title="Report Lost Pet"
                >
                  Lost Pet
                </Button>
              )}
              
              {onCreateFoundPost && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onCreateFoundPost}
                  className="text-gray-700 hover:text-brand-azure transition-colors px-3 py-1 text-xs font-medium"
                  title="Report Found Pet"
                >
                  Found Pet
                </Button>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-700 hover:text-brand-green transition-colors"
            >
              <Bell className="w-5 h-5" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatarUrl || undefined} alt={user?.displayName || undefined} />
                    <AvatarFallback>
                      {user?.displayName?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {user?.displayName && (
                      <p className="font-medium">{user.displayName}</p>
                    )}
                    {user?.email && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email || ''}
                      </p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/me">
                    <a className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </a>
                  </Link>
                </DropdownMenuItem>
               <DropdownMenuItem onClick={() => navigate("/settings")}>
  <Settings className="mr-2 h-4 w-4" />
  <span>Settings</span>
</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
