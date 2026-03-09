import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

const AMBIENT_SOUNDS = [
  { id: "rain", label: "🌧️ Rain", url: "https://cdn.freesound.org/previews/531/531947_6386094-lq.mp3" },
  { id: "forest", label: "🌲 Forest", url: "https://cdn.freesound.org/previews/462/462087_9497060-lq.mp3" },
  { id: "ocean", label: "🌊 Ocean", url: "https://cdn.freesound.org/previews/467/467539_9497060-lq.mp3" },
];

export function AudioControls({ content }: { content?: string }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingTTS, setIsLoadingTTS] = useState(false);
  const [ambientPlaying, setAmbientPlaying] = useState<string | null>(null);
  const ttsAudioRef = useRef<HTMLAudioElement | null>(null);
  const ambientAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      ttsAudioRef.current?.pause();
      ambientAudioRef.current?.pause();
    };
  }, []);

  const getPlainText = (markdown: string) => {
    return markdown
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/>/g, "")
      .trim();
  };

  const handleReadAloud = async () => {
    if (!content) return;

    if (isPlaying) {
      ttsAudioRef.current?.pause();
      setIsPlaying(false);
      return;
    }

    setIsLoadingTTS(true);
    try {
      const plainText = getPlainText(content);

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text: plainText }),
        }
      );

      if (!response.ok) {
        throw new Error("TTS request failed");
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      if (ttsAudioRef.current) {
        ttsAudioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => {
        setIsPlaying(false);
        toast.error("Audio playback failed");
      };
      ttsAudioRef.current = audio;
      await audio.play();
      setIsPlaying(true);
    } catch (err) {
      console.error("TTS error:", err);
      toast.error("Failed to generate speech. Please try again.");
    } finally {
      setIsLoadingTTS(false);
    }
  };

  const handleAmbientSound = (soundId: string) => {
    if (ambientPlaying === soundId) {
      ambientAudioRef.current?.pause();
      setAmbientPlaying(null);
      return;
    }

    const sound = AMBIENT_SOUNDS.find((s) => s.id === soundId);
    if (!sound) return;

    if (ambientAudioRef.current) {
      ambientAudioRef.current.pause();
    }

    const audio = new Audio(sound.url);
    audio.loop = true;
    audio.volume = 0.3;
    audio.play().catch(() => {});
    ambientAudioRef.current = audio;
    setAmbientPlaying(soundId);
  };

  return (
    <div className="flex items-center gap-2">
      {content && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleReadAloud}
          disabled={isLoadingTTS}
          className="gap-2 text-muted-foreground hover:text-primary hover:border-primary/30"
        >
          {isLoadingTTS ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : isPlaying ? (
            <VolumeX className="w-4 h-4" />
          ) : (
            <Volume2 className="w-4 h-4" />
          )}
          {isLoadingTTS ? "Loading..." : isPlaying ? "Stop" : "Read Aloud"}
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-muted-foreground hover:text-primary hover:border-primary/30"
          >
            {ambientPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            Ambient
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="text-xs text-muted-foreground">Background Sounds</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {AMBIENT_SOUNDS.map((sound) => (
            <DropdownMenuItem
              key={sound.id}
              onClick={() => handleAmbientSound(sound.id)}
              className="cursor-pointer"
            >
              {sound.label}
              {ambientPlaying === sound.id && <span className="ml-auto text-primary text-xs">Playing</span>}
            </DropdownMenuItem>
          ))}
          {ambientPlaying && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  ambientAudioRef.current?.pause();
                  setAmbientPlaying(null);
                }}
                className="cursor-pointer text-destructive"
              >
                Stop All
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
