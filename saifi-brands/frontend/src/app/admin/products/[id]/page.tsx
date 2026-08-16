"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray, useWatch, type Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { useAdminProduct, useUpdateProduct, useCreateProduct } from "@/hooks/use-products";
import { useCategories } from "@/hooks/use-categories";
import { useBrands } from "@/hooks/use-brands";
import { Product } from "@/types";
import { toast } from "sonner";
import Link from "next/link";
import {
  Card,
  CardHeader,
  Field,
  Input,
  Textarea,
  Select,
  Button,
  Toggle,
  IconButton,
  PageHeader,
} from "@/components/admin/ui";

const productFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  basePrice: z.coerce.number().positive("Price must be positive"),
  discountPrice: z.union([z.coerce.number().positive(), z.literal("")]).optional(),
  stock: z.coerce.number().int().min(0),
  sku: z.string().min(1, "SKU is required"),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  categoryId: z.string().optional().or(z.literal("")),
  brandId: z.string().optional().or(z.literal("")),
  metaTitle: z.string().optional().or(z.literal("")),
  metaDesc: z.string().optional().or(z.literal("")),
  images: z.array(z.object({ url: z.string(), alt: z.string() })).default([{ url: "", alt: "" }]),
});

type ProductFormData = z.input<typeof productFormSchema>;

function FormToggle({
  name,
  label,
  description,
  control,
  onValueChange,
}: {
  name: "isFeatured" | "isActive";
  label: string;
  description: string;
  control: Control<ProductFormData>;
  onValueChange: (name: "isFeatured" | "isActive", value: boolean) => void;
}) {
  const value = useWatch<ProductFormData>({ control, name });
  return (
    <div className="flex items-center justify-between rounded-lg border border-line bg-ink/[0.02] px-4 py-3">
      <div>
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      <Toggle
        checked={Boolean(value)}
        onChange={(v) => onValueChange(name, v)}
        label={label}
      />
    </div>
  );
}

