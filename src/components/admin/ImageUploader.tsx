"use client";

import Image from "next/image";
import { X, Upload } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Props = {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
};

const PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export function ImageUploader({ value, onChange, max = 5 }: Props) {
  const remaining = max - value.length;
  const presetMissing = !PRESET;

  function remove(url: string) {
    onChange(value.filter((u) => u !== url));
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
        {value.map((url) => (
          <div
            key={url}
            className="relative aspect-square overflow-hidden rounded-md border border-border bg-muted"
          >
            <Image
              src={url}
              alt="Product image"
              fill
              sizes="(max-width: 640px) 50vw, 20vw"
              className="object-cover"
            />
            <button
              type="button"
              aria-label="Remove image"
              onClick={() => remove(url)}
              className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white opacity-90 hover:bg-black"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}

        {remaining > 0 && !presetMissing && (
          <CldUploadWidget
            uploadPreset={PRESET}
            options={{
              multiple: true,
              maxFiles: remaining,
              sources: ["local", "url", "camera"],
              clientAllowedFormats: ["png", "jpg", "jpeg", "webp"],
              maxFileSize: 5_000_000,
            }}
            onSuccess={(result) => {
              const info = result?.info;
              if (info && typeof info === "object" && "secure_url" in info) {
                const url = (info as { secure_url: string }).secure_url;
                if (!value.includes(url)) {
                  onChange([...value, url].slice(0, max));
                }
              }
            }}
            onError={() => toast.error("Upload failed")}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className="flex aspect-square flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-brand-gold/40 bg-muted/40 text-xs text-muted-foreground transition-colors hover:border-brand-gold hover:bg-brand-gold/5"
              >
                <Upload className="size-5 text-brand-gold" />
                <span>Upload image</span>
                <span className="text-[10px]">
                  {remaining} of {max} left
                </span>
              </button>
            )}
          </CldUploadWidget>
        )}
      </div>

      {presetMissing && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          <p className="font-medium">Cloudinary upload preset not configured.</p>
          <p className="mt-1">
            Set <code>NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET</code> in{" "}
            <code>.env.local</code> to enable uploads. You can still save the
            form without images.
          </p>
        </div>
      )}

      {value.length > 0 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={() => onChange([])}
        >
          Clear all images
        </Button>
      )}
    </div>
  );
}
