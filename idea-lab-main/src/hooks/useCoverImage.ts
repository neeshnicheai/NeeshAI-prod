import { useState, useEffect } from "react";
import { toast } from "sonner";
import { compressImage } from "@/lib/imageUtils";

/**
 * Stores cover images as compressed base64 data URLs in localStorage.
 * Images are compressed client-side (resized to 2560px, converted to WebP at 0.92 quality)
 * before being stored. Files under 1MB are kept as-is.
 */
export const useCoverImage = (projectId: string | undefined) => {
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Load cover image from localStorage
  useEffect(() => {
    if (!projectId) return;
    const saved = localStorage.getItem(`cover-image-${projectId}`);
    if (saved) {
      setCoverImage(saved);
    }
  }, [projectId]);

  const uploadCoverImage = async (file: File) => {
    if (!projectId) return;

    // Validate file size (max 10MB raw — compression will bring it down)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large. Please upload an image under 10MB.");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file.");
      return;
    }

    setUploading(true);

    try {
      // Compress image (resize to 1920px, convert to WebP ~200-500KB)
      const compressedFile = await compressImage(file);

      // Convert compressed file to base64 data URL
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read image"));
        reader.readAsDataURL(compressedFile);
      });

      // Store in localStorage
      localStorage.setItem(`cover-image-${projectId}`, dataUrl);
      setCoverImage(dataUrl);
      toast.success("Cover image uploaded successfully!");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeCoverImage = async () => {
    if (!projectId) return;

    setCoverImage(null);
    localStorage.removeItem(`cover-image-${projectId}`);
    toast.success("Cover image removed.");
  };

  return {
    coverImage,
    uploading,
    uploadCoverImage,
    removeCoverImage,
  };
};
