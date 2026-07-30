"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useAdminUsers,
  useUpdateUserAccess,
} from "@/features/admin/hooks/users";
import type { AccessStatus } from "@/features/auth/login/api/login";

const statusLabel: Record<AccessStatus, string> = {
  PENDING: "მოლოდინში",
  ACTIVE: "აქტიური",
  BLOCKED: "დაბლოკილი",
};

const statusVariant: Record<
  AccessStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  PENDING: "secondary",
  ACTIVE: "default",
  BLOCKED: "destructive",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("ka-GE", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function AdminUsersTable() {
  const { data, isLoading } = useAdminUsers();
  const { mutate: updateAccess, isPending, variables } = useUpdateUserAccess();

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">მომხმარებლები იტვირთება...</p>
    );
  }

  const users = data?.users ?? [];
  const active = users.filter((u) => u.accessStatus === "ACTIVE").length;
  const pending = users.filter((u) => u.accessStatus === "PENDING").length;
  const blocked = users.filter((u) => u.accessStatus === "BLOCKED").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ინსტრუქტორები</h1>
          <p className="mt-1 text-muted-foreground">
            გახსენი წვდომა უფასოდ ან დაბლოკე ანგარიში.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary">
            აქტიური: {active}
          </span>
          <span className="rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-300">
            მოლოდინი: {pending}
          </span>
          <span className="rounded-full bg-destructive/15 px-3 py-1 text-xs font-semibold text-destructive">
            დაბლოკილი: {blocked}
          </span>
        </div>
      </div>

      <div className="glass-panel glow-border overflow-hidden rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="px-6 text-[10px] tracking-wider uppercase">
                სახელი
              </TableHead>
              <TableHead className="text-[10px] tracking-wider uppercase">
                ელფოსტა
              </TableHead>
              <TableHead className="text-[10px] tracking-wider uppercase">
                სტატუსი
              </TableHead>
              <TableHead className="text-[10px] tracking-wider uppercase">
                რეგისტრაცია
              </TableHead>
              <TableHead className="px-6 text-right text-[10px] tracking-wider uppercase">
                მოქმედება
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-muted-foreground"
                >
                  მომხმარებლები ჯერ არ არიან
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => {
                const busy = isPending && variables?.userId === user.id;

                return (
                  <TableRow
                    key={user.id}
                    className="border-white/5 transition-colors hover:bg-white/5"
                  >
                    <TableCell className="px-6 font-medium">
                      {user.fullName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={statusVariant[user.accessStatus]}>
                        {statusLabel[user.accessStatus]}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.createdAt)}</TableCell>
                    <TableCell className="px-6">
                      <div className="flex justify-end gap-2">
                        {user.accessStatus !== "ACTIVE" && (
                          <Button
                            size="sm"
                            className="rounded-lg"
                            disabled={busy}
                            onClick={() =>
                              updateAccess({
                                userId: user.id,
                                accessStatus: "ACTIVE",
                              })
                            }
                          >
                            გახსნა
                          </Button>
                        )}
                        {user.accessStatus !== "PENDING" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg"
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
                        )}
                        {user.accessStatus !== "BLOCKED" && (
                          <Button
                            size="sm"
                            variant="destructive"
                            className="rounded-lg"
                            disabled={busy}
                            onClick={() =>
                              updateAccess({
                                userId: user.id,
                                accessStatus: "BLOCKED",
                              })
                            }
                          >
                            ბლოკი
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
