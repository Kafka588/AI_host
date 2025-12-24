"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  sources: string[];
  crossfadeMs?: number;
  stayMs?: number;
  className?: string;
  pollQueueMs?: number;
  muted?: boolean;
  onActiveChange?: (el: HTMLVideoElement) => void;
};

export function VideoLooper({ sources, crossfadeMs = 600, stayMs, className, pollQueueMs = 1000, muted = false, onActiveChange }: Props) {
  const v1Ref = useRef<HTMLVideoElement | null>(null);
  const v2Ref = useRef<HTMLVideoElement | null>(null);
  const [active, setActive] = useState<1 | 2>(1);
  const [index, setIndex] = useState(0);
  const playbackQueueRef = useRef<{ path: string; muted?: boolean }[]>([]);
  const activeRef = useRef<1 | 2>(1);
  const mutedRef = useRef<boolean>(muted);
  const onActiveChangeRef = useRef<typeof onActiveChange>(onActiveChange);

  // Keep refs in sync without changing effect dependencies
  useEffect(() => {
    mutedRef.current = muted;
    onActiveChangeRef.current = onActiveChange;
  });

  // Load a source into a video element; optionally defer playback for preloading
  const loadInto = async (
    el: HTMLVideoElement,
    src: string,
    shouldMute: boolean = true,
    autoPlay: boolean = true
  ) => {
    return new Promise<void>((resolve) => {
      el.src = src;
      el.muted = shouldMute;
      el.playsInline = true;
      el.loop = false;
      el.onloadeddata = () => {
        el.currentTime = 0;
        if (autoPlay) {
          el.play().catch(async () => {
            // If autoplay with audio is blocked, fallback to muted
            try {
              el.muted = true;
              await el.play();
            } catch {}
          });
        } else {
          el.pause();
        }
        resolve();
      };
      el.load();
    });
  };

  const crossfade = (from: HTMLVideoElement, to: HTMLVideoElement) => {
    let start: number | null = null;
    const duration = crossfadeMs;

    const step = (t: number) => {
      if (start === null) start = t;
      const progress = Math.min((t - start) / duration, 1);
      from.style.opacity = String(1 - progress);
      to.style.opacity = String(progress);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  };

  useEffect(() => {
    const v1 = v1Ref.current!;
    const v2 = v2Ref.current!;
    v1.style.opacity = "1";
    v2.style.opacity = "0";

    let cancelled = false;

    const pollInterval = setInterval(() => {
      fetch("/api/queue-video?action=get-queue")
        .then((res) => res.json())
        .then((data) => {
          if (data.queue && data.queue.length > 0) {
            playbackQueueRef.current = data.queue;
            fetch("/api/queue-video", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "clear" }),
            }).catch(() => {});
          }
        })
        .catch(() => {});
    }, pollQueueMs);

    const playCycle = async () => {
      let i = index;
      const currentSources = sources;

      await loadInto(
        activeRef.current === 1 ? v1 : v2,
        currentSources[i % currentSources.length],
        mutedRef.current,
        true
      );

      // Notify initial active element
      if (onActiveChangeRef.current) {
        onActiveChangeRef.current(activeRef.current === 1 ? v1 : v2);
      }

      while (!cancelled) {
        const currentEl = activeRef.current === 1 ? v1 : v2;
        const nextEl = activeRef.current === 1 ? v2 : v1;

        let nextSrc: string;
        let shouldMute: boolean;
        let nextIndex: number;

        if (playbackQueueRef.current && playbackQueueRef.current.length > 0) {
          const queuedItem = playbackQueueRef.current.shift()!;
          nextSrc = queuedItem.path;
          // Respect explicit mute flag from queue, otherwise fall back to component prop
          shouldMute = queuedItem.muted ?? mutedRef.current;
          nextIndex = -1;
        } else {
          nextIndex = (i + 1) % currentSources.length;
          nextSrc = currentSources[nextIndex];
          // Default to component-level mute preference for carousel clips
          shouldMute = mutedRef.current;
        }

        // Preload next clip but start playing only when we switch to it
        await loadInto(nextEl, nextSrc, shouldMute, false);

        const clipMs =
          stayMs ??
          ((currentEl.duration && isFinite(currentEl.duration))
            ? currentEl.duration * 1000
            : 5000);

        // Allow immediate interruption if a queued item arrives
        const waitForFinishOrQueue = async (ms: number) => {
          const start = performance.now();
          while (performance.now() - start < ms) {
            if (playbackQueueRef.current && playbackQueueRef.current.length > 0) {
              break;
            }
            await new Promise<void>((r) => setTimeout(r, 150));
          }
        };

        await waitForFinishOrQueue(clipMs);

        // If a new queue item arrived during this clip, override the preloaded next
        if (playbackQueueRef.current && playbackQueueRef.current.length > 0) {
          const queuedItem = playbackQueueRef.current.shift()!;
          nextSrc = queuedItem.path;
          shouldMute = queuedItem.muted ?? true;
          nextIndex = -1;
          await loadInto(nextEl, nextSrc, shouldMute, false);
        }

        // Start playback of next clip right before crossfade so we don't skip ahead
        const tryPlay = async () => {
          try {
            await nextEl.play();
          } catch (err) {
            // If autoplay with audio is blocked, always fallback to muted
            // to ensure frames advance. UI may later unmute via user gesture.
            try {
              nextEl.muted = true;
              await nextEl.play();
            } catch (e) {
              console.warn("Video play blocked", e);
            }
          }
        };

        await tryPlay();
        crossfade(currentEl, nextEl);
        activeRef.current = activeRef.current === 1 ? 2 : 1;
        setActive(activeRef.current);

        // Notify active element change for audio visualization coupling
        if (onActiveChangeRef.current) {
          onActiveChangeRef.current(activeRef.current === 1 ? v1 : v2);
        }
        i = nextIndex === -1 ? i : nextIndex;
      }
    };

    playCycle();

    return () => {
      cancelled = true;
      v1.pause();
      v2.pause();
      clearInterval(pollInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sources, crossfadeMs, stayMs, pollQueueMs]);

  return (
    <div className={className}>
      <video
        ref={v1Ref}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-0"
        controls={false}
        playsInline
      />
      <video
        ref={v2Ref}
        className="absolute inset-0 h-full w-full object-cover transition-opacity duration-0"
        controls={false}
        playsInline
      />
    </div>
  );
}
