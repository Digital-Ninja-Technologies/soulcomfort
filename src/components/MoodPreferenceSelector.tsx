import {
  Heart,
  CloudRain,
  Sparkles,
  Sunrise,
  HandHeart,
  Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Mood } from "./MoodSelector";

interface MoodOption {
  id: Mood;
  label: string;
  icon: typeof Heart;
}

const moodOptions: MoodOption[] = [
  { id: "peaceful", label: "Peaceful", icon: Sunrise },
  { id: "anxious", label: "Anxious", icon: CloudRain },
  { id: "grateful", label: "Grateful", icon: Sparkles },
  { id: "grieving", label: "Grieving", icon: Heart },
  { id: "joyful", label: "Joyful", icon: HandHeart },
  { id: "seeking", label: "Seeking", icon: Compass },
];

interface MoodPreferenceSelectorProps {
  selectedMood: Mood;
  onSelect: (mood: Mood) => void;
  disabled?: boolean;
}

export function MoodPreferenceSelector({
  selectedMood,
  onSelect,
  disabled,
}: MoodPreferenceSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {moodOptions.map((mood) => {
        const Icon = mood.icon;
        const isSelected = selectedMood === mood.id;
        
        return (
          <button
            key={mood.id}
            onClick={() => !disabled && onSelect(mood.id)}
            disabled={disabled}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-200",
              isSelected
                ? "bg-primary/10 border-primary text-primary"
                : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-primary",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="font-medium text-sm">{mood.label}</span>
          </button>
        );
      })}
    </div>
  );
}
