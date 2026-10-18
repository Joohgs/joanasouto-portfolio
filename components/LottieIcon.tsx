"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { DotLottieReact, type DotLottie } from "@lottiefiles/dotlottie-react";

export interface LottieIconProps {
  src: string;
  size?: number;
  className?: string;
  isActive?: boolean;
  isHovered?: boolean;
}

export function LottieIcon({
  src,
  size = 54,
  className = "",
  isActive = false,
  isHovered,
}: LottieIconProps) {
  const [internalHover, setInternalHover] = useState(false);
  const playerRef = useRef<DotLottie | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const effectiveHover = isHovered !== undefined ? isHovered : internalHover;

  const syncFrame = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;

    if (isActive) {
      player.pause();
      const lastFrame = Math.max(0, Math.floor(player.totalFrames) - 1);
      player.setFrame(lastFrame);
    } else {
      player.pause();
      player.setFrame(0);
    }
  }, [isActive]);

  // Handle dotLottie ref initialization and events
  const onDotLottieRef = useCallback((player: DotLottie | null) => {
    playerRef.current = player;
    if (!player) {
      setIsLoaded(false);
      return;
    }

    const handleReady = () => {
      setIsLoaded(true);
    };

    if (player.isLoaded) {
      setIsLoaded(true);
    } else {
      player.addEventListener("load", handleReady);
      player.addEventListener("ready", handleReady);
    }
  }, []);

  // When animation finishes loading or isActive changes
  useEffect(() => {
    if (!isLoaded) return;
    syncFrame();
  }, [isLoaded, isActive, syncFrame]);

  // Handle hover playback on inactive icon
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !isLoaded) return;

    // Active section must NOT animate on hover and must stay on last frame
    if (isActive) {
      player.pause();
      const lastFrame = Math.max(0, Math.floor(player.totalFrames) - 1);
      player.setFrame(lastFrame);
      return;
    }

    if (effectiveHover) {
      player.setFrame(0);
      player.play();
    } else {
      player.pause();
      player.setFrame(0);
    }
  }, [effectiveHover, isActive, isLoaded]);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none overflow-hidden [&_canvas]:[image-rendering:pixelated] ${className}`}
      style={{ width: size, height: size }}
      onMouseEnter={() => setInternalHover(true)}
      onMouseLeave={() => setInternalHover(false)}
    >
      <DotLottieReact
        src={src}
        autoplay={false}
        loop={false}
        useFrameInterpolation={false}
        dotLottieRefCallback={onDotLottieRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}

// Aliases for compatibility
export const PixelLottieIcon = LottieIcon;
export const LottieNavIcon = LottieIcon;
