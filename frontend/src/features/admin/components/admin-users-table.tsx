"use client";

import { useMemo, useState } from "react";
import {
  Ban,
  CheckCircle2,
  Clock3,
  Search,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useAdminUsers,
  useUpdateUserAccess,
} from "@/features/admin/hooks/users";
import {
  ContentPanel,
  PageEyebrow,
  PageFrame,
  PageHeader,
  StatTile,
} from "@/features/instructor/components/page-frame";
import type { AccessStatus } from "@/features/auth/login/api/login";
import { cn } from "@/lib/utils";

const statusLabel: Record<AccessStatus, string> = {
  PENDING: "მოლოდინში",
  ACTIVE: "აქტიური",
  BLOCKED: "დაბლოკილი",
};

const statusBadgeClass: Record<AccessStatus, string> = {
  ACTIVE: "border-primary/25 bg-primary/12 text-primary",
  PENDING: "border-amber-500/25 bg-amber-500/12 text-amber-200",
  BLOCKED: "border-destructive/25 bg-destructive/12 text-destructive",
};

const filterTabs = [
  { value: "all", label: "ყველა" },
  { value: "ACTIVE", label: "აქტიური" },
  { value: "PENDING", label: "მოლოდინში" },
  { value: "BLOCKED", label: "დაბლოკილი" },
] as const;

type FilterTab = (typeof filterTabs)[number]["value"];

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ka-GE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function userInitials(fullName: string) {
  return (
    fullName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "IN"
  );
}

