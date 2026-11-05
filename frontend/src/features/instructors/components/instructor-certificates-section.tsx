"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { BadgeCheck, Camera, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { InstructorCertificate } from "@/features/profile/api/instructor-certificates";
import {
  useCreateProfileCertificate,
  useDeleteProfileCertificate,
  useProfileCertificates,
  useReplaceProfileCertificatePhoto,
  useUpdateProfileCertificate,
} from "@/features/profile/hooks/instructor-certificates";
import { useNearViewport } from "@/hooks/use-near-viewport";

type Props = {
  manage?: boolean;
  publicCertificates?: InstructorCertificate[];
  fetchOwned?: boolean;
};

export function InstructorCertificatesSection({
  manage = false,
  publicCertificates = [],
  fetchOwned = false,
}: Props) {
  const shouldFetchOwned = manage || fetchOwned;
  const { ref, isNear } = useNearViewport();
  const { data: own = [], isLoading } = useProfileCertificates(
    shouldFetchOwned && isNear,
  );
  const certificates = shouldFetchOwned ? own : publicCertificates;

  return (
    <section
      ref={ref}
      className="flex flex-col gap-6 rounded-2xl bg-surface-container-low p-6 shadow-sm sm:p-8"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BadgeCheck className="size-[22px]" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-on-surface">
              სერტიფიკატები, ლიცენზიები & აკრედიტაცია
            </h2>
            <span className="text-xs text-on-surface-variant">
              ოფიციალურად დამოწმებული დოკუმენტები
            </span>
          </div>
        </div>
        <span className="rounded-full bg-surface-container-highest px-3 py-1 text-xs font-bold text-secondary">
          {certificates.length}
        </span>
      </div>

      {shouldFetchOwned && (!isNear || isLoading) ? <p>იტვირთება...</p> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {!(shouldFetchOwned && (!isNear || isLoading)) &&
          certificates.map((certificate) => (
            <CertificateCard
              key={certificate.id}
              certificate={certificate}
              manage={manage}
            />
          ))}
      </div>
      {manage ? <AddCertificateForm /> : null}
    </section>
  );
}

function CertificateCard({
  certificate,
  manage,
}: {
  certificate: InstructorCertificate;
  manage: boolean;
}) {
  const update = useUpdateProfileCertificate();
  const remove = useDeleteProfileCertificate();
  const replacePhoto = useReplaceProfileCertificatePhoto();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(certificate.title);
  const [description, setDescription] = useState(certificate.description ?? "");

  if (editing) {
    return (
      <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea
          className="mt-3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setEditing(false)}>გაუქმება</Button>
          <Button
            disabled={!title.trim() || update.isPending}
            onClick={async () => {
              await update.mutateAsync({ id: certificate.id, input: { title, description } });
              setEditing(false);
            }}
          >
            შენახვა
          </Button>
        </div>
      </div>
    );
  }

  return (
    <article className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-white/8 bg-surface-container shadow-sm transition-all hover:border-primary/25 hover:bg-surface-container-high hover:shadow-lg hover:shadow-black/15">
      <div className="relative aspect-[16/8] w-full overflow-hidden border-b border-white/8 bg-surface-container-high shadow-inner">
        <Image
          src={certificate.imageUrl}
          alt={certificate.title}
          fill
          unoptimized
          sizes="(max-width: 640px) 100vw, 50vw"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {manage ? (
          <button
            type="button"
            className="absolute inset-0 flex items-center justify-center bg-black/55 text-white opacity-0 transition-opacity hover:opacity-100"
            onClick={() => photoInputRef.current?.click()}
            aria-label="სერტიფიკატის ფოტოს შეცვლა"
          >
            <Camera className="size-5" />
          </button>
        ) : null}
      </div>
      <div className="min-w-0 flex-1 p-5">
        <div className="flex items-start gap-2">
          <h3 className="min-w-0 flex-1 text-base font-bold leading-snug text-on-surface">
            {certificate.title}
          </h3>
          <BadgeCheck className="mt-0.5 size-5 shrink-0 text-primary" />
        </div>
        {certificate.description ? (
          <p className="mt-2 break-words text-sm leading-relaxed text-on-surface-variant">
            {certificate.description}
          </p>
        ) : (
          <p className="mt-2 text-xs italic text-on-surface-variant/70">
            დოკუმენტი ატვირთულია
          </p>
        )}
      </div>
      {manage ? (
        <div className="absolute top-3 right-3 flex gap-1 opacity-70 transition-opacity group-hover:opacity-100">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setEditing(true)}
            aria-label="სერტიფიკატის რედაქტირება"
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="text-destructive"
            onClick={() => remove.mutate(certificate.id)}
            aria-label="სერტიფიკატის წაშლა"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      ) : null}
      {manage ? (
        <input
          ref={photoInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) {
              void replacePhoto.mutate({ id: certificate.id, file });
            }
          }}
        />
      ) : null}
    </article>
  );
}

function AddCertificateForm() {
  const create = useCreateProfileCertificate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const previewRef = useRef<string | null>(null);

  const chooseFile = (nextFile: File | null) => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
    const nextPreview = nextFile ? URL.createObjectURL(nextFile) : null;
    previewRef.current = nextPreview;
    setFile(nextFile);
    setPreviewUrl(nextPreview);
  };

  const reset = () => {
    setTitle("");
    setDescription("");
    chooseFile(null);
  };

  return (
    <div className="rounded-2xl border border-primary/25 bg-linear-to-br from-primary/8 to-surface-container p-5 shadow-lg shadow-black/15 sm:p-6">
      <div className="mb-5">
        <h3 className="text-base font-bold text-on-surface">
          ახალი სერტიფიკატის დამატება
        </h3>
        <p className="mt-1 text-xs text-on-surface-variant">
          ატვირთე დოკუმენტის ფოტო და მიუთითე მისი დასახელება.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-[220px_1fr]">
        <label className="relative flex min-h-44 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-primary/35 bg-surface-container-high/60 text-center text-sm text-on-surface-variant transition-colors hover:border-primary/70 hover:bg-primary/5">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="არჩეული სერტიფიკატი"
              fill
              unoptimized
              className="object-contain p-2"
            />
          ) : (
            <>
              <Plus className="mb-2 size-7 text-primary" />
              <span className="font-medium">ფოტოს არჩევა</span>
              <span className="mt-1 text-[11px]">JPEG, PNG, WebP · მაქს. 5 MB</span>
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            onChange={(e) => {
              chooseFile(e.target.files?.[0] ?? null);
              e.target.value = "";
            }}
          />
        </label>
        <div className="flex flex-col gap-3">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="სერტიფიკატის დასახელება *"
            className="h-11 rounded-xl"
          />
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="მოკლე აღწერა (არასავალდებულო)"
            className="min-h-28 resize-none rounded-xl"
          />
        </div>
      </div>
      <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={reset} disabled={create.isPending}>
          გასუფთავება
        </Button>
        <Button
          disabled={!file || !title.trim() || create.isPending}
          onClick={() => {
            if (file) {
              void create.mutateAsync({ title: title.trim(), description: description.trim() || undefined, file })
                .then(reset);
            }
          }}
        >
          {create.isPending ? "იტვირთება..." : "სერტიფიკატის დამატება"}
        </Button>
      </div>
    </div>
  );
}
