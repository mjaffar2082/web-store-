"use client";

import { useState } from "react";
import { useAdminUsers, useToggleUserActive } from "@/hooks/use-orders";
import { toast } from "sonner";
import { Users } from "lucide-react";
import {
  Card,
  PageHeader,
  SearchInput,
  Pagination,
  EmptyState,
  Spinner,
  Button,
} from "@/components/admin/ui";
import { RoleBadge, ActiveBadge } from "@/components/admin/status-badge";

export default function AdminUsersPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useAdminUsers({ page, limit: 20, q: q || undefined });
  const toggleActive = useToggleUserActive();

  const users = data?.data ?? [];
  const meta = data?.meta;

  const handleToggle = async (id: string, isActive: boolean) => {
    try {
      await toggleActive.mutateAsync(id);
      toast.success(isActive ? "User deactivated" : "User activated");
    } catch {
      toast.error("Could not update user");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="People"
        title="Customers"
        description="View and manage everyone registered on your storefront."
      />

      <SearchInput
        value={q}
        onChange={(v) => {
          setQ(v);
          setPage(1);
        }}
        placeholder="Search by name or email…"
        className="w-full sm:w-72"
      />

      <Card className="overflow-hidden">
        {isLoading ? (
          <Spinner />
        ) : users.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No users found"
            description="Try adjusting your search."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-ink/[0.02] text-[11px] uppercase tracking-[0.14em] text-muted">
                  <th className="px-5 py-3.5 font-semibold">Name</th>
                  <th className="px-5 py-3.5 font-semibold">Email</th>
                  <th className="px-5 py-3.5 font-semibold">Role</th>
                  <th className="px-5 py-3.5 font-semibold">Joined</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {users.map((user) => (
                  <tr key={user.id} className="transition-colors hover:bg-ink/[0.02]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent-hover">
                          {(user.firstName || user.email).charAt(0).toUpperCase()}
                        </span>
                        <span className="font-medium text-ink">
                          {user.firstName ? `${user.firstName} ${user.lastName ?? ""}` : "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted">{user.email}</td>
                    <td className="px-5 py-4">
                      <RoleBadge role={user.role} />
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {new Date(user.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      <ActiveBadge isActive={user.isActive} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Button
                        variant="outline"
                        className="px-3 py-1.5 text-xs"
                        onClick={() => handleToggle(user.id, user.isActive)}
                        disabled={toggleActive.isPending || user.role === "ADMIN"}
                      >
                        {user.isActive ? "Deactivate" : "Activate"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Pagination
        page={page}
        totalPages={meta?.totalPages ?? 1}
        total={meta?.total ?? 0}
        label="users"
        onPageChange={setPage}
      />
    </div>
  );
}