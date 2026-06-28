/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Sliders, Maximize2, ShieldAlert, Sparkles, Image, Video, HelpCircle, Eye, Crop, Zap } from "lucide-react";
import { StoryboardScene, Project, ColorAdjustments } from "../types";

interface CinematicPreviewPanelProps {
  scene: StoryboardScene;
  project: Project;
  onUpdateScene: (updated: StoryboardScene) => void;
  onRenderScene: (id: string, type: 'stable-diffusion' | 'ltx-video' | 'wan-video') => void;
}

export default function CinematicPreviewPanel({
  scene,
  project,
  onUpdateScene,
  onRenderScene
}: CinematicPreviewPanelProps) {
  const [activeTab, setActiveTab] = useState<'grade' | 'viewfinder' | 'specs'>('grade');
  const [vuHeights, setVuHeights] = useState<number[]>([20, 40]);

  // Simulate audio level jumping for VU meters when timeline/playback is live
  useEffect(() => {
    const interval = setInterval(() => {
      setVuHeights([
        Math.floor(Math.random() * 80 + 10),
        Math.floor(Math.random() * 80 + 10)
      ]);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const handleLutChange = (lut: StoryboardScene['customLut']) => {
    onUpdateScene({ ...scene, customLut: lut });
  };

  const handleAdjustmentChange = (key: keyof ColorAdjustments, val: number) => {
    onUpdateScene({
      ...scene,
      colorAdjustments: {
        ...scene.colorAdjustments,
        [key]: val
      }
    });
  };

  // Compile CSS filter string based on color adjustments + selected LUT preset
  const getCssFilters = () => {
    const adj = scene.colorAdjustments;
    
    // Base adjustments
    let filterString = `
      brightness(${100 + adj.exposure * 0.8}%)
      contrast(${100 + adj.contrast * 0.8}%)
      saturate(${100 + adj.saturation * 1.2}%)
    `;

    // Apply LUT tints
    switch (scene.customLut) {
      case "teal-orange":
        filterString += " contrast(110%) saturate(115%) hue-rotate(-5deg)";
        break;
      case "technicolor":
        filterString += " saturate(140%) contrast(120%)";
        break;
      case "matrix-green":
        filterString += " sepia(35%) hue-rotate(50deg) saturate(85%) contrast(115%)";
        break;
      case "noir-high":
        filterString += " grayscale(100%) contrast(145%) brightness(95%)";
        break;
      case "cyberpunk":
        filterString += " saturate(155%) hue-rotate(275deg) contrast(110%)";
        break;
      case "sundance-warm":
        filterString += " sepia(25%) saturate(100%) hue-rotate(-10deg) brightness(102%)";
        break;
      default:
        break;
    }

    if (adj.chromaticAberration > 0) {
      // Blur can simulate aberration fringe
      filterString += ` blur(${adj.chromaticAberration * 0.015}px)`;
    }

    return filterString;
  };

  // Convert custom slider values into stylized overlay settings
  const adj = scene.colorAdjustments;
  const vignetteStyle = {
    background: `radial-gradient(circle, transparent ${100 - adj.vignette * 0.8}%, rgba(0,0,0,${adj.vignette * 0.009}) 100%)`
  };

  // Resolution strings helper
  const getAspectString = () => {
    if (project.aspectRatio === "2.39:1 Anamorphic") return "aspect-[2.39/1]";
    if (project.aspectRatio === "9:16 Vertical") return "aspect-[9/16]";
    if (project.aspectRatio === "1:1 Square") return "aspect-[1/1]";
    return "aspect-video"; // 16:9
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 p-4" id="cinematic-preview-panel">
      {/* HUD Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-4">
        <div className="flex items-center gap-1.5">
          <Eye className="h-4.5 w-4.5 text-amber-500" />
          <h2 className="text-sm font-bold tracking-tight text-white uppercase font-mono">Camera Viewfinder</h2>
        </div>

        <div className="flex gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
          <button
            onClick={() => setActiveTab('grade')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'grade' ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-slate-300"
            }`}
          >
            LUT Colour Grader
          </button>
          <button
            onClick={() => setActiveTab('viewfinder')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'viewfinder' ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-slate-300"
            }`}
          >
            Viewfinder HUD
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`px-3 py-1 rounded transition-colors cursor-pointer ${
              activeTab === 'specs' ? "bg-slate-800 text-white font-bold" : "text-slate-400 hover:text-slate-300"
            }`}
          >
            CGI & Lens Specs
          </button>
        </div>
      </div>

      {/* Main Preview Screen Wrapper */}
      <div className="flex-1 flex items-center justify-center bg-slate-900/40 border border-slate-800 rounded-xl overflow-hidden p-2 relative">
        
        {/* VIEWPORT BOX */}
        <div className={`relative w-full max-w-4xl shadow-2xl rounded-lg overflow-hidden border border-slate-850 bg-black ${getAspectString()}`}>
          
          {/* Real-time Film Grain dynamic noise overlay if checked */}
          {adj.filmGrain > 0 && (
            <div 
              className="absolute inset-0 pointer-events-none opacity-[0.06] z-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
              }}
            />
          )}

          {/* Vignette Filter Layer */}
          <div className="absolute inset-0 pointer-events-none z-10" style={vignetteStyle} />

          {/* VIEWPORT CAMERA GUIDES OVERLAY (Viewfinder Hud active) */}
          {activeTab === 'viewfinder' && (
            <div className="absolute inset-0 pointer-events-none z-20 font-mono text-[9px] text-slate-300/80 p-3 select-none flex flex-col justify-between">
              
              {/* Top Viewfinder Metadata */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse border border-white" />
                  <span className="font-bold text-white tracking-widest text-[10px]">REC 24.00 FPS</span>
                </div>
                <div className="text-right">
                  <div className="text-slate-400">SHUTTER 180&deg;</div>
                  <div className="font-bold text-amber-500 mt-0.5">ISO 800</div>
                </div>
              </div>

              {/* Grid Lines (Rule of Thirds) */}
              <div className="absolute inset-0 border-x border-dashed border-white/5 mx-[33.33%]" />
              <div className="absolute inset-0 border-y border-dashed border-white/5 my-[33.33%]" />
              {/* Focus center ring */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-dashed border-white/10 rounded-full flex items-center justify-center">
                <div className="w-2 h-2 border border-white/20 rounded-full" />
              </div>

              {/* Bouncing Audio VU Meters (Left border) */}
              <div className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 h-24 w-1.5 bg-black/40 rounded overflow-hidden p-0.5">
                <div className="flex-1 bg-slate-800 w-full rounded relative flex items-end">
                  <div className="w-full bg-emerald-500 rounded-b transition-all duration-150" style={{ height: `${vuHeights[0]}%` }} />
                </div>
                <div className="flex-1 bg-slate-800 w-full rounded relative flex items-end">
                  <div className="w-full bg-emerald-500 rounded-b transition-all duration-150" style={{ height: `${vuHeights[1]}%` }} />
                </div>
              </div>

              {/* Bottom Viewfinder Metadata */}
              <div className="flex items-end justify-between z-10">
                <div>
                  <div>{project.aspectRatio.toUpperCase()}</div>
                  <div className="text-[10px] text-amber-400 font-bold mt-0.5">{scene.lens.toUpperCase()}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400">REC.2020 HDR</div>
                  <div className="font-bold text-white text-[10px] tracking-widest">TC 00:0{scene.sceneNumber}:15:00</div>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE CONTENT RENDER IMAGE */}
          <div className="w-full h-full relative">
            {scene.renderedImageUrl ? (
              <img
                src={scene.renderedImageUrl}
                alt={scene.title}
                className="w-full h-full object-cover select-none pointer-events-none transition-all duration-300"
                style={{ filter: getCssFilters() }}
                referrerPolicy="no-referrer"
              />
            ) : (
              /* Draft Composition Wireframe */
              <div className="w-full h-full bg-slate-950 flex flex-col items-center justify-center p-6 text-center select-none relative">
                {/* Simulated Wireframe/Blueprint grid overlay */}
                <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />
                
                <Image className="h-10 w-10 text-slate-700 mb-2.5 stroke-[1.5]" />
                <h4 className="text-xs font-semibold text-slate-400">{scene.title}</h4>
                <p className="text-[10px] text-slate-600 max-w-sm mt-1">
                  Drafting prompt ready. Click below to run Stable Diffusion frame rendering nodes.
                </p>
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => onRenderScene(scene.id, 'stable-diffusion')}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] rounded flex items-center gap-1.5 cursor-pointer shadow shadow-amber-500/10 transition-colors"
                  >
                    <Sparkles className="h-3 w-3 fill-white" />
                    Stable Diffusion Frame
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LOWER PANEL CONTROLS based on chosen sub-tab */}
      <div className="mt-4 bg-slate-900 rounded-xl border border-slate-800 p-4">
        {activeTab === 'grade' && (
          <div className="flex flex-col gap-4" id="color-grading-controls">
            
            {/* LUT Choice Buttons */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
                <Crop className="h-3.5 w-3.5 text-amber-500" />
                <span>Cinematic 3D-LUT Colour Grading Matrix</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                {[
                  { id: 'none', label: 'Bypass Grade', color: 'bg-slate-800' },
                  { id: 'teal-orange', label: 'Teal & Orange', color: 'bg-orange-950 text-orange-300 border-orange-800' },
                  { id: 'technicolor', label: 'Technicolor', color: 'bg-red-950 text-red-300 border-red-800' },
                  { id: 'matrix-green', label: 'Matrix Green', color: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
                  { id: 'noir-high', label: 'Noir Contrast', color: 'bg-slate-900 text-slate-100 border-slate-700' },
                  { id: 'cyberpunk', label: 'Cyberpunk', color: 'bg-purple-950 text-purple-300 border-purple-800' },
                  { id: 'sundance-warm', label: 'Sundance Warm', color: 'bg-amber-950 text-amber-300 border-amber-800' },
                ].map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handleLutChange(preset.id as any)}
                    className={`px-2.5 py-1.5 rounded text-[10px] font-semibold border font-mono text-center cursor-pointer transition-all ${
                      scene.customLut === preset.id 
                        ? `${preset.color} scale-[1.03] ring-1 ring-amber-500/50` 
                        : "bg-slate-950 border-slate-850 text-slate-400 hover:text-slate-300"
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Adjustments Sliders */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3.5">
              {[
                { key: 'exposure', label: 'Exposure Offset', min: -50, max: 50, value: adj.exposure },
                { key: 'contrast', label: 'Contrast Range', min: -50, max: 50, value: adj.contrast },
                { key: 'saturation', label: 'Saturation Scale', min: -50, max: 50, value: adj.saturation },
                { key: 'vignette', label: 'Lens Vignette', min: 0, max: 100, value: adj.vignette },
                { key: 'filmGrain', label: 'Atmospheric Grain', min: 0, max: 100, value: adj.filmGrain },
                { key: 'chromaticAberration', label: 'Lens Aberration', min: 0, max: 100, value: adj.chromaticAberration },
              ].map((slider) => (
                <div key={slider.key} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
                    <span>{slider.label}</span>
                    <span className="text-white font-bold">{slider.value > 0 ? `+${slider.value}` : slider.value}</span>
                  </div>
                  <input
                    type="range"
                    min={slider.min}
                    max={slider.max}
                    value={slider.value}
                    onChange={(e) => handleAdjustmentChange(slider.key as any, parseInt(e.target.value))}
                    className="w-full accent-amber-500 cursor-pointer h-1.5 rounded-full bg-slate-950"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'viewfinder' && (
          <div className="flex flex-col gap-3 font-mono text-xs text-slate-400" id="camera-settings-specifications">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
              <Zap className="h-3.5 w-3.5 text-amber-500" />
              <span>Camera Setup & Frame Directions</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-850">
                <span className="text-[10px] text-slate-500 uppercase">Focal Lens</span>
                <p className="text-white font-bold mt-1">{scene.lens}</p>
                <p className="text-[10px] text-slate-500 mt-1">Simulates anamorphic bokeh distortion.</p>
              </div>

              <div className="bg-slate-950 p-2.5 rounded border border-slate-850">
                <span className="text-[10px] text-slate-500 uppercase">Composition Angle</span>
                <p className="text-white font-bold mt-1">{scene.shotType}</p>
                <p className="text-[10px] text-slate-500 mt-1">Calculates rule of thirds positioning.</p>
              </div>

              <div className="bg-slate-950 p-2.5 rounded border border-slate-850">
                <span className="text-[10px] text-slate-500 uppercase">Camera Action</span>
                <p className="text-white font-bold mt-1">{scene.movement}</p>
                <p className="text-[10px] text-slate-500 mt-1">Configures movement flow vectors.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="flex flex-col gap-3" id="vfx-sound-specifications">
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
              <Maximize2 className="h-3.5 w-3.5 text-amber-500" />
              <span>CGI Overlays & SFX Pacing Metadata</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-950 p-3 rounded border border-slate-850 flex flex-col gap-1.5">
                <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase">VFX & 3D Layer Compositing</span>
                <p className="text-slate-300 text-xs leading-relaxed font-serif">{scene.vfxNotes}</p>
              </div>

              <div className="bg-slate-950 p-3 rounded border border-slate-850 flex flex-col gap-1.5">
                <span className="text-[10px] font-mono font-bold text-rose-400 uppercase">Ambient Sound Designer Cues</span>
                <p className="text-slate-300 text-xs leading-relaxed font-serif">{scene.soundEffects}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
