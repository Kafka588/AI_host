"use client";

import { useEffect, useRef } from "react";

type Props = {
  analyser?: AnalyserNode;
};

export function AudioVisualizer({ analyser }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const barCount = 48;
    const gap = 2;

    const draw = () => {
      animationRef.current = requestAnimationFrame(draw);

      const width = canvas.width;
      const height = canvas.height;
      ctx.fillStyle = "#1E1E1E";
      ctx.fillRect(0, 0, width, height);

      if (!analyser) {
        // Ambient aesthetic when no audio is connected
        const t = performance.now() * 0.002;
        const barWidth = width / barCount;
        for (let i = 0; i < barCount; i++) {
          const wave = Math.sin(t + i * 0.25) * 0.5 + 0.5;
          const barHeight = wave * height * 0.6 + height * 0.1;
          const x = i * barWidth;
          const y = height - barHeight;
          const gradient = ctx.createLinearGradient(0, height, 0, 0);
          gradient.addColorStop(0, "#FFD700");
          gradient.addColorStop(0.5, "#ddb900");
          gradient.addColorStop(1, "#c49216");
          ctx.fillStyle = gradient;
          ctx.fillRect(x + gap / 2, y, barWidth - gap, barHeight);
        }
        return;
      }

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyser.getByteFrequencyData(dataArray);

      const binsPerBar = Math.max(1, Math.floor(bufferLength / barCount));
      const barWidth = width / barCount;

      for (let i = 0; i < barCount; i++) {
        let sum = 0;
        for (let j = 0; j < binsPerBar; j++) {
          sum += dataArray[i * binsPerBar + j] || 0;
        }
        const avg = sum / binsPerBar;
        const normalized = avg / 255;
        const barHeight = normalized * height * 0.85 + height * 0.05;
        const x = i * barWidth;
        const y = height - barHeight;
        const gradient = ctx.createLinearGradient(0, height, 0, 0);
        gradient.addColorStop(0, "#FFD700");
        gradient.addColorStop(0.5, "#ddb900");
        gradient.addColorStop(1, "#c49216");
        ctx.fillStyle = gradient;
        ctx.fillRect(x + gap / 2, y, barWidth - gap, barHeight);
      }
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [analyser]);

  return (
    <div className="w-full bg-[#1E1E1E] rounded-lg overflow-hidden border border-[#454545]">
      <canvas ref={canvasRef} width={1200} height={100} className="w-full h-24" />
    </div>
  );
}
