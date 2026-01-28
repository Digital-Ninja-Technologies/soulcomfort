import { Cross } from "lucide-react";

export function Hero() {
  return (
    <header className="text-center py-16 px-4">
      {/* Logo/Icon */}
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6 animate-fade-in">
        <Cross className="w-8 h-8 text-primary" />
      </div>

      {/* Title */}
      <h1 className="font-display text-5xl md:text-6xl font-semibold text-foreground mb-4 opacity-0 animate-fade-up stagger-1">
        <span className="text-gradient">Soul Comfort</span>
      </h1>

      {/* Tagline */}
      <p className="font-display text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed opacity-0 animate-fade-up stagger-2">
        Find peace, hope, and spiritual guidance tailored to your heart's needs
      </p>

      {/* Decorative divider */}
      <div className="flex items-center justify-center gap-3 mt-8 opacity-0 animate-fade-in stagger-3">
        <div className="w-12 h-px bg-gradient-to-r from-transparent to-border" />
        <span className="text-accent text-2xl">✦</span>
        <div className="w-12 h-px bg-gradient-to-l from-transparent to-border" />
      </div>
    </header>
  );
}
