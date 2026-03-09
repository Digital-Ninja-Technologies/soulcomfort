import { useState } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface FavoriteButtonProps {
  content: string;
  mood: string;
  sourceType?: string;
}

export function FavoriteButton({ content, mood, sourceType = "devotional" }: FavoriteButtonProps) {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!user) {
      toast.error("Please sign in to save favorites");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.from("favorites").insert({
        user_id: user.id,
        content,
        mood,
        source_type: sourceType,
      });

      if (error) throw error;

      setIsSaved(true);
      toast.success("Saved to favorites!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSave}
      disabled={isSaved || isLoading}
      className="gap-2 text-muted-foreground hover:text-primary hover:border-primary/30"
    >
      <Heart className={`w-4 h-4 ${isSaved ? "fill-primary text-primary" : ""}`} />
      {isSaved ? "Saved" : "Save"}
    </Button>
  );
}
