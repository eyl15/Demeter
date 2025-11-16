import React, { useMemo, useRef, useState } from "react";

type TextToSpeechProps = {
  // Text to convert. If omitted, you can still pass text via the button's value prop when using this component.
  text?: string;
  // Optional: override the default voice
  voiceId?: string;
  // Button label
  label?: string;
  // Forwarded className for styling
  className?: string;
  // Optional: API base URL if different
  apiBaseUrl?: string; // e.g., ${import.meta.env.VITE_API_URL}
};

const DEFAULT_SAMPLE =
  "Step 1: Sift flour, baking powder, sugar, and salt together in a large bowl. Make a well in the center and add milk, melted butter, and egg; mix until smooth.";

const TextToSpeech: React.FC<TextToSpeechProps> = ({
  text,
  voiceId,
  label = "Play Audio",
  className,
  apiBaseUrl = "${import.meta.env.VITE_API_URL}",
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  // Default to a known voice; allow override via props
  const selectedVoice = useMemo(
    () => voiceId ?? "3uuRWB9kyEGWr019IxaR",
    [voiceId]
  );
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper to resolve the text to speak on click
  const resolveText = (evt?: React.MouseEvent<HTMLButtonElement>) => {
    if (text && text.trim()) return text.trim();
    // fallback: allow consumers to pass text via the button's value attribute
    const valueAttr = evt?.currentTarget?.value?.toString();
    if (valueAttr && valueAttr.trim()) return valueAttr.trim();
    return DEFAULT_SAMPLE;
  };

  const handleGenerateAudio = async (
    evt?: React.MouseEvent<HTMLButtonElement>
  ) => {
    // If we already have audio loaded, use this button as a play/pause toggle.
    const existing = audioRef.current;
    if (existing) {
      if (isPlaying) {
        existing.pause();
        setIsPlaying(false);
        return;
      }
      await existing.play();
      setIsPlaying(true);
      return;
    }

    const finalText = resolveText(evt);
    if (!finalText) {
      setError("Please provide text to convert to speech.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}/api/text-to-speech`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: finalText,
          voiceId: selectedVoice,
          modelId: "eleven_multilingual_v2",
          outputFormat: "mp3_44100_128",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate audio.");
      }

      // Stop any currently playing audio first
      const prev = audioRef.current;
      if (prev) {
        prev.pause();
        audioRef.current = null;
      }

      const audio = new Audio(`data:audio/mpeg;base64,${data.audio}`);
      audioRef.current = audio;

      audio.onended = () => setIsPlaying(false);
      await audio.play();
      setIsPlaying(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "An error occurred while generating audio.";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleGenerateAudio}
        disabled={isGenerating}
        className={className}
        // You can also override the text by passing a value prop when using this component elsewhere
        value={text ?? DEFAULT_SAMPLE}
        aria-busy={isGenerating}
        aria-label={label}
        title={label}
      >
        {isGenerating ? "Generating…" : isPlaying ? "Playing…" : label}
      </button>
      {/* Expose errors non-intrusively for quick testing */}
      {error && (
        <span
          role="status"
          aria-live="polite"
          style={{ display: "block", marginTop: 8, color: "red" }}
        >
          {error}
        </span>
      )}
    </div>
  );
};

export default TextToSpeech;
