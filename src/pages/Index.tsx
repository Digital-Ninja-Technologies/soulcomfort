import { useState } from "react";
import { Hero } from "@/components/Hero";
import { MoodSelector, type Mood } from "@/components/MoodSelector";
import { ContentDisplay } from "@/components/ContentDisplay";
import { DailyDevotional } from "@/components/DailyDevotional";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const Index = () => {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [content, setContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDevotional, setShowDevotional] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

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
    setModalOpen(true);
    generateContent(mood);
  };

  const handleRefresh = () => {
    if (selectedMood) {
      generateContent(selectedMood);
    }
  };

  const moodLabels: Record<Mood, string> = {
    peaceful: "Peaceful",
    anxious: "Anxious",
    grateful: "Grateful",
    grieving: "Grieving",
    joyful: "Joyful",
    seeking: "Seeking Guidance",
  };

  return (
    <div className="min-h-screen gradient-radiant">
      <div className="container mx-auto px-4 pb-16">
        {/* Top Bar */}
        <div className="flex justify-end py-4">
          <UserMenu onShowDevotional={() => setShowDevotional(true)} />
        </div>

        {/* Hero Section */}
        <Hero />

        {/* Daily Devotional for logged-in users */}
        {user && showDevotional && (
          <section className="max-w-3xl mx-auto mb-12">
            <DailyDevotional onClose={() => setShowDevotional(false)} />
          </section>
        )}

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

        {/* Content Modal */}
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-primary">
                {selectedMood ? `Feeling ${moodLabels[selectedMood]}` : "Your Content"}
              </DialogTitle>
            </DialogHeader>
            <ContentDisplay
              content={content}
              isLoading={isLoading}
              onRefresh={handleRefresh}
            />
          </DialogContent>
        </Dialog>

        {/* Footer hint when no content */}
        {!selectedMood && (
          <p className="text-center text-muted-foreground/60 mt-8 font-display italic opacity-0 animate-fade-in stagger-6">
            {user
              ? "Your daily devotional is above. Select a mood for additional content."
              : "Select a mood above to receive personalized spiritual content"}
          </p>
        )}
      </div>
    </div>
  );
};

export default Index;
