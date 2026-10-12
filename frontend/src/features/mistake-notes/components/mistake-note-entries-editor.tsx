"use client";

import { useMemo, useState } from "react";
import { Search, Trash2 } from "lucide-react";
import {
  Controller,
  type Control,
  type FieldErrors,
  useWatch,
} from "react-hook-form";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Textarea } from "@/components/ui/textarea";
import type {
  MistakeCategory,
  MistakeSeverityLevel,
} from "@/features/driving-practice/api/mistake-catalog";
import { MistakeSeverityPicker } from "@/features/driving-practice/components/mistake-severity-picker";
import type { MistakeNoteSchema } from "@/features/mistake-notes/schema/mistake-note.schema";
import { cn } from "@/lib/utils";

type MistakeNoteEntriesEditorProps = {
  control: Control<MistakeNoteSchema>;
  errors: FieldErrors<MistakeNoteSchema>;
  categories: MistakeCategory[];
  severities: MistakeSeverityLevel[];
  categoriesLoading?: boolean;
  onAppend: (entry: MistakeNoteSchema["mistakes"][number]) => void;
  onRemove: (index: number) => void;
  /** Stable keys from useFieldArray `fields` */
  fieldIds: string[];
};

export function MistakeNoteEntriesEditor({
  control,
  errors,
  categories,
  severities,
  categoriesLoading,
  onAppend,
  onRemove,
  fieldIds,
}: MistakeNoteEntriesEditorProps) {
  const [query, setQuery] = useState("");
  const mistakes = useWatch({ control, name: "mistakes" }) ?? [];

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q),
    );
  }, [categories, query]);

  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  return (
    <div className="space-y-5 rounded-2xl border border-white/8 bg-linear-to-b from-surface-lowest/50 to-surface-lowest/20 p-4 md:p-5">
      <div className="space-y-1">
        <h2 className="text-base font-semibold tracking-tight">შეცდომები</h2>
        <p className="text-sm text-muted-foreground">
          აირჩიე კატეგორია — ერთი დაჭერით დაემატება. სურვილისამებრ მიუთითე
          სიმძიმე და კომენტარი.
        </p>
      </div>

      <InputGroup className="h-10 rounded-xl border-white/10 bg-surface-lowest/90">
        <InputGroupAddon>
          <Search className="size-4" />
        </InputGroupAddon>
        <InputGroupInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ძებნა კატეგორიით..."
          className="h-full"
        />
      </InputGroup>

      {categoriesLoading ? (
        <p className="text-sm text-muted-foreground">კატეგორიები იტვირთება...</p>
      ) : (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
          {filteredCategories.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() =>
                onAppend({ categoryId: item.id, severityId: "", note: "" })
              }
              className={cn(
                "flex min-h-[3.75rem] cursor-pointer touch-manipulation flex-row items-center gap-2.5 rounded-xl border border-white/10 bg-surface-lowest/80 px-3 py-2.5 text-left transition",
                "hover:border-primary/40 hover:bg-primary/10 active:scale-[0.98]",
                "sm:min-h-0 sm:flex-col sm:items-start sm:gap-1.5 sm:py-3",
              )}
            >
              <span className="text-2xl leading-none sm:text-lg" aria-hidden>
                {item.icon}
              </span>
              <span className="text-[13px] font-medium leading-snug sm:text-sm">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )}

      {errors.mistakes?.root?.message || errors.mistakes?.message ? (
        <p className="text-sm text-destructive">
          {errors.mistakes.root?.message ?? errors.mistakes.message}
        </p>
      ) : null}

      <div className="space-y-3">
        {mistakes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/12 bg-white/2 px-4 py-8 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              ჯერ არც ერთი შეცდომა არ არის დამატებული
            </p>
            <p className="mt-1 text-xs text-muted-foreground/80">
              დააჭირე ზემოთ კატეგორიას
            </p>
          </div>
        ) : (
          mistakes.map((entry, index) => {
            const category = categoryById.get(entry.categoryId);
            const rowErrors = errors.mistakes?.[index];
            const rowKey = fieldIds[index] ?? `mistake-${index}`;

            return (
              <div
                key={rowKey}
                className="rounded-xl border border-white/10 bg-surface-lowest/70 p-3 shadow-sm ring-1 ring-white/5"
              >
                <Controller
                  control={control}
                  name={`mistakes.${index}.categoryId`}
                  render={({ field }) => (
                    <input type="hidden" {...field} value={field.value ?? ""} />
                  )}
                />
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="text-xl" aria-hidden>
                      {category?.icon ?? "📝"}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {category?.label ?? "კატეგორია"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        #{index + 1}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="cursor-pointer rounded-lg p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                    aria-label="წაშლა"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                {severities.length > 0 ? (
                  <Controller
                    control={control}
                    name={`mistakes.${index}.severityId`}
                    render={({ field }) => (
                      <MistakeSeverityPicker
                        className="mt-3"
                        severities={severities}
                        value={field.value || null}
                        onChange={(id) => field.onChange(id ?? "")}
                        compactOnMobile
                      />
                    )}
                  />
                ) : null}

                <Controller
                  control={control}
                  name={`mistakes.${index}.note`}
                  render={({ field }) => (
                    <Textarea
                      rows={2}
                      placeholder="კომენტარი (არასავალდებულო)"
                      className="mt-3 rounded-xl border-white/10 bg-surface-lowest text-sm"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
                />

                {rowErrors?.categoryId ? (
                  <p className="mt-1 text-xs text-destructive">
                    {rowErrors.categoryId.message}
                  </p>
                ) : null}
                {rowErrors?.note ? (
                  <p className="mt-1 text-xs text-destructive">
                    {rowErrors.note.message}
                  </p>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
