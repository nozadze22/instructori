"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type Ref,
} from "react";
import Image from "next/image";
import {
  Camera,
  Car,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  Loader2,
  Pencil,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { profileModalFieldShell } from "@/features/profile/components/profile-modal-styles";
import type { InstructorVehicle } from "@/features/profile/api/instructor-vehicles";
import {
  useCreateProfileVehicle,
  useDeleteProfileVehicle,
  useProfileVehicles,
  useReplaceProfileVehiclePhoto,
  useUpdateProfileVehicle,
} from "@/features/profile/hooks/instructor-vehicles";
import { useNearViewport } from "@/hooks/use-near-viewport";
import { cn } from "@/lib/utils";

type ProfileSectionShellProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  badge?: string;
  children: ReactNode;
  ref?: Ref<HTMLElement>;
};

function ProfileSectionShell({
  icon,
  title,
  subtitle,
  badge,
  children,
  ref,
}: ProfileSectionShellProps) {
  return (
    <section
      ref={ref}
      className="flex flex-col gap-6 rounded-2xl bg-surface-container-low p-6 shadow-sm sm:p-8"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-on-surface">{title}</h2>
            <span className="text-xs text-on-surface-variant">{subtitle}</span>
          </div>
        </div>
        {badge ? (
          <span className="rounded-full bg-surface-container-highest px-3 py-1 text-xs font-bold text-secondary">
            {badge}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

type InstructorProfileFleetSectionProps = {
  mode?: "display" | "manage";
  publicVehicles?: InstructorVehicle[];
  /** Owner preview: fetch owned vehicles only when the section is near the viewport. */
  fetchOwned?: boolean;
};

export function InstructorProfileFleetSection({
  mode = "display",
  publicVehicles = [],
  fetchOwned = false,
}: InstructorProfileFleetSectionProps) {
  const isManage = mode === "manage";
  const shouldFetchOwned = isManage || fetchOwned;
  const { ref, isNear } = useNearViewport();
  const { data: ownerVehicles, isLoading: ownerLoading } = useProfileVehicles({
    enabled: shouldFetchOwned && isNear,
  });

  const vehicles = shouldFetchOwned ? (ownerVehicles ?? []) : publicVehicles;
  const countLabel =
    vehicles.length > 0
      ? `${vehicles.length} ერთეული ტექნიკა`
      : isManage
        ? "დაამატე შენი მანქანები"
        : undefined;

  return (
    <ProfileSectionShell
      ref={ref}
      icon={<Car className="size-[22px]" />}
      title="სასწავლო ავტოპარკი & სიმულატორი"
      subtitle="100% იდენტური საგამოცდო ცენტრის მანქანებთან"
      badge={countLabel}
    >
      {shouldFetchOwned && (!isNear || ownerLoading) ? (
        <p className="text-sm text-on-surface-variant">იტვირთება...</p>
      ) : (
        <>
          <FleetGrid vehicles={vehicles} manage={isManage} />
          {isManage ? <AddVehiclePanel vehicleCount={vehicles.length} /> : null}
        </>
      )}
      {!isManage && vehicles.length === 0 ? (
        <p className="text-sm text-on-surface-variant">
          ინსტრუქტორმა ჯერ არ დაამატა სასწავლო ტექნიკა.
        </p>
      ) : null}
    </ProfileSectionShell>
  );
}

function FleetGrid({
  vehicles,
  manage,
}: {
  vehicles: InstructorVehicle[];
  manage: boolean;
}) {
  const deleteVehicle = useDeleteProfileVehicle();
  const replacePhoto = useReplaceProfileVehiclePhoto();
  const updateVehicle = useUpdateProfileVehicle();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const [photoTargetId, setPhotoTargetId] = useState<string | null>(null);
  const [editingVehicle, setEditingVehicle] =
    useState<InstructorVehicle | null>(null);

  if (vehicles.length === 0 && !manage) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,320px),1fr))] gap-5">
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            manage={manage}
            onEdit={() => setEditingVehicle(vehicle)}
            onChangePhoto={() => {
              setPhotoTargetId(vehicle.id);
              photoInputRef.current?.click();
            }}
            onDelete={() => deleteVehicle.mutate(vehicle.id)}
            photoBusy={replacePhoto.isPending}
            deleteBusy={deleteVehicle.isPending}
          />
        ))}
      </div>

      {editingVehicle ? (
        <EditVehiclePanel
          vehicle={editingVehicle}
          isPending={updateVehicle.isPending}
          onCancel={() => setEditingVehicle(null)}
          onSubmit={async (input) => {
            await updateVehicle.mutateAsync({
              id: editingVehicle.id,
              input,
            });
            setEditingVehicle(null);
          }}
        />
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
            if (!file || !photoTargetId) return;
            void replacePhoto.mutateAsync({ id: photoTargetId, file });
            setPhotoTargetId(null);
          }}
        />
      ) : null}
    </>
  );
}

