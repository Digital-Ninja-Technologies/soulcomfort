import { Book, Quote, Heart, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";

interface ContentDisplayProps {
  content: string;
  isLoading: boolean;
  onRefresh: () => void;
}

export function ContentDisplay({
  content,
  isLoading,
  onRefresh,
}: ContentDisplayProps) {
  if (isLoading) {
    return (
      <div className="content-card animate-fade-in">
        <div className="flex flex-col items-center justify-center py-12 gap-6">
          <div className="relative">
            <div className="w-16 h-16 rounded-full border-4 border-muted animate-pulse" />
            <Book className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-primary animate-pulse-soft" />
          </div>
          <p className="text-muted-foreground font-display text-lg italic">
            Preparing words of comfort...
          </p>
        </div>
      </div>
    );
  }

  if (!content) {
    return null;
  }

  return (
    <div className="content-card animate-fade-up">
      {/* Decorative header */}
      <div className="divider-ornate mb-8">
        <Quote className="w-5 h-5 text-accent rotate-180" />
      </div>

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="font-display text-3xl text-primary mb-4">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="font-display text-2xl text-primary/90 mt-8 mb-3">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="font-display text-xl text-primary/80 mt-6 mb-2">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-foreground/90 leading-relaxed mb-4 font-body">
                {children}
              </p>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-accent/50 pl-6 my-6 italic text-foreground/80 font-display text-xl">
                {children}
              </blockquote>
            ),
            em: ({ children }) => (
              <em className="text-primary/80 not-italic font-display">
                {children}
              </em>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-primary">{children}</strong>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* Footer */}
      <div className="divider-ornate mt-8 mb-6">
        <Heart className="w-4 h-4 text-accent fill-accent/30" />
      </div>

      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={onRefresh}
          className="gap-2 text-muted-foreground hover:text-primary hover:border-primary/30"
        >
          <RefreshCw className="w-4 h-4" />
          Generate New Content
        </Button>
      </div>
    </div>
  );
}
