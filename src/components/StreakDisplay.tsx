import { useState, useEffect } from "react";
import { Flame } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export function StreakDisplay() {
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (user) loadAndUpdateStreak();
  }, [user]);

  const loadAndUpdateStreak = async () => {
    if (!user) return;

    const today = new Date().toISOString().split("T")[0];

    const { data } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!data) {
      // Create initial streak
      await supabase.from("user_streaks").insert({
        user_id: user.id,
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: today,
      });
      setStreak(1);
      return;
    }

    const lastDate = data.last_activity_date;
    if (lastDate === today) {
      setStreak(data.current_streak);
      return;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak = 1;
    if (lastDate === yesterdayStr) {
      newStreak = data.current_streak + 1;
    }

    const newLongest = Math.max(newStreak, data.longest_streak);

    await supabase
      .from("user_streaks")
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_activity_date: today,
      })
      .eq("user_id", user.id);

    setStreak(newStreak);
  };

  if (!user || streak === 0) return null;

  return (
    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/20 text-accent-foreground">
      <Flame className="w-4 h-4 text-accent" />
      <span className="text-sm font-display font-semibold">{streak}</span>
      <span className="text-xs text-muted-foreground">day{streak !== 1 ? "s" : ""}</span>
    </div>
  );
}
