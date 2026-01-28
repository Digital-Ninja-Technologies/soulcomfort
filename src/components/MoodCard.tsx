import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MoodCardProps {
  icon: LucideIcon;
  label: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
  delay?: number;
}

export function MoodCard({
  icon: Icon,
  label,
  description,
  isSelected,
  onClick,
  delay = 0,
}: MoodCardProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "mood-card text-left opacity-0 animate-fade-up cursor-pointer group",
        isSelected && "mood-card-active"
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
            isSelected
              ? "bg-primary text-primary-foreground shadow-glow"
              : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "font-display text-xl font-semibold mb-1 transition-colors",
              isSelected ? "text-primary" : "text-foreground"
            )}
          >
            {label}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      
      {/* Decorative corner */}
      <div
        className={cn(
          "absolute top-0 right-0 w-16 h-16 transition-opacity duration-300",
          isSelected ? "opacity-100" : "opacity-0"
        )}
      >
        <svg
          viewBox="0 0 64 64"
          className="w-full h-full text-accent/30"
          fill="currentColor"
        >
          <path d="M64 0 L64 64 L0 0 Z" />
        </svg>
      </div>
    </button>
  );
}
