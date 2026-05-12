import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import HomePage from "@/pages/home-page";
import CreatePost from "@/pages/create-post";
import LostFound from "@/pages/lost-found";
import Profile from "@/pages/profile";
import AnimalProfile from "@/pages/animal-profile";
import SettingsPage from "@/pages/settings-page";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />           {/* ← login resta qui, non toccare */}

      {/* CAMBIA QUESTA: da HomePage a LostFound */}
      <Route path="/" component={LostFound} />     {/* ← ora la home è Lost & Found */}

      <ProtectedRoute path="/create" component={CreatePost} />
      <ProtectedRoute path="/lost-found" component={LostFound} />   {/* ← puoi tenere anche questa se vuoi una URL dedicata */}
      <ProtectedRoute path="/me" component={Profile} />
      <ProtectedRoute path="/animal/:id" component={AnimalProfile} />
      <ProtectedRoute path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
