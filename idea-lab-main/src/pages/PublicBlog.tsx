import { useParams, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { parseShareableUrl } from "@/lib/slugify";
import { useBlogs } from "@/hooks/useBlogs";
import BlogPreview from "./BlogPreview";

const PublicBlog = () => {
  const { slugWithId } = useParams();
  const { getPublicBlogBySlug } = useBlogs();
  const [validSlug, setValidSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateSlug = async () => {
      if (!slugWithId) {
        setValidSlug(null);
        setLoading(false);
        return;
      }

      // First, try to parse the slug to extract project ID
      const parsed = parseShareableUrl(slugWithId);
      if (!parsed) {
        setValidSlug(null);
        setLoading(false);
        return;
      }

      try {
        // Validate that the blog exists by trying to fetch it
        const blog = await getPublicBlogBySlug(slugWithId);
        if (blog) {
          setValidSlug(parsed.id);
        } else {
          setValidSlug(null);
        }
      } catch (error) {
        console.error("Error validating blog slug:", error);
        setValidSlug(null);
      } finally {
        setLoading(false);
      }
    };

    validateSlug();
  }, [slugWithId, getPublicBlogBySlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading blog...</p>
        </div>
      </div>
    );
  }

  if (!validSlug) {
    return <Navigate to="/" replace />;
  }

  // Render BlogPreview with the extracted ID
  return <BlogPreview publicId={validSlug} />;
};

export default PublicBlog;