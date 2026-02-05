import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  audioUrl?: string;
  audioBase64?: string;
  title?: string;
  subtitle?: string;
  onComplete?: () => void;
  className?: string;
}

export function AudioPlayer({
  audioUrl,
  audioBase64,
  title,
  subtitle,
  onComplete,
  className,
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const audioSrc = audioBase64
    ? `data:audio/mp3;base64,${audioBase64}`
    : audioUrl;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onComplete]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div
      className={cn(
        "rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/50 dark:to-purple-950/50 p-6",
        className
      )}
      data-testid="audio-player"
    >
      <audio ref={audioRef} src={audioSrc} preload="metadata" />

      {(title || subtitle) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-medium text-foreground" data-testid="text-audio-title">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-muted-foreground" data-testid="text-audio-subtitle">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-4">
        <Button
          size="lg"
          className="rounded-full"
          onClick={togglePlay}
          data-testid="button-play-pause"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6 ml-0.5" />
          )}
        </Button>

        <div className="flex-1 space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={0.1}
            onValueChange={handleSeek}
            className="cursor-pointer"
            data-testid="slider-progress"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span data-testid="text-current-time">{formatTime(currentTime)}</span>
            <span data-testid="text-duration">{formatTime(duration)}</span>
          </div>
        </div>

        <Button
          size="icon"
          variant="ghost"
          onClick={toggleMute}
          data-testid="button-mute"
        >
          {isMuted ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
}
