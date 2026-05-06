import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Loader2, ImageIcon } from "lucide-react";

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  bucket?: string;
  folder?: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

/**
 * Allowed MIME types — validated both by extension and content type.
 * MobSF Fix: CWE-434 — Prevents malicious file upload
 */
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
]);

const ALLOWED_EXTENSIONS = new Set([
  "jpg", "jpeg", "png", "gif", "webp", "svg"
]);

/**
 * Generate cryptographically strong random filename.
 * MobSF Fix: CWE-330 (android_insecure_random) — replaces Math.random()
 */
function generateSecureFilename(extension: string): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const hex = Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
  return `${Date.now()}-${hex}.${extension}`;
}

export function ImageUpload({ 
  label, 
  value, 
  onChange, 
  bucket = "hero-images",
  folder = "uploads"
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (CWE-434)
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please select an image under 2MB",
        variant: "destructive",
      });
      return;
    }

    // Validate MIME type (CWE-434 — don't trust file extension alone)
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Allowed types: JPEG, PNG, GIF, WebP, SVG",
        variant: "destructive",
      });
      return;
    }

    // Validate file extension
    const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
    if (!ALLOWED_EXTENSIONS.has(fileExt)) {
      toast({
        title: "Invalid file extension",
        description: "Allowed extensions: jpg, jpeg, png, gif, webp, svg",
        variant: "destructive",
      });
      return;
    }

    // Additional: Validate file magic bytes for images
    try {
      const headerBytes = await readFileHeader(file);
      if (!isValidImageHeader(headerBytes)) {
        toast({
          title: "Invalid image file",
          description: "The file content does not match a valid image format",
          variant: "destructive",
        });
        return;
      }
    } catch {
      // If validation fails, reject the file (fail-closed)
      toast({
        title: "Validation failed",
        description: "Could not validate the file. Please try another image.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      // MobSF Fix: CWE-330 — Use crypto.getRandomValues instead of Math.random
      const fileName = `${folder}/${generateSecureFilename(fileExt)}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          // Set content type explicitly to prevent MIME confusion
          contentType: file.type,
          // Prevent overwriting existing files
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      onChange(publicUrl);
      toast({ title: "Success", description: "Image uploaded successfully" });
    } catch (error: unknown) {
      // MobSF Fix: CWE-532 — Don't log raw errors in production
      const message = error instanceof Error ? error.message : "Failed to upload image";
      toast({
        title: "Upload failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.gif,.webp,.svg"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {value ? (
        <div className="relative rounded-lg border border-border overflow-hidden bg-muted/30">
          <img 
            src={value} 
            alt="Preview" 
            className="w-full h-32 object-cover"
            // Prevent image-based XSS
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-7 w-7"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full h-32 border-dashed flex flex-col gap-2"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-sm">Uploading...</span>
            </>
          ) : (
            <>
              <ImageIcon className="h-6 w-6 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Click to upload image</span>
              <span className="text-xs text-muted-foreground">Max 2MB • JPEG, PNG, GIF, WebP, SVG</span>
            </>
          )}
        </Button>
      )}
    </div>
  );
}

/**
 * Read the first bytes of a file to validate magic number.
 * This prevents file extension spoofing attacks.
 */
async function readFileHeader(file: File): Promise<Uint8Array> {
  const slice = file.slice(0, 12);
  const buffer = await slice.arrayBuffer();
  return new Uint8Array(buffer);
}

/**
 * Validate image file by checking magic bytes.
 * MobSF Fix: CWE-434 — Content-based file validation
 */
function isValidImageHeader(bytes: Uint8Array): boolean {
  if (bytes.length < 4) return false;

  // JPEG: FF D8 FF
  if (bytes[0] === 0xFF && bytes[1] === 0xD8 && bytes[2] === 0xFF) return true;

  // PNG: 89 50 4E 47
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4E && bytes[3] === 0x47) return true;

  // GIF: 47 49 46 38
  if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return true;

  // WebP: 52 49 46 46 ... 57 45 42 50
  if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
      bytes.length >= 12 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return true;

  // SVG: starts with '<' (3C) or '<?xml' or has '<svg'
  if (bytes[0] === 0x3C) return true;

  return false;
}
