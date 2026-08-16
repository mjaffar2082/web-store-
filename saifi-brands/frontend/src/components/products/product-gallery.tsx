"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductImage } from "@/types";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center border border-line bg-surface">
        <span className="text-sm text-muted">No images available</span>
      </div>
    );
  }

  const selectedImage = images[selectedIndex];

  return (
    <div className="space-y-4">
      <div
        className="relative aspect-[3/4] cursor-zoom-in overflow-hidden border border-line bg-surface"
        onMouseEnter={() => setIsZoomed(true)}
        onMouseLeave={() => setIsZoomed(false)}
      >
        <Image
          src={selectedImage.url}
          alt={selectedImage.alt || productName}
          fill
          className={`object-cover transition-transform duration-500 ${isZoomed ? "scale-150" : "scale-100"}`}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={`relative h-24 w-24 shrink-0 overflow-hidden border transition-colors ${
                index === selectedIndex ? "border-accent" : "border-line hover:border-ink"
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt || `${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="96px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}