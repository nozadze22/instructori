"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import { ImagePlus, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DEFAULT_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";
const DEFAULT_MAX_BYTES = 5 * 1024 * 1024;

export type ImageUploadChangePayload = {
  file: File;
  previewUrl: string;
};

export type ImageUploadProps = {
  value?: string | null;
  onChange?: (payload: ImageUploadChangePayload) => void;
  onClear?: () => void;
  onError?: (message: string) => void;
  accept?: string;
  maxSizeBytes?: number;
  disabled?: boolean;
  className?: string;
  previewClassName?: string;
  label?: string;
  hint?: string;
  emptyState?: ReactNode;
  /** Compact square preview (e.g. profile avatar). */
  variant?: "default" | "avatar";
};

function isAcceptedType(file: File, accept: string): boolean {
  const tokens = accept
    .split(",")
    .map((part) => part.trim().toLowerCase())
    .filter(Boolean);
  if (tokens.length === 0) return file.type.startsWith("image/");

  return tokens.some((token) => {
    if (token.endsWith("/*")) {
      const prefix = token.slice(0, -1);
      return file.type.toLowerCase().startsWith(prefix);
    }
    return file.type.toLowerCase() === token;
  });
}

export function ImageUpload({
  value = null,
  onChange,
  onClear,
  onError,
  accept = DEFAULT_ACCEPT,
  maxSizeBytes = DEFAULT_MAX_BYTES,
  disabled = false,
  className,
  previewClassName,
  label = "სურათის ატვირთვა",
  hint = "JPEG, PNG, WebP ან GIF · მაქს. 5 MB",
  emptyState,
  variant = "default",
}: ImageUploadProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const objectUrlRef = useRef<string | null>(null);
  const displayPreview = localPreviewUrl ?? value ?? null;

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const reportError = useCallback(
    (message: string) => {
      onError?.(message);
    },
    [onError],
  );

  const applyFile = useCallback(
    (file: File | undefined) => {
      if (!file || disabled) return;

      if (!isAcceptedType(file, accept)) {
        reportError("მხოლოდ სურათის ფორმატია დაშვებული.");
        return;
      }

      if (file.size > maxSizeBytes) {
        reportError("ფაილი ძალიან დიდია.");
        return;
      }

      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }

      const nextPreview = URL.createObjectURL(file);
      objectUrlRef.current = nextPreview;
      setLocalPreviewUrl(nextPreview);
      onChange?.({ file, previewUrl: nextPreview });
    },
    [accept, disabled, maxSizeBytes, onChange, reportError],
  );

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    applyFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    applyFile(event.dataTransfer.files?.[0]);
  };

  const handleClear = () => {
    if (disabled) return;
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setLocalPreviewUrl(null);
    onClear?.();
  };

  const openPicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const isAvatar = variant === "avatar";
  const hasPreview = Boolean(displayPreview);
  const isEmptyStateHidden = !hasPreview && emptyState === null;

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={disabled}
        onChange={handleInputChange}
      />

      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-disabled={disabled}
        aria-labelledby={inputId}
        onKeyDown={(event) => {
          if (disabled) return;
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPicker();
          }
        }}
        onClick={openPicker}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={handleDrop}
        className={cn(
          "relative overflow-hidden rounded-xl border border-dashed border-white/15 bg-surface-container/40 transition-colors",
          isAvatar ? "aspect-square max-w-40" : "min-h-36",
          isEmptyStateHidden && "border-transparent bg-transparent",
          isDragging && "border-primary bg-primary/5",
          !disabled && "cursor-pointer hover:border-primary/40 hover:bg-surface-container/60",
          disabled && "cursor-not-allowed opacity-60",
          previewClassName,
        )}
      >
        {hasPreview ? (
          <Image
            src={displayPreview!}
            alt=""
            fill
            unoptimized
            className="object-cover"
            sizes={isAvatar ? "160px" : "100vw"}
          />
        ) : emptyState !== undefined ? (
          emptyState
        ) : (
          <div
            className={cn(
              "flex h-full flex-col items-center justify-center gap-2 px-4 py-6 text-center",
              isAvatar ? "min-h-0" : "min-h-36",
            )}
          >
            <span className="flex size-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <ImagePlus className="size-5" />
            </span>
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{hint}</p>
          </div>
        )}

        {hasPreview && !disabled ? (
          <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-linear-to-t from-black/70 to-transparent p-3 pt-8">
            <Button
              type="button"
              size="icon"
              variant="secondary"
              aria-label="სურათის შეცვლა"
              title="სურათის შეცვლა"
              className="size-9 rounded-full bg-primary text-on-primary shadow-lg hover:bg-primary/85"
              onClick={(event) => {
                event.stopPropagation();
                openPicker();
              }}
            >
              <Upload className="size-4" />
            </Button>
            <Button
              type="button"
              size="icon"
              variant="destructive"
              aria-label="სურათის წაშლა"
              title="სურათის წაშლა"
              className="size-9 rounded-full shadow-lg"
              onClick={(event) => {
                event.stopPropagation();
                handleClear();
              }}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
