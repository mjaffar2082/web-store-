"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit, Trash2, Package, Star } from "lucide-react";
import { useAdminProducts, useDeleteProduct, useUpdateProduct } from "@/hooks/use-products";
import { formatPrice } from "@/lib/utils";
import { toast } from "sonner";
import {
  Card,
  PageHeader,
  SearchInput,
  Badge,
  Button,
  IconButton,
  ConfirmDialog,
  Pagination,
  EmptyState,
  Spinner,
} from "@/components/admin/ui";
import { ProductStatusBadge } from "@/components/admin/status-badge";

type StatusFilter = "ALL" | "ACTIVE" | "DRAFT";

function StockBadge({ stock }: { stock: number }) {
  if (stock === 0) return <Badge tone="red">Sold Out</Badge>;
  if (stock <= 5) return <Badge tone="amber">Low · {stock}</Badge>;
  return <Badge tone="green">In Stock</Badge>;
}

export default function AdminProductsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const { data, isLoading } = useAdminProducts({
    q: search || undefined,
    page,
    limit: 20,
    isActive: statusFilter === "ALL" ? undefined : statusFilter === "ACTIVE",
  });
  const deleteProduct = useDeleteProduct();
  const updateProduct = useUpdateProduct();

  const products = data?.data ?? [];
  const meta = data?.meta;

  const handleToggleActive = async (product: { id: string; name: string; isActive: boolean }) => {
    try {
      await updateProduct.mutateAsync({ id: product.id, data: { isActive: !product.isActive } });
      toast.success(`${product.name} ${product.isActive ? "moved to draft" : "activated"}`);
    } catch {
      toast.error("Could not update product status");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct.mutateAsync(deleteTarget.id);
      toast.success("Product deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title="Products"
        description="List, add, and manage everything in your catalog."
        action={
          <Link href="/admin/products/new">
            <Button>
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SearchInput
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          placeholder="Search products…"
          className="w-full sm:w-72"
        />
        <div className="flex gap-1.5">
          {(["ALL", "ACTIVE", "DRAFT"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={
                statusFilter === s
                  ? "rounded-full bg-ink px-3.5 py-1.5 text-xs font-medium text-background transition-colors"
                  : "rounded-full bg-surface px-3.5 py-1.5 text-xs font-medium text-muted ring-1 ring-line transition-colors hover:bg-ink/5"
              }
            >
              {s === "ALL" ? "All" : s === "ACTIVE" ? "Active" : "Draft"}
            </button>
          ))}
        </div>
      </div>

      <Card className="overflow-hidden">
        {isLoading ? (
          <Spinner />
        ) : products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description={search || statusFilter !== "ALL" ? "Try adjusting your search or filters." : "Create your first product to get started."}
            action={
              !search && statusFilter === "ALL" ? (
                <Link href="/admin/products/new">
                  <Button>
                    <Plus className="h-4 w-4" />
                    Add Product
                  </Button>
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-line bg-ink/[0.02] text-[11px] uppercase tracking-[0.14em] text-muted">
                  <th className="px-5 py-3.5 font-semibold">Product</th>
                  <th className="px-5 py-3.5 font-semibold">SKU</th>
                  <th className="px-5 py-3.5 font-semibold">Price</th>
                  <th className="px-5 py-3.5 font-semibold">Stock</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Featured</th>
                  <th className="px-5 py-3.5 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {products.map((product) => (
                  <tr key={product.id} className="transition-colors hover:bg-ink/[0.02]">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ink/5">
                          {product.images?.[0]?.url ? (
                            <Image
                              src={product.images[0].url}
                              alt={product.images[0].alt || product.name}
                              width={44}
                              height={44}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Package className="h-5 w-5 text-muted" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/admin/products/${product.id}`}
                            className="block max-w-[220px] truncate font-medium text-ink hover:text-accent-hover"
                          >
                            {product.name}
                          </Link>
                          <p className="text-xs text-muted">{product.category?.name || "Uncategorized"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-muted">{product.sku}</td>
                    <td className="px-5 py-3.5 font-medium text-ink">
                      {formatPrice(product.basePrice)}
                      {product.discountPrice && product.discountPrice < product.basePrice && (
                        <span className="ml-1.5 text-xs text-muted line-through">
                          {formatPrice(product.discountPrice)}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <StockBadge stock={product.stock} />
                    </td>
                    <td className="px-5 py-3.5">
                      <ProductStatusBadge isActive={product.isActive} />
                    </td>
                    <td className="px-5 py-3.5">
                      {product.isFeatured ? (
                        <Star className="h-4 w-4 fill-accent text-accent" />
                      ) : (
                        <span className="text-muted/40">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleActive(product)}
                          title={product.isActive ? "Move to draft" : "Activate"}
                          className="rounded-lg px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted ring-1 ring-line transition-colors hover:bg-ink hover:text-background"
                        >
                          {product.isActive ? "Draft" : "Active"}
                        </button>
                        <IconButton label="Edit product" onClick={() => window.location.assign(`/admin/products/${product.id}`)}>
                          <Edit className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                          label="Delete product"
                          className="hover:bg-red-50 hover:text-danger"
                          onClick={() => setDeleteTarget({ id: product.id, name: product.name })}
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

      <Pagination
        page={page}
        totalPages={meta?.totalPages ?? 1}
        total={meta?.total ?? 0}
        label="products"
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete "${deleteTarget?.name}"?`}
        description="This will permanently remove the product and its images. This action cannot be undone."
        confirmLabel="Delete Product"
        loading={deleteProduct.isPending}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}