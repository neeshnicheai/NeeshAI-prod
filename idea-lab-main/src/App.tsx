import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

// Eagerly load critical pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

// Lazy load heavier pages for faster initial load
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Project = lazy(() => import("./pages/Project"));
const BlogPreview = lazy(() => import("./pages/BlogPreview"));
const PublicBlog = lazy(() => import("./pages/PublicBlog"));
const FeedbackBuilder = lazy(() => import("./pages/FeedbackBuilder"));
const Chatbot = lazy(() => import("./pages/Chatbot"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const Pricing = lazy(() => import("./pages/Pricing"));

const queryClient = new QueryClient();

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/project/:id" element={<Project />} />
            <Route path="/project/:id/preview" element={<BlogPreview />} />
            <Route path="/project/:id/feedback" element={<FeedbackBuilder />} />
            <Route path="/project/:id/chatbot" element={<Chatbot />} />
            <Route path="/p/:slugWithId" element={<PublicBlog />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/pricing" element={<Pricing />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;