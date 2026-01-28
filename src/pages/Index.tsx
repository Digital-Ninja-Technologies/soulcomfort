import { useState } from "react";
import { Hero } from "@/components/Hero";
import { MoodSelector, type Mood } from "@/components/MoodSelector";
import { ContentDisplay } from "@/components/ContentDisplay";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const generateContent = async (mood: Mood) => {
    setIsLoading(true);
    setContent("");

    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { mood },
      });

      if (error) {
        console.error("Error generating content:", error);
        toast.error("Failed to generate content. Please try again.");
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      setContent(data.content);
    } catch (err) {
      console.error("Error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoodSelect = (mood: Mood) => {
    setSelectedMood(mood);
    generateContent(mood);
  };

  const handleRefresh = () => {
    if (selectedMood) {
      generateContent(selectedMood);
    }
  };

  return (
    <div className="min-h-screen gradient-radiant">
      <div className="container mx-auto px-4 pb-16">
        {/* Hero Section */}
        <Hero />

        {/* Mood Selection Section */}
        <section className="mb-12">
          <h2 className="font-display text-2xl text-center text-foreground/80 mb-8 opacity-0 animate-fade-up stagger-4">
            How are you feeling today?
          </h2>
          <MoodSelector
            selectedMood={selectedMood}
            onSelect={handleMoodSelect}
            disabled={isLoading}
          />
        </section>

        {/* Content Display Section */}
        {(isLoading || content) && (
          <section className="max-w-3xl mx-auto">
            <ContentDisplay
              content={content}
              isLoading={isLoading}
              onRefresh={handleRefresh}
            />
          </section>
        )}

        {/* Footer hint when no content */}
        {!isLoading && !content && selectedMood === null && (
          <p className="text-center text-muted-foreground/60 mt-8 font-display italic opacity-0 animate-fade-in stagger-6">
            Select a mood above to receive personalized spiritual content
          </p>
        )}
      </div>
    </div>
  );
};

export default Index;
