import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Heart, Trash2, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Favorite {
  id: string;
  content: string;
  mood: string;
  source_type: string;
  created_at: string;
}

export default function Favorites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadFavorites();
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("favorites")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setFavorites(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("favorites").delete().eq("id", id);
    if (error) {
      toast.error("Failed to delete");
      return;
    }
    setFavorites((prev) => prev.filter((f) => f.id !== id));
    toast.success("Removed from favorites");
  };

  return (
    <div className="min-h-screen gradient-radiant">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-primary" />
            <h1 className="font-display text-3xl text-primary">Favorites</h1>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground font-display text-lg">No favorites saved yet</p>
            <p className="text-muted-foreground/60 text-sm mt-2">
              Save content you love by clicking the heart icon
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {favorites.map((fav) => (
              <div key={fav.id} className="content-card">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-display capitalize">
                    {fav.mood}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {new Date(fav.created_at).toLocaleDateString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(fav.id)}
                      className="text-muted-foreground hover:text-destructive h-8 w-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{fav.content}</ReactMarkdown>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
