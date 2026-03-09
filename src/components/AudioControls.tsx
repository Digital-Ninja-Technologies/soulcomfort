import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const AMBIENT_SOUNDS = [
  { id: "rain", label: "🌧️ Rain", url: "https://cdn.freesound.org/previews/531/531947_6386094-lq.mp3" },
  { id: "forest", label: "🌲 Forest", url: "https://cdn.freesound.org/previews/462/462087_9497060-lq.mp3" },
  { id: "ocean", label: "🌊 Ocean", url: "https://cdn.freesound.org/previews/467/467539_9497060-lq.mp3" },
];

export function AudioControls({ content }: { content?: string }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ambientPlaying, setAmbientPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      audioRef.current?.pause();
    };
  }, []);

  const handleReadAloud = () => {
    if (!content) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const plainText = content
      .replace(/#{1,6}\s/g, "")
      .replace(/\*\*/g, "")
      .replace(/\*/g, "")
      .replace(/>/g, "")
      .trim();

    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleAmbientSound = (soundId: string) => {
    if (ambientPlaying === soundId) {
      audioRef.current?.pause();
      setAmbientPlaying(null);
      return;
    }

    const sound = AMBIENT_SOUNDS.find((s) => s.id === soundId);
    if (!sound) return;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(sound.url);
    audio.loop = true;
    audio.volume = 0.3;
    audio.play().catch(() => {});
    audioRef.current = audio;
    setAmbientPlaying(soundId);
  };

  return (
    <div className="flex items-center gap-2">
      {content && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleReadAloud}
          className="gap-2 text-muted-foreground hover:text-primary hover:border-primary/30"
        >
          {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          {isSpeaking ? "Stop" : "Read Aloud"}
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
                  audioRef.current?.pause();
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
