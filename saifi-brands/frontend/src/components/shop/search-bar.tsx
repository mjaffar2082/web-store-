"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useProductSearch } from "@/hooks/use-products";
import Link from "next/link";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  const [inputValue, setInputValue] = useState(value);
  const [debouncedValue, setDebouncedValue] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, 300);
    return () => clearTimeout(timer);
  }, [inputValue]);

  const { data: suggestions } = useProductSearch(debouncedValue);

  useEffect(() => {
    onChange(debouncedValue);
  }, [debouncedValue, onChange]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" strokeWidth={1.5} />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search the collection..."
          className="w-full border border-line bg-surface py-3 pl-10 pr-10 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none"
        />
        {inputValue && (
          <button
            onClick={() => {
              setInputValue("");
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-muted" />
          </button>
        )}
      </div>
      {isOpen && suggestions && suggestions.length > 0 && (
        <div className="absolute top-full z-10 mt-2 w-full border border-line bg-surface shadow-xl">
          <p className="px-4 pt-3 text-[0.625rem] uppercase tracking-[0.22em] text-muted">
            Suggestions
          </p>
          {suggestions.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              onClick={() => {
                setIsOpen(false);
                setInputValue("");
              }}
              className="flex items-center justify-between px-4 py-2.5 text-sm text-ink transition-colors hover:bg-background"
            >
              <span>{product.name}</span>
              <span className="text-[0.625rem] uppercase tracking-[0.18em] text-accent">
                View
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}