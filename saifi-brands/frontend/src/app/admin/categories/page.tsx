"use client";

import { useState } from "react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/hooks/use-categories";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Tags } from "lucide-react";
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

export default function AdminCategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

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
      await createCategory.mutateAsync({ name: name.trim(), description: description.trim() || undefined });
      toast.success("Category created");
      resetForm();
    } catch {
      toast.error("Failed to create category");
    }
  };

  const handleUpdate = async () => {
    if (!name.trim() || !editingId) return;
    try {
      await updateCategory.mutateAsync({
        id: editingId,
        data: { name: name.trim(), description: description.trim() || undefined },
      });
      toast.success("Category updated");
      resetForm();
    } catch {
      toast.error("Failed to update category");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory.mutateAsync(deleteTarget.id);
      toast.success("Category deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const startEdit = (cat: { id: string; name: string; description?: string | null }) => {
    setEditingId(cat.id);
    setName(cat.name);
    setDescription(cat.description || "");
    setIsAdding(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Categories"
        description="Organize your products into browseable categories."
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
            Add Category
          </Button>
        }
      />

      {(isAdding || editingId) && (
        <Card className="p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Category name">
              <Input
                type="text"
                placeholder="e.g. Electronics"
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
              {editingId ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden">
        {isLoading ? (
          <Spinner />
        ) : !categories || categories.length === 0 ? (
          <EmptyState
            icon={Tags}
            title="No categories yet"
            description="Create your first category to start organizing products."
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
                {categories.map((cat) => (
                  <tr key={cat.id} className="transition-colors hover:bg-ink/[0.02]">
                    <td className="px-5 py-3.5 font-medium text-ink">{cat.name}</td>
                    <td className="px-5 py-3.5 text-muted">{cat.slug}</td>
                    <td className="px-5 py-3.5 text-muted">{cat.description || "—"}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton label="Edit category" onClick={() => startEdit(cat)}>
                          <Edit className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          label="Delete category"
                          className="hover:bg-red-50 hover:text-danger"
                          onClick={() => setDeleteTarget({ id: cat.id, name: cat.name })}
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
        description="Products assigned to this category will become uncategorized."
        loading={deleteCategory.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}