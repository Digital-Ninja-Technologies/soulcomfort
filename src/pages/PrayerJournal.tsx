import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Check, Trash2, BookHeart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Prayer {
  id: string;
  title: string;
  content: string | null;
  is_answered: boolean;
  answered_at: string | null;
  created_at: string;
}

export default function PrayerJournal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "answered">("all");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadPrayers();
  }, [user]);

  const loadPrayers = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("prayers")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setPrayers(data || []);
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!user || !title.trim()) return;
    const { data, error } = await supabase
      .from("prayers")
      .insert({ user_id: user.id, title: title.trim(), content: content.trim() || null })
      .select()
      .single();
    if (error) {
      toast.error("Failed to add prayer");
      return;
    }
    setPrayers((prev) => [data, ...prev]);
    setTitle("");
    setContent("");
    setShowForm(false);
    toast.success("Prayer added");
  };

  const handleToggleAnswered = async (prayer: Prayer) => {
    const newAnswered = !prayer.is_answered;
    const { error } = await supabase
      .from("prayers")
      .update({
        is_answered: newAnswered,
        answered_at: newAnswered ? new Date().toISOString() : null,
      })
      .eq("id", prayer.id);
    if (error) return;
    setPrayers((prev) =>
      prev.map((p) =>
        p.id === prayer.id
          ? { ...p, is_answered: newAnswered, answered_at: newAnswered ? new Date().toISOString() : null }
          : p
      )
    );
    toast.success(newAnswered ? "Marked as answered! 🙏" : "Marked as active");
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("prayers").delete().eq("id", id);
    if (error) return;
    setPrayers((prev) => prev.filter((p) => p.id !== id));
    toast.success("Prayer removed");
  };

  const filtered = prayers.filter((p) => {
    if (filter === "active") return !p.is_answered;
    if (filter === "answered") return p.is_answered;
    return true;
  });

  return (
    <div className="min-h-screen gradient-radiant">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BookHeart className="w-6 h-6 text-primary" />
            <h1 className="font-display text-3xl text-primary">Prayer Journal</h1>
          </div>
        </div>

        {/* Filters & Add */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex gap-2">
            {(["all", "active", "answered"] as const).map((f) => (
              <Button
                key={f}
                variant={filter === f ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(f)}
                className="capitalize"
              >
                {f}
              </Button>
            ))}
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" />
            New Prayer
          </Button>
        </div>

        {/* Add Form */}
        {showForm && (
          <div className="content-card mb-6 space-y-4">
            <Input
              placeholder="Prayer title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Textarea
              placeholder="Details (optional)..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdd} disabled={!title.trim()}>
                Add Prayer
              </Button>
            </div>
          </div>
        )}

        {/* Prayer List */}
        {loading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <BookHeart className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground font-display text-lg">
              {filter === "all" ? "No prayers yet" : `No ${filter} prayers`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((prayer) => (
              <div
                key={prayer.id}
                className={`content-card flex items-start gap-4 ${prayer.is_answered ? "opacity-75" : ""}`}
              >
                <button
                  onClick={() => handleToggleAnswered(prayer)}
                  className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                    prayer.is_answered
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-muted-foreground/40 hover:border-primary"
                  }`}
                >
                  {prayer.is_answered && <Check className="w-3 h-3" />}
                </button>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-display text-lg ${
                      prayer.is_answered ? "line-through text-muted-foreground" : "text-foreground"
                    }`}
                  >
                    {prayer.title}
                  </h3>
                  {prayer.content && (
                    <p className="text-sm text-muted-foreground mt-1">{prayer.content}</p>
                  )}
                  <p className="text-xs text-muted-foreground/60 mt-2">
                    {new Date(prayer.created_at).toLocaleDateString()}
                    {prayer.answered_at && ` • Answered ${new Date(prayer.answered_at).toLocaleDateString()}`}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(prayer.id)}
                  className="text-muted-foreground hover:text-destructive h-8 w-8 flex-shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
