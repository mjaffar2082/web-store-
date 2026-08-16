"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import { Review } from "@/types";
import { useAuthStore } from "@/stores/auth-store";
import { useAddReview } from "@/hooks/use-wishlist";
import { toast } from "sonner";

function RatingStars({ rating, size = "h-4 w-4" }: { rating: number; size?: string }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${size} ${i < Math.round(rating) ? "text-accent" : "text-line"}`}
          fill={i < Math.round(rating) ? "currentColor" : "none"}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

function ReviewForm({ slug }: { slug: string }) {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const addReview = useAddReview();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  if (status !== "authenticated") {
    return (
      <div className="rounded border border-line bg-surface p-5 text-center">
        <p className="text-sm text-muted">
          <button
            onClick={() => router.push(`/login?redirect=${encodeURIComponent(`/product/${slug}`)}`)}
            className="text-accent underline-offset-4 hover:underline"
          >
            Sign in
          </button>{" "}
          to share your review.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addReview.mutateAsync({ slug, data: { rating, title: title || undefined, comment: comment || undefined } });
      toast.success("Thank you for your review");
      setTitle("");
      setComment("");
    } catch (err: unknown) {
      toast.error(
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          "Could not submit review"
      );
    }
  };

  const inputClass =
    "mt-2 w-full border border-line bg-surface px-4 py-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="mt-6 border border-line bg-surface p-5 sm:p-6">
      <div>
        <label className="block text-xs uppercase tracking-wider text-muted">Your Rating</label>
        <div className="mt-2 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setRating(value)}
              aria-label={`${value} stars`}
            >
              <Star
                className={`h-6 w-6 ${value <= rating ? "text-accent" : "text-line"}`}
                fill={value <= rating ? "currentColor" : "none"}
                strokeWidth={1.5}
              />
            </button>
          ))}
        </div>
      </div>
      <div className="mt-5">
        <label className="block text-xs uppercase tracking-wider text-muted">Title (optional)</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
      </div>
      <div className="mt-5">
        <label className="block text-xs uppercase tracking-wider text-muted">Review (optional)</label>
        <textarea rows={3} value={comment} onChange={(e) => setComment(e.target.value)} className={inputClass} />
      </div>
      <button type="submit" disabled={addReview.isPending} className="btn-ink mt-6 px-8 py-3 disabled:opacity-50">
        {addReview.isPending ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}

export function ReviewSection({ slug, reviews }: { slug: string; reviews: Review[] }) {
  const average = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;

  return (
    <section className="mt-16 border-t border-line pt-12" id="reviews">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Customer Reviews</p>
          <h2 className="mt-2 font-display text-3xl text-ink">What People Are Saying</h2>
        </div>
        {reviews.length > 0 && (
          <div className="flex items-center gap-3">
            <RatingStars rating={average} />
            <span className="text-sm text-muted">
              {average.toFixed(1)} · {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
            </span>
          </div>
        )}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <div>
          {reviews.length === 0 ? (
            <p className="text-sm text-muted">No reviews yet. Be the first to share your experience.</p>
          ) : (
            <div className="space-y-5">
              {reviews.map((review) => (
                <div key={review.id} className="border border-line bg-surface p-5">
                  <div className="flex items-center justify-between">
                    <RatingStars rating={review.rating} />
                    <span className="text-xs text-muted">{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                  {review.title && <p className="mt-3 text-sm font-medium text-ink">{review.title}</p>}
                  {review.comment && <p className="mt-1.5 text-sm leading-relaxed text-muted">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <ReviewForm slug={slug} />
        </div>
      </div>
    </section>
  );
}