export default function ProductFormPage() {
  const params = useParams();
  const router = useRouter();
  const isNew = params.id === "new";
  const { data: existing, isLoading: productLoading } = useAdminProduct(isNew ? "" : (params.id as string));
  const { data: categories } = useCategories();
  const { data: brands } = useBrands();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: 0,
      discountPrice: "" as unknown as number,
      stock: 0,
      sku: "",
      isFeatured: false,
      isActive: true,
      categoryId: "",
      brandId: "",
      metaTitle: "",
      metaDesc: "",
      images: [{ url: "", alt: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "images",
  });

  useEffect(() => {
    if (!existing) return;
    form.reset({
      name: existing.name,
      description: existing.description ?? "",
      basePrice: Number(existing.basePrice),
      discountPrice: existing.discountPrice ? String(existing.discountPrice) : "",
      stock: existing.stock,
      sku: existing.sku,
      isFeatured: existing.isFeatured,
      isActive: existing.isActive,
      categoryId: existing.categoryId ?? "",
      brandId: existing.brandId ?? "",
      metaTitle: existing.metaTitle ?? "",
      metaDesc: existing.metaDesc ?? "",
      images: existing.images?.length
        ? existing.images.map((img) => ({ url: img.url, alt: img.alt ?? "" }))
        : [{ url: "", alt: "" }],
    });
  }, [existing, form]);

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      const cleanImages = (data.images ?? [])
        .map((img) => ({ ...img, url: img.url.trim() }))
        .filter((img) => img.url.length > 0);

      const payload = {
        name: data.name,
        description: data.description,
        basePrice: Number(data.basePrice),
        discountPrice: data.discountPrice ? Number(data.discountPrice) : undefined,
        stock: Number(data.stock),
        sku: data.sku,
        isFeatured: data.isFeatured,
        isActive: data.isActive,
        categoryId: (data.categoryId as string) || undefined,
        brandId: (data.brandId as string) || undefined,
        metaTitle: (data.metaTitle as string) || undefined,
        metaDesc: (data.metaDesc as string) || undefined,
        ...(cleanImages.length > 0 && {
          images: cleanImages.map((img, i) => ({ url: img.url, alt: img.alt || undefined, order: i })),
        }),
      } as Partial<Product>;

      if (isNew) {
        await createProduct.mutateAsync(payload);
        toast.success("Product created successfully");
      } else {
        await updateProduct.mutateAsync({ id: params.id as string, data: payload });
        toast.success("Product updated successfully");
      }
      router.push("/admin/products");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        (isNew ? "Failed to create product" : "Failed to update product");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isNew && productLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 animate-pulse rounded bg-ink/10" />
        <div className="h-96 animate-pulse rounded-xl border border-line bg-surface" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalog"
        title={isNew ? "Add Product" : "Edit Product"}
        description={isNew ? "Create a new product in your catalog." : "Update the details of your product."}
        action={
          <Link href="/admin/products">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Button>
          </Link>
        }
      />

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Card>
          <CardHeader title="Basic Information" subtitle="Name, description, pricing and inventory" />
          <div className="grid gap-5 p-6 sm:grid-cols-2">
            <Field label="Product Name" className="sm:col-span-2" error={form.formState.errors.name?.message}>
              <Input {...form.register("name")} placeholder="e.g. TechPro X1 Smartphone" />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <Textarea {...form.register("description")} rows={4} placeholder="Describe the product…" />
            </Field>
            <Field label="Base Price (PKR)" error={form.formState.errors.basePrice?.message}>
              <Input type="number" step="0.01" {...form.register("basePrice")} placeholder="0" />
            </Field>
            <Field label="Discount Price (PKR)">
              <Input type="number" step="0.01" {...form.register("discountPrice")} placeholder="Optional" />
            </Field>
            <Field label="SKU" error={form.formState.errors.sku?.message}>
              <Input {...form.register("sku")} placeholder="e.g. TP-X1-001" />
            </Field>
            <Field label="Stock Quantity">
              <Input type="number" {...form.register("stock")} placeholder="0" />
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader title="Images" subtitle="Add image URLs. The first image is the primary image." />
          <div className="space-y-3 p-6">
            {fields.map((field, i) => (
              <div key={field.id} className="flex items-start gap-3 rounded-lg border border-line bg-ink/[0.02] p-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-ink/5">
                  {field.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={field.url} alt={field.alt || "Product image"} className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-muted" />
                  )}
                </div>
                <div className="grid flex-1 gap-2">
                  <Input
                    type="url"
                    {...form.register(`images.${i}.url`)}
                    placeholder="https://…/image.jpg"
                  />
                  <Input
                    {...form.register(`images.${i}.alt`)}
                    placeholder="Alt text (optional)"
                  />
                </div>
                <IconButton
                  label="Remove image"
                  className="hover:bg-red-50 hover:text-danger"
                  onClick={() => remove(i)}
                >
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ url: "", alt: "" })}
            >
              <Plus className="h-4 w-4" />
              Add Image
            </Button>
          </div>
        </Card>

        <Card>
          <CardHeader title="Organization" subtitle="Assign the product to a category and brand" />
          <div className="grid gap-5 p-6 sm:grid-cols-2">
            <Field label="Category">
              <Select {...form.register("categoryId")}>
                <option value="">No category</option>
                {categories?.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Brand">
              <Select {...form.register("brandId")}>
                <option value="">No brand</option>
                {brands?.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </Select>
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader title="SEO & Status" subtitle="Search metadata and visibility settings" />
          <div className="grid gap-5 p-6 sm:grid-cols-2">
            <Field label="Meta Title" className="sm:col-span-2">
              <Input {...form.register("metaTitle")} placeholder="SEO title" />
            </Field>
            <Field label="Meta Description" className="sm:col-span-2">
              <Textarea {...form.register("metaDesc")} rows={2} placeholder="SEO description" />
            </Field>
            <FormToggle
              name="isFeatured"
              label="Featured product"
              description="Highlight this product on the storefront"
              control={form.control}
              onValueChange={(n, v) => form.setValue(n, v)}
            />
            <FormToggle
              name="isActive"
              label="Active"
              description="Visible and available for purchase"
              control={form.control}
              onValueChange={(n, v) => form.setValue(n, v)}
            />
          </div>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/products">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button type="submit" loading={isSubmitting} className="px-6">
            <Save className="h-4 w-4" />
            {isSubmitting ? "Saving…" : isNew ? "Create Product" : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}