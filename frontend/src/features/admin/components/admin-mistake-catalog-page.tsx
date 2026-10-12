"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MistakeSeverityBadge } from "@/features/driving-practice/components/mistake-severity-badge";
import { MistakeSeverityPicker } from "@/features/driving-practice/components/mistake-severity-picker";
import {
  useAdminMistakeCategories,
  useAdminMistakeSeverities,
  useCreateMistakeCategory,
  useCreateMistakeSeverity,
  useDeleteMistakeCategory,
  useDeleteMistakeSeverity,
  useUpdateMistakeCategory,
  useUpdateMistakeSeverity,
} from "@/features/admin/hooks/mistake-catalog";
import {
  ContentPanel,
  PageEyebrow,
  PageFrame,
  PageHeader,
} from "@/features/instructor/components/page-frame";

export function AdminMistakeCatalogPage() {
  const { data: categories = [], isLoading: catLoading } =
    useAdminMistakeCategories();
  const { data: severities = [], isLoading: sevLoading } =
    useAdminMistakeSeverities();

  const createCategory = useCreateMistakeCategory();
  const updateCategory = useUpdateMistakeCategory();
  const deleteCategory = useDeleteMistakeCategory();
  const createSeverity = useCreateMistakeSeverity();
  const updateSeverity = useUpdateMistakeSeverity();
  const deleteSeverity = useDeleteMistakeSeverity();

  const [newCatCode, setNewCatCode] = useState("");
  const [newCatLabel, setNewCatLabel] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("📝");
  const [newSevCode, setNewSevCode] = useState("");
  const [newSevLabel, setNewSevLabel] = useState("");
  const [severityPreviewId, setSeverityPreviewId] = useState<string | null>(
    null,
  );

  const sortedCategories = useMemo(
    () => [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    [categories],
  );
  const sortedSeverities = useMemo(
    () => [...severities].sort((a, b) => a.sortOrder - b.sortOrder),
    [severities],
  );

  const activeSeverities = useMemo(
    () => sortedSeverities.filter((s) => s.isActive),
    [sortedSeverities],
  );

  const previewSeverityId =
    severityPreviewId &&
    activeSeverities.some((s) => s.id === severityPreviewId)
      ? severityPreviewId
      : (activeSeverities[0]?.id ?? null);

  const handleCreateCategory = () => {
    const code = newCatCode.trim().toUpperCase();
    const label = newCatLabel.trim();
    if (!code || !label) return;
    createCategory.mutate(
      { code, label, icon: newCatIcon.trim() || "📝" },
      {
        onSuccess: () => {
          setNewCatCode("");
          setNewCatLabel("");
          setNewCatIcon("📝");
        },
      },
    );
  };

  const handleCreateSeverity = () => {
    const code = newSevCode.trim().toUpperCase();
    const label = newSevLabel.trim();
    if (!code || !label) return;
    createSeverity.mutate(
      { code, label },
      {
        onSuccess: () => {
          setNewSevCode("");
          setNewSevLabel("");
        },
      },
    );
  };

  return (
    <PageFrame ambient={false}>
      <PageHeader
        eyebrow={
          <PageEyebrow icon={<AlertTriangle className="size-3.5" />}>
            ადმინისტრაცია
          </PageEyebrow>
        }
        title="პრაქტიკის შეცდომები"
        description="შეცდომის კატეგორიები და სიმძიმის დონები — ინსტრუქტორის პრაქტიკის დროს აქედან იტვირთება. გამორთული ჩანაწერი ახალ შეცდომაში ვერ აირჩევა; ძველი ჩანაწერები რჩება."
      />

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList className="rounded-xl bg-surface-low/80">
          <TabsTrigger value="categories" className="rounded-lg">
            კატეგორიები
          </TabsTrigger>
          <TabsTrigger value="severities" className="rounded-lg">
            სიმძიმე
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <ContentPanel bodyClassName="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-1.5">
                <Label htmlFor="cat-code">კოდი (EN)</Label>
                <Input
                  id="cat-code"
                  placeholder="MY_MISTAKE"
                  value={newCatCode}
                  onChange={(e) => setNewCatCode(e.target.value)}
                  className="rounded-xl border-white/10 bg-surface-lowest"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cat-label">სახელი</Label>
                <Input
                  id="cat-label"
                  placeholder="შეცდომის სახელი"
                  value={newCatLabel}
                  onChange={(e) => setNewCatLabel(e.target.value)}
                  className="rounded-xl border-white/10 bg-surface-lowest"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cat-icon">აიკონი</Label>
                <Input
                  id="cat-icon"
                  value={newCatIcon}
                  onChange={(e) => setNewCatIcon(e.target.value)}
                  className="rounded-xl border-white/10 bg-surface-lowest"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  className="w-full rounded-xl"
                  disabled={createCategory.isPending}
                  onClick={handleCreateCategory}
                >
                  <Plus className="size-4" />
                  დამატება
                </Button>
              </div>
            </div>

            <Separator className="bg-white/8" />

            {catLoading ? (
              <p className="text-sm text-muted-foreground">იტვირთება...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>აიკონი</TableHead>
                    <TableHead>სახელი</TableHead>
                    <TableHead>კოდი</TableHead>
                    <TableHead className="text-right">ჩანაწ.</TableHead>
                    <TableHead>აქტიური</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedCategories.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <Input
                          className="h-9 w-14 rounded-lg border-white/10 bg-surface-lowest text-center"
                          defaultValue={row.icon}
                          onBlur={(e) => {
                            const icon = e.target.value.trim() || "📝";
                            if (icon !== row.icon) {
                              updateCategory.mutate({ id: row.id, icon });
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          className="h-9 rounded-lg border-white/10 bg-surface-lowest"
                          defaultValue={row.label}
                          onBlur={(e) => {
                            const label = e.target.value.trim();
                            if (label && label !== row.label) {
                              updateCategory.mutate({ id: row.id, label });
                            }
                          }}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {row.code}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.mistakeCount}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={row.isActive}
                          onCheckedChange={(isActive) =>
                            updateCategory.mutate({ id: row.id, isActive })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          disabled={
                            row.mistakeCount > 0 || deleteCategory.isPending
                          }
                          title={
                            row.mistakeCount > 0
                              ? "ჯერ გამორთეთ — ჩანაწერები არსებობს"
                              : "წაშლა"
                          }
                          onClick={() => deleteCategory.mutate(row.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ContentPanel>
        </TabsContent>

        <TabsContent value="severities">
          <ContentPanel bodyClassName="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="sev-code">კოდი (EN)</Label>
                <Input
                  id="sev-code"
                  placeholder="CRITICAL"
                  value={newSevCode}
                  onChange={(e) => setNewSevCode(e.target.value)}
                  className="rounded-xl border-white/10 bg-surface-lowest"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sev-label">სახელი</Label>
                <Input
                  id="sev-label"
                  placeholder="კრიტიკული"
                  value={newSevLabel}
                  onChange={(e) => setNewSevLabel(e.target.value)}
                  className="rounded-xl border-white/10 bg-surface-lowest"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  className="w-full rounded-xl"
                  disabled={createSeverity.isPending}
                  onClick={handleCreateSeverity}
                >
                  <Plus className="size-4" />
                  დამატება
                </Button>
              </div>
            </div>

            <Separator className="bg-white/8" />

            {activeSeverities.length > 0 ? (
              <div className="rounded-xl border border-white/8 bg-surface-lowest/40 p-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  ინსტრუქტორის ეკრანზე ასე ჩანს (მწვანე · ყვითელი · წითელი)
                </p>
                <MistakeSeverityPicker
                  severities={activeSeverities}
                  value={previewSeverityId}
                  onChange={(id) =>
                    setSeverityPreviewId(id ?? activeSeverities[0]?.id ?? null)
                  }
                  optionalHint={false}
                />
              </div>
            ) : null}

            {sevLoading ? (
              <p className="text-sm text-muted-foreground">იტვირთება...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>სახელი</TableHead>
                    <TableHead>კოდი</TableHead>
                    <TableHead className="text-right">ჩანაწ.</TableHead>
                    <TableHead>აქტიური</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSeverities.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-2">
                          <MistakeSeverityBadge severity={row} />
                          <Input
                            className="h-9 min-w-[8rem] flex-1 rounded-lg border-white/10 bg-surface-lowest"
                            defaultValue={row.label}
                            onBlur={(e) => {
                              const label = e.target.value.trim();
                              if (label && label !== row.label) {
                                updateSeverity.mutate({ id: row.id, label });
                              }
                            }}
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {row.code}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {row.mistakeCount}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={row.isActive}
                          onCheckedChange={(isActive) =>
                            updateSeverity.mutate({ id: row.id, isActive })
                          }
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          disabled={
                            row.mistakeCount > 0 || deleteSeverity.isPending
                          }
                          onClick={() => deleteSeverity.mutate(row.id)}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </ContentPanel>
        </TabsContent>
      </Tabs>
    </PageFrame>
  );
}