function VehicleCard({
  vehicle,
  manage,
  onEdit,
  onChangePhoto,
  onDelete,
  photoBusy,
  deleteBusy,
}: {
  vehicle: InstructorVehicle;
  manage: boolean;
  onEdit: () => void;
  onChangePhoto: () => void;
  onDelete: () => void;
  photoBusy: boolean;
  deleteBusy: boolean;
}) {
  const gallery = vehicle.images.length
    ? vehicle.images
    : [{ id: "primary", imageUrl: vehicle.imageUrl, sortOrder: 0 }];
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <article
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-xl bg-surface-container ring-1 ring-white/6",
        manage && "transition-shadow hover:shadow-lg hover:shadow-black/20",
      )}
    >
      <div
        className="group relative aspect-[4/3] cursor-zoom-in overflow-hidden bg-surface-container-high"
        onClick={() => setLightboxOpen(true)}
      >
        <Image
          src={gallery[activeImage]?.imageUrl ?? vehicle.imageUrl}
          alt={vehicle.title}
          fill
          sizes="(max-width:768px) 100vw, 33vw"
          unoptimized
          className="object-cover"
        />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-all group-hover:bg-black/15 group-hover:opacity-100">
          <span className="rounded-full bg-black/55 px-3 py-1.5 text-xs backdrop-blur-sm">
            სრულ ეკრანზე ნახვა
          </span>
        </span>
        {vehicle.tag ? (
          <span className="absolute top-2 left-2 rounded bg-surface-container-lowest/80 px-2 py-0.5 text-xs font-bold text-primary backdrop-blur-md">
            {formatGearbox(vehicle.tag)}
          </span>
        ) : null}
        {gallery.length > 1 ? (
          <>
            <span className="absolute right-2 bottom-2 rounded-full bg-surface-container-lowest/80 px-2.5 py-1 text-[11px] font-medium text-on-surface backdrop-blur-md">
              {activeImage + 1} / {gallery.length}
            </span>
            <button
              type="button"
              className="absolute top-1/2 left-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-surface-container-lowest/80 text-on-surface backdrop-blur-md transition-colors hover:bg-surface-container-lowest"
              onClick={(event) => {
                event.stopPropagation();
                setActiveImage(
                  (activeImage - 1 + gallery.length) % gallery.length,
                );
              }}
              aria-label="წინა ფოტო"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              className="absolute top-1/2 right-2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-surface-container-lowest/80 text-on-surface backdrop-blur-md transition-colors hover:bg-surface-container-lowest"
              onClick={(event) => {
                event.stopPropagation();
                setActiveImage((activeImage + 1) % gallery.length);
              }}
              aria-label="შემდეგი ფოტო"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        ) : null}
        {manage ? (
          <div className="absolute top-2 right-2 flex gap-1">
            <Button type="button" size="icon" variant="secondary" className="size-8 bg-surface-container-lowest/90" onClick={(event) => { event.stopPropagation(); onEdit(); }} aria-label="რედაქტირება">
              <Pencil className="size-4" />
            </Button>
            <Button type="button" size="icon" variant="secondary" className="size-8 bg-surface-container-lowest/90" disabled={photoBusy} onClick={(event) => { event.stopPropagation(); onChangePhoto(); }} aria-label="ფოტოს შეცვლა">
              <Camera className="size-4" />
            </Button>
            <Button type="button" size="icon" variant="secondary" className="size-8 bg-surface-container-lowest/90 text-destructive" disabled={deleteBusy} onClick={(event) => { event.stopPropagation(); onDelete(); }} aria-label="წაშლა">
              <Trash2 className="size-4" />
            </Button>
          </div>
        ) : null}
      </div>
      {gallery.length > 1 ? (
        <div className="flex items-center justify-center gap-1.5 bg-surface-container-high px-3 py-2">
          {gallery.map((image, index) => (
            <button
              type="button"
              key={image.id}
              onClick={() => setActiveImage(index)}
              className={cn(
                "size-1.5 rounded-full bg-on-surface-variant/40 transition-all",
                index === activeImage && "w-5 bg-primary",
              )}
              aria-label={`ფოტო ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-1 text-sm font-bold text-on-surface">
          {vehicle.title}
        </h3>
        {vehicle.description ? (
          <p className="break-words whitespace-pre-wrap text-xs leading-relaxed text-on-surface-variant">
            {vehicle.description}
          </p>
        ) : null}
      </div>
      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`${vehicle.title} — ფოტო`}
          onClick={() => setLightboxOpen(false)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 z-10 flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={() => setLightboxOpen(false)}
            aria-label="დახურვა"
          >
            <X className="size-5" />
          </button>
          <div
            className="relative h-[85vh] w-full max-w-6xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={gallery[activeImage]?.imageUrl ?? vehicle.imageUrl}
              alt={vehicle.title}
              fill
              unoptimized
              sizes="100vw"
              className="object-contain"
            />
            {gallery.length > 1 ? (
              <>
                <button
                  type="button"
                  className="absolute top-1/2 left-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/25 sm:left-6"
                  onClick={() =>
                    setActiveImage(
                      (activeImage - 1 + gallery.length) % gallery.length,
                    )
                  }
                  aria-label="წინა ფოტო"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  className="absolute top-1/2 right-3 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-md transition-colors hover:bg-white/25 sm:right-6"
                  onClick={() =>
                    setActiveImage((activeImage + 1) % gallery.length)
                  }
                  aria-label="შემდეგი ფოტო"
                >
                  <ChevronRight className="size-6" />
                </button>
                <span className="absolute right-1/2 bottom-3 translate-x-1/2 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
                  {activeImage + 1} / {gallery.length}
                </span>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </article>
  );
}

const fleetFieldInputClass = cn(
  profileModalFieldShell,
  "h-11 px-3.5 text-sm placeholder:text-muted-foreground/80",
);

function formatGearbox(value: string | null) {
  if (value === "MANUAL") return "მექანიკა";
  if (value === "AUTOMATIC") return "ავტომატიკა";
  return value;
}

function FleetField({
  id,
  label,
  required,
  hint,
  children,
}: {
  id: string;
  label?: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      {label ? (
        <label
          htmlFor={id}
          className="text-sm font-medium text-on-surface"
        >
          {label}
          {required ? (
            <span className="ml-0.5 text-primary" aria-hidden>
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {children}
      {hint ? (
        <p className="text-[11px] leading-snug text-on-surface-variant">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function EditVehiclePanel({
  vehicle,
  isPending,
  onCancel,
  onSubmit,
}: {
  vehicle: InstructorVehicle;
  isPending: boolean;
  onCancel: () => void;
  onSubmit: (input: {
    title: string;
    description?: string;
    tag?: string;
  }) => Promise<void>;
}) {
  const [title, setTitle] = useState(vehicle.title);
  const [description, setDescription] = useState(vehicle.description ?? "");
  const [tag, setTag] = useState(vehicle.tag ?? "");

  return (
    <div className="mt-6 rounded-2xl border border-primary/25 bg-primary/5 p-5 sm:p-6">
      <div className="mb-5">
        <h3 className="text-base font-semibold text-on-surface">
          მანქანის მონაცემების რედაქტირება
        </h3>
        <p className="mt-1 text-xs text-on-surface-variant">
          ფოტოს შეცვლა შეგიძლია კამერის ღილაკით.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <FleetField id="edit-fleet-title" label="მოდელი / სახელი" required>
          <Input
            id="edit-fleet-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className={fleetFieldInputClass}
          />
        </FleetField>
        <FleetField
          id="edit-fleet-tag"
          label="გადაცემათა კოლოფი"
          hint="აირჩიე მექანიკა ან ავტომატიკა"
        >
          <Select value={tag} onValueChange={(value) => setTag(value ?? "")}>
            <SelectTrigger
              id="edit-fleet-tag"
              className={cn(fleetFieldInputClass, "w-full justify-between")}
            >
              <SelectValue placeholder="აირჩიე ტიპი" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MANUAL">მექანიკა</SelectItem>
              <SelectItem value="AUTOMATIC">ავტომატიკა</SelectItem>
            </SelectContent>
          </Select>
        </FleetField>
        <div className="md:col-span-2">
          <FleetField
            id="edit-fleet-description"
            label="აღწერა"
            hint="მოკლე ინფორმაცია მანქანის შესახებ"
          >
            <Textarea
              id="edit-fleet-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              className={cn(
                profileModalFieldShell,
                "min-h-[88px] resize-none px-3.5 py-2.5 text-sm",
              )}
            />
          </FleetField>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          გაუქმება
        </Button>
        <Button
          type="button"
          disabled={!title.trim() || isPending}
          onClick={() =>
            void onSubmit({
              title: title.trim(),
              description: description.trim() || undefined,
              tag: tag || undefined,
            })
          }
        >
          {isPending ? "ინახება..." : "შენახვა"}
        </Button>
      </div>
    </div>
  );
}

function AddVehiclePanel({ vehicleCount }: { vehicleCount: number }) {
  const createVehicle = useCreateProfileVehicle();
  const [title, setTitle] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([]);

  const canAdd = vehicleCount < 6;

  const resetForm = () => {
    setTitle("");
    setTag("");
    setDescription("");
    setPendingFiles([]);
    pendingPreviews.forEach((url) => URL.revokeObjectURL(url));
    setPendingPreviews([]);
  };

  useEffect(() => {
    return () => {
      pendingPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [pendingPreviews]);

  const handleSubmit = async () => {
    if (pendingFiles.length === 0 || !title.trim()) return;
    await createVehicle.mutateAsync({
      title: title.trim(),
      description: description.trim() || undefined,
      tag: tag.trim() || undefined,
      files: pendingFiles,
    });
    resetForm();
  };

  if (!canAdd) {
    return (
      <div className="mt-4 rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm text-on-surface">
        მაქსიმუმ 6 მანქანა — ახლის დასამატებლად წაშალე ერთ-ერთი არსებული.
      </div>
    );
  }

  const canSubmit = Boolean(pendingFiles.length > 0 && title.trim());

  return (
    <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/10 bg-linear-to-br from-surface-container via-surface-container-low to-surface-container-high shadow-xl shadow-black/25">
      <div className="pointer-events-none absolute -top-24 right-0 size-64 rounded-full bg-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 left-1/4 size-48 rounded-full bg-primary-container/10 blur-3xl" />

      <div className="relative border-b border-white/8 px-6 py-5 sm:px-8">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
            <ImagePlus className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold tracking-tight text-on-surface">
              ახალი მანქანის დამატება
            </h3>
            <p className="mt-1 max-w-xl text-sm leading-relaxed text-on-surface-variant">
              ფოტო და დეტალები გამოჩნდება საჯარო პროფილზე — ისევე, როგორც
              სტუდენტები ხედავენ.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-container-highest px-3 py-1 text-xs font-medium text-secondary">
            <Sparkles className="size-3.5 text-primary" />
            {vehicleCount}/6
          </span>
        </div>
      </div>

      <div className="relative grid grid-cols-1 gap-8 px-6 py-6 sm:px-8 lg:grid-cols-[minmax(0,300px)_1fr] lg:gap-10 lg:py-8">
        <div className="flex flex-col gap-3 lg:sticky lg:top-6 lg:self-start">
          <p className="text-xs font-semibold tracking-wide text-on-surface-variant uppercase">
            მთავარი ფოტო
          </p>
          <label
            htmlFor="fleet-images"
            className="flex min-h-[260px] cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/12 bg-surface-container-highest/90 p-6 text-center shadow-inner shadow-black/20 transition-colors hover:border-primary/50 hover:bg-primary/5 sm:min-h-[300px]"
          >
            <span className="flex size-14 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <ImagePlus className="size-7" />
            </span>
            <span className="text-sm font-semibold text-on-surface">
              აირჩიე ფოტოები
            </span>
            <span className="text-xs text-on-surface-variant">
              შეგიძლია რამდენიმე ფოტო მონიშნო · მაქს. 8
            </span>
            {pendingFiles.length > 0 ? (
              <div className="grid max-w-full grid-cols-4 gap-2">
                {pendingPreviews.map((preview, index) => (
                  <span
                    key={preview}
                    className="relative size-14 overflow-hidden rounded-lg border border-primary/40 bg-surface-container"
                  >
                    <Image
                      src={preview}
                      alt={pendingFiles[index]?.name ?? ""}
                      fill
                      unoptimized
                      sizes="56px"
                      className="object-cover"
                    />
                  </span>
                ))}
              </div>
            ) : null}
            <input
              id="fleet-images"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="sr-only"
              onChange={(event) => {
                const selectedFiles = Array.from(event.target.files ?? []);
                const newFiles = selectedFiles.filter(
                  (file) =>
                    !pendingFiles.some(
                      (existing) =>
                        existing.name === file.name &&
                        existing.size === file.size &&
                        existing.lastModified === file.lastModified,
                    ),
                );
                const availableSlots = Math.max(0, 8 - pendingFiles.length);
                const filesToAdd = newFiles.slice(0, availableSlots);

                setPendingFiles((current) => [...current, ...filesToAdd]);
                setPendingPreviews((current) => [
                  ...current,
                  ...filesToAdd.map((file) => URL.createObjectURL(file)),
                ]);
                event.target.value = "";
              }}
            />
          </label>
        </div>

        <div className="flex min-w-0 flex-col gap-6">
          <FleetField id="fleet-title" label="მოდელი / სახელი" required>
            <Input
              id="fleet-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="მაგ. Skoda Fabia (2023)"
              className={fleetFieldInputClass}
            />
          </FleetField>

          <FleetField
            id="fleet-tag"
            label="გადაცემათა კოლოფი"
            hint="აირჩიე მანქანის გადაცემათა კოლოფის ტიპი"
          >
            <Select
              value={tag}
              onValueChange={(value) => setTag(value ?? "")}
            >
              <SelectTrigger
                id="fleet-tag"
                className={cn(
                  fleetFieldInputClass,
                  "w-full justify-between",
                  !tag && "text-muted-foreground",
                )}
              >
                <SelectValue placeholder="აირჩიე ტიპი" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MANUAL">მექანიკა</SelectItem>
                <SelectItem value="AUTOMATIC">ავტომატიკა</SelectItem>
              </SelectContent>
            </Select>
          </FleetField>

          <FleetField
            id="fleet-desc"
            label="აღწერა"
            hint="1–2 წინადადება სტუდენტებისთვის"
          >
            <Textarea
              id="fleet-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="მოკლე აღწერა სტუდენტებისთვის"
              rows={3}
              className={cn(
                profileModalFieldShell,
                "min-h-[88px] resize-none px-3.5 py-2.5 text-sm leading-relaxed placeholder:text-muted-foreground/80",
              )}
            />
          </FleetField>

        </div>
      </div>

      <div className="relative flex flex-col gap-4 border-t border-white/8 bg-surface-container/40 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <p className="text-xs text-on-surface-variant">
          {canSubmit ? (
            <span className="text-emerald-400/90">მზადაა დასამატებლად</span>
          ) : (
            <>
              საჭიროა <span className="text-on-surface">ფოტო</span> და{" "}
              <span className="text-on-surface">სახელი</span>
            </>
          )}
        </p>
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl border-white/15 bg-transparent px-5 hover:bg-surface-container-high"
            onClick={resetForm}
            disabled={createVehicle.isPending}
          >
            გასუფთავება
          </Button>
          <Button
            type="button"
            className="h-10 rounded-xl px-6 shadow-lg shadow-primary/25"
            disabled={!canSubmit || createVehicle.isPending}
            onClick={() => void handleSubmit()}
          >
            {createVehicle.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                იტვირთება...
              </>
            ) : (
              "დამატება"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
