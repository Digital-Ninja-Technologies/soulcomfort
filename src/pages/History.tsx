import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";

interface Devotional {
  id: string;
  content: string;
  mood: string;
  devotional_date: string;
}

export default function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [devotionals, setDevotionals] = useState<Devotional[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEntry, setSelectedEntry] = useState<Devotional | null>(null);
  const [activeDates, setActiveDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    loadDevotionals();
  }, [user]);

  const loadDevotionals = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("daily_devotionals")
      .select("*")
      .eq("user_id", user.id)
      .order("devotional_date", { ascending: false });

    const items = data || [];
    setDevotionals(items);
    setActiveDates(items.map((d) => new Date(d.devotional_date + "T00:00:00")));

    // Select today's entry if exists
    const today = new Date().toISOString().split("T")[0];
    const todayEntry = items.find((d) => d.devotional_date === today);
    if (todayEntry) setSelectedEntry(todayEntry);
    setLoading(false);
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (!date) {
      setSelectedEntry(null);
      return;
    }
    const dateStr = date.toISOString().split("T")[0];
    const entry = devotionals.find((d) => d.devotional_date === dateStr);
    setSelectedEntry(entry || null);
  };

  const modifiers = { active: activeDates };
  const modifiersStyles = {
    active: {
      backgroundColor: "hsl(var(--primary) / 0.15)",
      borderRadius: "50%",
      color: "hsl(var(--primary))",
      fontWeight: 600,
    },
  };

  return (
    <div className="min-h-screen gradient-radiant">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="font-display text-3xl text-primary">Devotional History</h1>
          </div>
        </div>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : (
          <div className="grid md:grid-cols-[auto_1fr] gap-8">
            <div className="content-card flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                modifiers={modifiers}
                modifiersStyles={modifiersStyles}
              />
            </div>
            <div>
              {selectedEntry ? (
                <div className="content-card">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-display capitalize">
                      {selectedEntry.mood}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {new Date(selectedEntry.devotional_date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{selectedEntry.content}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <div className="content-card text-center py-12">
                  <BookOpen className="w-10 h-10 mx-auto text-muted-foreground/40 mb-3" />
                  <p className="text-muted-foreground font-display">
                    {selectedDate ? "No devotional for this date" : "Select a date to view"}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
