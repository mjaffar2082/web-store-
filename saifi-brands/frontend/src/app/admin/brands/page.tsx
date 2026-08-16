"use client";

import { useState } from "react";
import { useBrands, useCreateBrand, useUpdateBrand, useDeleteBrand } from "@/hooks/use-brands";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Building2 } from "lucide-react";
import {
  Card,
  PageHeader,
  Button,
  IconButton,
  Input,
  Field,
  EmptyState,
  Spinner,
  ConfirmDialog,
} from "@/components/admin/ui";

export default function AdminBrandsPage() {
  const { data: brands, isLoading } = useBrands();
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const deleteBrand = useDeleteBrand();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  const resetForm = () => {
    setName("");
    setDescription("");
    setIsAdding(false);
    setEditingId(null);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await createBrand.mutateAsync({ name: name.trim(), description: description.trim() || undefined });
      toast.success("Brand created");
      resetForm();
    } catch {
      toast.error("Failed to create brand");
    }
  };

  const handleUpdate = async () => {
    if (!name.trim() || !editingId) return;
    try {
      await updateBrand.mutateAsync({
        id: editingId,
        data: { name: name.trim(), description: description.trim() || undefined },
      });
      toast.success("Brand updated");
      resetForm();
    } catch {
      toast.error("Failed to update brand");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBrand.mutateAsync(deleteTarget.id);
      toast.success("Brand deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete brand");
    }
  };

  const startEdit = (brand: { id: string; name: string; description?: string | null }) => {
    setEditingId(brand.id);
    setName(brand.name);
    setDescription(brand.description || "");
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Brands"
        description="Manage the brands featured on your storefront."
        action={
          <Button
            onClick={() => {
              setIsAdding(true);
              setEditingId(null);
              setName("");
              setDescription("");
            }}
          >
            <Plus className="h-4 w-4" />
            Add Brand
          </Button>
        }
      />

      {(isAdding || editingId) && (
        <Card className="p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Brand name">
              <Input
                type="text"
                placeholder="e.g. TechPro"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
            <Field label="Description (optional)">
              <Input
                type="text"
                placeholder="Short description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={editingId ? handleUpdate : handleCreate}>
              {editingId ? "Save Changes" : "Create Brand"}
            </Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        {isLoading ? (
          <Spinner />
        ) : !brands || brands.length === 0 ? (
          <EmptyState
            icon={Building2}
            title="No brands yet"
            description="Create your first brand to start associating products."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-ink/[0.02] text-[11px] uppercase tracking-[0.14em] text-muted">
                  <th className="px-5 py-3.5 font-semibold">Name</th>
                  <th className="px-5 py-3.5 font-semibold">Slug</th>
                  <th className="px-5 py-3.5 font-semibold">Description</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {brands.map((brand) => (
                  <tr key={brand.id} className="transition-colors hover:bg-ink/[0.02]">
                    <td className="px-5 py-3.5 font-medium text-ink">{brand.name}</td>
                    <td className="px-5 py-3.5 text-muted">{brand.slug}</td>
                    <td className="px-5 py-3.5 text-muted">{brand.description || "—"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton label="Edit brand" onClick={() => startEdit(brand)}>
                          <Edit className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          label="Delete brand"
                          className="hover:bg-red-50 hover:text-danger"
                          onClick={() => setDeleteTarget({ id: brand.id, name: brand.name })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.name}"?`}
        description="Products assigned to this brand will no longer have a brand."
        loading={deleteBrand.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}