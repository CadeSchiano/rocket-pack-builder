import { useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface PackRatingProps {
  packId: string;
  userId: string | null;
}

export const PackRating = ({ packId, userId }: PackRatingProps) => {
  const [hoveredRating, setHoveredRating] = useState(0);
  const queryClient = useQueryClient();

  // Fetch average rating and user's rating
  const { data: ratings } = useQuery({
    queryKey: ["pack-ratings", packId],
    queryFn: async () => {
      const [avgResult, userResult] = await Promise.all([
        supabase
          .from("pack_ratings")
          .select("rating")
          .eq("pack_id", packId),
        userId
          ? supabase
              .from("pack_ratings")
              .select("rating")
              .eq("pack_id", packId)
              .eq("user_id", userId)
              .maybeSingle()
          : Promise.resolve({ data: null }),
      ]);

      const ratings = avgResult.data || [];
      const average = ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
        : 0;

      return {
        average: Math.round(average * 10) / 10,
        count: ratings.length,
        userRating: userResult.data?.rating || null,
      };
    },
  });

  const rateMutation = useMutation({
    mutationFn: async (rating: number) => {
      if (!userId) {
        toast.error("Please sign in to rate");
        return;
      }

      const { error } = await supabase
        .from("pack_ratings")
        .upsert({
          pack_id: packId,
          user_id: userId,
          rating,
        }, {
          onConflict: "pack_id,user_id",
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pack-ratings", packId] });
      toast.success("Rating submitted!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to submit rating");
    },
  });

  const handleRating = (rating: number) => {
    rateMutation.mutate(rating);
  };

  const displayRating = hoveredRating || ratings?.userRating || 0;

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            disabled={!userId || rateMutation.isPending}
            className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
          >
            <Star
              className={`h-5 w-5 ${
                star <= displayRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground"
              }`}
            />
          </button>
        ))}
      </div>
      {ratings && (
        <div className="text-sm text-muted-foreground">
          {ratings.average > 0 ? (
            <>
              <span className="font-medium">{ratings.average.toFixed(1)}</span>
              <span className="mx-1">·</span>
              <span>{ratings.count} {ratings.count === 1 ? "rating" : "ratings"}</span>
            </>
          ) : (
            <span>No ratings yet</span>
          )}
        </div>
      )}
    </div>
  );
};
