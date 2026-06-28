/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, FastForward, Volume2, Clock, CheckCircle2, Loader2, Sparkles, AlertTriangle } from "lucide-react";
import { StoryboardScene } from "../types";

interface TimelinePacingEditorProps {
  scenes: StoryboardScene[];
  selectedSceneId: string;
  onSelectScene: (id: string) => void;
  onRenderScene: (id: string, type: 'stable-diffusion' | 'ltx-video' | 'wan-video') => void;
}

export default function TimelinePacingEditor({
  scenes,
  selectedSceneId,
  onSelectScene,
  onRenderScene
}: TimelinePacingEditorProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playheadPercent, setPlayheadPercent] = useState(15); // Starts at Scene 1 range
  const [activeSegmentIndex, setActiveSegmentIndex] = useState(0);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Total short film context length calculated (e.g., sum of scene durations)
  const totalDurationSeconds = scenes.reduce((sum, s) => sum + s.duration, 0);

  // Auto ticking playhead if playing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlayheadPercent((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.5;
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Synchronize active scene selection with playhead percent
  useEffect(() => {
    if (!isPlaying) return;
    const currentSecond = (playheadPercent / 100) * totalDurationSeconds;
    
    let accumulatedSeconds = 0;
    for (let i = 0; i < scenes.length; i++) {
      accumulatedSeconds += scenes[i].duration;
      if (currentSecond <= accumulatedSeconds) {
        if (scenes[i].id !== selectedSceneId) {
          onSelectScene(scenes[i].id);
        }
        break;
      }
    }
  }, [playheadPercent, isPlaying, scenes, selectedSceneId, onSelectScene, totalDurationSeconds]);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickPercent = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    setPlayheadPercent(clickPercent);

    // Find clicked scene
    const clickedSecond = (clickPercent / 100) * totalDurationSeconds;
    let accumulated = 0;
    for (const scene of scenes) {
      accumulated += scene.duration;
      if (clickedSecond <= accumulated) {
        onSelectScene(scene.id);
        break;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Generate mock waveform visual bars
  const generateWaveform = (seed: string, count: number) => {
    const heights: number[] = [];
    let num = seed.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    for (let i = 0; i < count; i++) {
      num = (num * 9301 + 49297) % 233280;
      heights.push(10 + (num % 35));
    }
    return heights;
  };

  return (
    <div className="bg-slate-950 border-t border-slate-800 p-4 flex flex-col gap-3" id="timeline-pacing-editor">
      {/* Timeline Controls & Timecode */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`p-2.5 rounded-full flex items-center justify-center transition-all ${
              isPlaying ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-100"
            }`}
            title={isPlaying ? "Pause Timeline" : "Play Timeline"}
          >
            {isPlaying ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white ml-0.5" />}
          </button>
          
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest font-semibold">Master Timecode</span>
            <div className="flex items-baseline gap-1 font-mono text-base font-bold text-white">
              <span>{formatTime((playheadPercent / 100) * totalDurationSeconds)}</span>
              <span className="text-xs text-slate-500">/ {formatTime(totalDurationSeconds)}</span>
            </div>
          </div>
        </div>

        {/* Audio Sync & Pacing Info */}
        <div className="hidden sm:flex items-center gap-4 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Volume2 className="h-3.5 w-3.5 text-rose-500" />
            <span className="font-mono text-slate-300">VO Sync: Active</span>
          </div>
          <div className="w-px h-4 bg-slate-850" />
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-slate-300">Emotional Pacing: Automated (Wan AI Flow)</span>
          </div>
        </div>
      </div>

      {/* Main Track Grid */}
      <div className="relative border border-slate-800 rounded-lg bg-slate-900 overflow-hidden flex flex-col">
        
        {/* Playhead Guide */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-rose-500 z-30 pointer-events-none transition-all duration-100"
          style={{ left: `${playheadPercent}%` }}
        >
          <div className="absolute -top-1 -left-1.5 w-3.5 h-3.5 bg-rose-500 rounded-full border border-white shadow-md shadow-rose-600/30" />
        </div>

        {/* 1. SCENE SEGMENTATION TRACK */}
        <div 
          ref={timelineRef}
          onClick={handleTimelineClick}
          className="relative h-20 bg-slate-950/40 border-b border-slate-800 cursor-ew-resize flex select-none z-10"
        >
          {scenes.map((scene, index) => {
            const widthPct = (scene.duration / totalDurationSeconds) * 100;
            const isSelected = scene.id === selectedSceneId;
            
            return (
              <div
                key={scene.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectScene(scene.id);
                }}
                className={`relative h-full border-r border-slate-800 flex flex-col justify-between p-2 transition-all group ${
                  isSelected 
                    ? "bg-slate-800/60 shadow-inner border-y-2 border-y-amber-500/80" 
                    : "hover:bg-slate-900/40"
                }`}
                style={{ width: `${widthPct}%`, minWidth: '120px' }}
              >
                {/* Shot Number & Title */}
                <div className="flex items-start justify-between gap-1 overflow-hidden">
                  <div className="flex flex-col truncate">
                    <span className="text-[9px] font-mono font-bold text-slate-500 group-hover:text-amber-500/80 transition-colors">
                      SHOT {index + 1}
                    </span>
                    <span className="text-xs font-semibold text-slate-200 truncate pr-1">
                      {scene.title}
                    </span>
                  </div>

                  {/* Render Status Icon */}
                  <div>
                    {scene.renderStatus === "completed" && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    )}
                    {scene.renderStatus === "rendering" && (
                      <Loader2 className="h-3.5 w-3.5 text-amber-500 animate-spin shrink-0" />
                    )}
                    {scene.renderStatus === "idle" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-600 inline-block shrink-0" />
                    )}
                  </div>
                </div>

                {/* Thumbnail bar or Rendering progress */}
                <div className="w-full">
                  {scene.renderStatus === "rendering" ? (
                    <div className="w-full flex flex-col gap-1">
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-500 h-full rounded-full transition-all duration-300"
                          style={{ width: `${scene.renderProgress}%` }}
                        />
                      </div>
                      <span className="text-[8px] font-mono text-amber-400 text-right">
                        Wan-Video Rnd: {scene.renderProgress}%
                      </span>
                    </div>
                  ) : scene.renderedImageUrl ? (
                    <div className="flex items-center gap-1.5">
                      <img 
                        src={scene.renderedImageUrl} 
                        alt="Shot Frame" 
                        className="w-8 h-5 object-cover rounded border border-slate-700 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-[9px] font-mono text-slate-400 truncate">
                        {scene.shotType} ({scene.lens.split(" ")[0]})
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="text-[8px] font-mono text-slate-500 italic">No assets rendered</span>
                    </div>
                  )}
                </div>

                {/* Duration indicator tag */}
                <span className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-500">
                  {formatTime(scene.duration)}
                </span>
              </div>
            );
          })}
        </div>

        {/* 2. AUTOMATED VOICEOVER & DIALOGUE PACE TRACK */}
        <div className="h-16 bg-slate-900 flex items-center justify-between select-none relative z-10 px-2">
          {scenes.map((scene) => {
            const widthPct = (scene.duration / totalDurationSeconds) * 100;
            const isSelected = scene.id === selectedSceneId;
            const waves = generateWaveform(scene.id + scene.dialogue.text, 24);
            const dialog = scene.dialogue;

            // Compute offset for Dialogue segment in this scene block
            const relativeStartPct = (dialog.startSecond / scene.duration) * 100;
            const relativeDurationPct = (dialog.durationSeconds / scene.duration) * 100;

            const emotionColours: Record<string, string> = {
              intense: "from-rose-500/80 to-red-600/80 text-rose-300 border-rose-800",
              whisper: "from-blue-500/60 to-cyan-600/60 text-blue-200 border-blue-900",
              melodramatic: "from-purple-500/70 to-fuchsia-600/70 text-purple-200 border-purple-900",
              heroic: "from-amber-500/80 to-yellow-600/80 text-amber-200 border-amber-800",
              fearful: "from-orange-500/75 to-red-500/75 text-orange-200 border-orange-900",
              neutral: "from-slate-500/60 to-slate-600/60 text-slate-200 border-slate-800"
            };

            return (
              <div 
                key={`wave-${scene.id}`} 
                className={`relative h-full flex flex-col justify-center border-r border-slate-800/40`}
                style={{ width: `${widthPct}%` }}
              >
                {/* Visual Audio Waveform background */}
                <div className="absolute inset-x-0 bottom-1 h-8 flex items-end justify-center gap-0.5 opacity-20 px-4">
                  {waves.map((h, i) => (
                    <div 
                      key={i} 
                      className={`w-1 rounded-full ${isSelected ? 'bg-amber-500' : 'bg-slate-500'}`} 
                      style={{ height: `${h}%` }} 
                    />
                  ))}
                </div>

                {/* Absolute Dialogue Blocks */}
                <div 
                  className={`absolute top-2.5 h-10 rounded border px-2 py-0.5 flex flex-col justify-between text-[10px] bg-gradient-to-r shadow-md overflow-hidden ${
                    emotionColours[dialog.emotion] || emotionColours.neutral
                  }`}
                  style={{ 
                    left: `${relativeStartPct}%`, 
                    width: `calc(${relativeDurationPct}% - 4px)`,
                    minWidth: '80px'
                  }}
                >
                  <div className="flex items-center justify-between font-bold text-[8px] tracking-wide uppercase truncate">
                    <span>{dialog.speaker}</span>
                    <span className="px-1 py-0.2 rounded-full bg-black/30 border border-white/10 scale-90">
                      {dialog.emotion}
                    </span>
                  </div>
                  <p className="truncate font-serif italic text-[9px] text-white/90">
                    &ldquo;{dialog.text}&rdquo;
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