export function AdminUsersTable() {
  const { data, isLoading } = useAdminUsers();
  const { mutate: updateAccess, isPending, variables } = useUpdateUserAccess();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");

  const users = useMemo(() => data?.users ?? [], [data?.users]);

  const counts = useMemo(
    () => ({
      all: users.length,
      ACTIVE: users.filter((u) => u.accessStatus === "ACTIVE").length,
      PENDING: users.filter((u) => u.accessStatus === "PENDING").length,
      BLOCKED: users.filter((u) => u.accessStatus === "BLOCKED").length,
    }),
    [users],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((user) => {
      const matchesTab = tab === "all" || user.accessStatus === tab;
      const matchesQuery =
        !q ||
        user.fullName.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
  }, [query, tab, users]);

  return (
    <PageFrame ambient={false}>
      <PageHeader
        eyebrow={
          <PageEyebrow icon={<Users className="size-3.5" />}>
            Admin
          </PageEyebrow>
        }
        title="ინსტრუქტორები"
        description="გახსენი წვდომა უფასოდ ან დაბლოკე ანგარიში."
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label="სულ"
          value={isLoading ? "—" : counts.all}
          icon={<Users className="size-4" />}
        />
        <StatTile
          label="აქტიური"
          value={isLoading ? "—" : counts.ACTIVE}
          icon={<CheckCircle2 className="size-4" />}
        />
        <StatTile
          label="მოლოდინში"
          value={isLoading ? "—" : counts.PENDING}
          icon={<Clock3 className="size-4" />}
        />
        <StatTile
          label="დაბლოკილი"
          value={isLoading ? "—" : counts.BLOCKED}
          icon={<Ban className="size-4" />}
        />
      </section>

      <ContentPanel bodyClassName="space-y-4">
        <div className="flex flex-col gap-3">
          <InputGroup className="h-11 w-full rounded-xl border-white/10 bg-surface-lowest/90 shadow-none transition-shadow focus-within:border-primary/50 focus-within:shadow-[0_0_18px_rgb(173_198_255/10%)]">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ძებნა სახელით ან ელფოსტით..."
              className="h-full"
            />
          </InputGroup>

          <Tabs
            value={tab}
            onValueChange={(value) => {
              if (value) setTab(value as FilterTab);
            }}
            className="w-full gap-0"
          >
            <TabsList className="grid h-auto min-h-10 w-full grid-cols-2 gap-1 rounded-xl bg-surface-lowest/70 p-1 group-data-horizontal/tabs:h-auto! sm:grid-cols-4">
              {filterTabs.map((item) => (
                <TabsTrigger
                  key={item.value}
                  value={item.value}
                  className="h-9 cursor-pointer rounded-lg border-0 px-2 text-xs after:hidden sm:text-sm dark:data-active:border-transparent dark:data-active:bg-primary/15 data-active:bg-primary/15 data-active:text-primary data-active:shadow-none"
                >
                  <span className="whitespace-nowrap">{item.label}</span>
                  <span className="ml-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-md border border-white/10 bg-black/20 px-1 text-[10px] font-semibold tabular-nums text-muted-foreground">
                    {isLoading
                      ? "—"
                      : counts[item.value === "all" ? "all" : item.value]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        <Separator className="bg-white/8" />

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Empty className="rounded-2xl border border-dashed border-white/12 bg-surface-lowest/40 py-14">
            <EmptyHeader>
              <EmptyMedia
                variant="icon"
                className="size-14 rounded-2xl border border-primary/20 bg-primary/10 text-primary"
              >
                <UserRound className="size-6" />
              </EmptyMedia>
              <EmptyTitle className="text-lg font-bold tracking-tight">
                {users.length === 0
                  ? "ინსტრუქტორები ჯერ არ არიან"
                  : "შედეგი ვერ მოიძებნა"}
              </EmptyTitle>
              <EmptyDescription className="max-w-sm">
                {users.length === 0
                  ? "როცა ვინმე დარეგისტრირდება, აქ გამოჩნდება."
                  : "შეცვალე ძიება ან ფილტრი."}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/8">
            <Table>
              <TableHeader>
                <TableRow className="border-white/8 hover:bg-transparent">
                  <TableHead className="px-4 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    ინსტრუქტორი
                  </TableHead>
                  <TableHead className="hidden text-[11px] font-semibold tracking-wide text-muted-foreground uppercase md:table-cell">
                    ელფოსტა
                  </TableHead>
                  <TableHead className="text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    სტატუსი
                  </TableHead>
                  <TableHead className="hidden text-[11px] font-semibold tracking-wide text-muted-foreground uppercase lg:table-cell">
                    რეგისტრაცია
                  </TableHead>
                  <TableHead className="px-4 text-right text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    მოქმედება
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user) => {
                  const busy = isPending && variables?.userId === user.id;

                  return (
                    <TableRow
                      key={user.id}
                      className="border-white/8 transition-colors hover:bg-white/4"
                    >
                      <TableCell className="px-4 py-3">
                        <div className="flex min-w-[180px] items-center gap-3">
                          <Avatar className="size-9 border border-white/10">
                            <AvatarFallback className="bg-primary/12 text-xs font-semibold text-primary">
                              {userInitials(user.fullName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate font-medium">
                              {user.fullName}
                            </p>
                            <p className="truncate text-xs text-muted-foreground md:hidden">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden max-w-[240px] truncate text-muted-foreground md:table-cell">
                        {user.email}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-lg px-2.5 py-0.5 font-semibold",
                            statusBadgeClass[user.accessStatus],
                          )}
                        >
                          {statusLabel[user.accessStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-1.5">
                          {user.accessStatus !== "ACTIVE" ? (
                            <Button
                              size="sm"
                              className="h-8 cursor-pointer rounded-lg px-3 text-xs"
                              disabled={busy}
                              onClick={() =>
                                updateAccess({
                                  userId: user.id,
                                  accessStatus: "ACTIVE",
                                })
                              }
                            >
                              <ShieldCheck className="size-3.5" />
                              გახსნა
                            </Button>
                          ) : null}
                          {user.accessStatus !== "PENDING" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 cursor-pointer rounded-lg border-white/10 px-3 text-xs"
                              disabled={busy}
                              onClick={() =>
                                updateAccess({
                                  userId: user.id,
                                  accessStatus: "PENDING",
                                })
                              }
                            >
                              გაუქმება
                            </Button>
                          ) : null}
                          {user.accessStatus !== "BLOCKED" ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 cursor-pointer rounded-lg px-3 text-xs"
                              disabled={busy}
                              onClick={() =>
                                updateAccess({
                                  userId: user.id,
                                  accessStatus: "BLOCKED",
                                })
                              }
                            >
                              <Ban className="size-3.5" />
                              ბლოკი
                            </Button>
                          ) : null}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </ContentPanel>
    </PageFrame>
  );
}
