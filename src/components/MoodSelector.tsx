import {
  Heart,
  CloudRain,
  Sparkles,
  Sunrise,
  HandHeart,
  Compass,
} from "lucide-react";
import { MoodCard } from "./MoodCard";

export type Mood =
  | "peaceful"
  | "anxious"
  | "grateful"
  | "grieving"
  | "joyful"
  | "seeking";

interface MoodOption {
  id: Mood;
  label: string;
  description: string;
  icon: typeof Heart;
}

const moodOptions: MoodOption[] = [
  {
    id: "peaceful",
    label: "Peaceful",
    description: "Seeking rest and quiet communion with God",
    icon: Sunrise,
  },
  {
    id: "anxious",
    label: "Anxious",
    description: "Needing comfort and reassurance in troubled times",
    icon: CloudRain,
  },
  {
    id: "grateful",
    label: "Grateful",
    description: "Overflowing with thankfulness and praise",
    icon: Sparkles,
  },
  {
    id: "grieving",
    label: "Grieving",
    description: "Mourning a loss and seeking solace",
    icon: Heart,
  },
  {
    id: "joyful",
    label: "Joyful",
    description: "Celebrating God's blessings with a glad heart",
    icon: HandHeart,
  },
  {
    id: "seeking",
    label: "Seeking Guidance",
    description: "Looking for direction and wisdom from above",
    icon: Compass,
  },
];

interface MoodSelectorProps {
  selectedMood: Mood | null;
  onSelect: (mood: Mood) => void;
  disabled?: boolean;
}

export function MoodSelector({
  selectedMood,
  onSelect,
  disabled,
}: MoodSelectorProps) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {moodOptions.map((mood, index) => (
          <MoodCard
            key={mood.id}
            icon={mood.icon}
            label={mood.label}
            description={mood.description}
            isSelected={selectedMood === mood.id}
            onClick={() => !disabled && onSelect(mood.id)}
            delay={100 + index * 80}
          />
        ))}
      </div>
    </div>
  );
}
