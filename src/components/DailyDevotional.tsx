import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Book, Settings, RefreshCw, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentDisplay } from "./ContentDisplay";
import { MoodPreferenceSelector } from "./MoodPreferenceSelector";
import { toast } from "sonner";
import type { Mood } from "./MoodSelector";

interface DailyDevotionalProps {
  onClose?: () => void;
}

export function DailyDevotional({ onClose }: DailyDevotionalProps) {
  const { user } = useAuth();
  const [preferredMood, setPreferredMood] = useState<Mood>("peaceful");
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (user) {
      loadDailyDevotional();
    }
  }, [user]);

  const loadDailyDevotional = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // First, get user's preferred mood
      const { data: preferences } = await supabase
        .from("user_preferences")
        .select("preferred_mood")
        .eq("user_id", user.id)
        .single();

      if (preferences?.preferred_mood) {
        setPreferredMood(preferences.preferred_mood as Mood);
      }

      // Check if we already have today's devotional
      const today = new Date().toISOString().split("T")[0];
      const { data: existingDevotional } = await supabase
        .from("daily_devotionals")
        .select("content, mood")
        .eq("user_id", user.id)
        .eq("devotional_date", today)
        .single();

      if (existingDevotional) {
        setContent(existingDevotional.content);
        setPreferredMood(existingDevotional.mood as Mood);
      } else {
        // Generate new content for today
        await generateDevotional(preferences?.preferred_mood || "peaceful");
      }
    } catch (error) {
      console.error("Error loading devotional:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDevotional = async (mood: string) => {
    if (!user) return;
    
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { mood },
      });

      if (error) {
        console.error("Error generating devotional:", error);
        toast.error("Failed to generate devotional");
        return;
      }

      if (data?.content) {
        setContent(data.content);
        
        // Save to database
        const today = new Date().toISOString().split("T")[0];
        
        // Delete any existing devotional for today first
        await supabase
          .from("daily_devotionals")
          .delete()
          .eq("user_id", user.id)
          .eq("devotional_date", today);
        
        // Insert new devotional
        await supabase
          .from("daily_devotionals")
          .insert({
            user_id: user.id,
            mood: mood,
            content: data.content,
            devotional_date: today,
          });
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMoodChange = async (newMood: Mood) => {
    if (!user) return;
    
    setPreferredMood(newMood);
    
    // Update user preferences
    await supabase
      .from("user_preferences")
      .update({ preferred_mood: newMood })
      .eq("user_id", user.id);

    // Generate new content with new mood
    await generateDevotional(newMood);
    setShowSettings(false);
    toast.success("Preferences updated and new devotional generated!");
  };

  const handleRefresh = () => {
    generateDevotional(preferredMood);
  };

  if (!user) return null;

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="content-card animate-fade-up mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center">
            <Sun className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h2 className="font-display text-xl text-primary">Daily Devotional</h2>
            <p className="text-sm text-muted-foreground">{today}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowSettings(!showSettings)}
            className="text-muted-foreground hover:text-primary"
          >
            <Settings className="w-5 h-5" />
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-primary"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border/50">
          <h3 className="font-display text-lg text-primary mb-3">
            Select Your Preferred Mood
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            Your daily devotional will be generated based on this mood each day.
          </p>
          <MoodPreferenceSelector
            selectedMood={preferredMood}
            onSelect={handleMoodChange}
            disabled={isGenerating}
          />
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12 gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-muted animate-pulse" />
            <Book className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse-soft" />
          </div>
          <p className="text-muted-foreground font-display text-lg italic">
            Loading your daily devotional...
          </p>
        </div>
      ) : (
        <ContentDisplay
          content={content}
          isLoading={isGenerating}
          onRefresh={handleRefresh}
        />
      )}
    </div>
  );
}
