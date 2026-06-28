/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Cpu, Settings, Play, Database, FileText, CheckSquare, RefreshCw, AlertTriangle, HelpCircle } from "lucide-react";
import { StoryboardScene, Project } from "../types";

interface RenderPipelineSettingsProps {
  scene: StoryboardScene;
  project: Project;
  onUpdateProject: (updated: Project) => void;
  onRenderScene: (id: string, type: 'stable-diffusion' | 'ltx-video' | 'wan-video') => void;
  activeRenders: { sceneId: string, type: string, progress: number }[];
}

export default function RenderPipelineSettings({
  scene,
  project,
  onUpdateProject,
  onRenderScene,
  activeRenders
}: RenderPipelineSettingsProps) {
  
  const handleStepsChange = (val: number) => {
    onUpdateProject({ ...project, diffusionSteps: val });
  };

  const handleCfgChange = (val: number) => {
    onUpdateProject({ ...project, cfgGuidance: val });
  };

  const handleMotionChange = (val: number) => {
    onUpdateProject({ ...project, motionWeight: val });
  };

  // Check if current scene is rendering any asset
  const isSceneRendering = activeRenders.some(r => r.sceneId === scene.id);
  const currentRender = activeRenders.find(r => r.sceneId === scene.id);

  return (
    <div className="bg-slate-900 border-l border-slate-800 p-4 flex flex-col h-full overflow-y-auto" id="render-pipeline-settings">
      {/* Panel title */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 mb-4">
        <Cpu className="h-4.5 w-4.5 text-amber-500 animate-pulse" />
        <h3 className="text-sm font-bold tracking-tight text-white uppercase font-mono">Render Engine Pipeline</h3>
      </div>

      {/* Model Selection Row */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wide">Model Node Bindings</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'stable-diffusion', label: 'Stable Diffusion XL', badge: 'Image' },
              { id: 'ltx-video', label: 'LTX Video', badge: '7s Video' },
              { id: 'wan-video', label: 'Wan Video 14B', badge: 'Pro Video' },
            ].map((model) => (
              <button
                key={model.id}
                onClick={() => onRenderScene(scene.id, model.id as any)}
                disabled={isSceneRendering}
                className="bg-slate-950 border border-slate-850 hover:border-slate-700 disabled:opacity-50 text-left p-2.5 rounded-lg text-slate-300 hover:text-white transition-all cursor-pointer flex flex-col justify-between h-20 group relative"
              >
                <span className="text-[10px] font-bold font-sans tracking-tight leading-tight group-hover:text-amber-500/80 transition-colors">
                  {model.label}
                </span>
                <span className="text-[8px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded self-start mt-1 uppercase border border-slate-800/60">
                  {model.badge}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Customizable render settings */}
        <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-850 flex flex-col gap-3.5 mt-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 uppercase tracking-widest font-semibold">
            <Settings className="h-3.5 w-3.5 text-slate-500" />
            <span>Customizable Cinematography Nodes</span>
          </div>

          {/* Diffusion steps */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-400">Diffusion Steps</span>
              <span className="text-white font-bold">{project.diffusionSteps}</span>
            </div>
            <input
              type="range"
              min={20}
              max={150}
              step={5}
              value={project.diffusionSteps}
              onChange={(e) => handleStepsChange(parseInt(e.target.value))}
              disabled={isSceneRendering}
              className="w-full accent-amber-500 cursor-pointer h-1 rounded-full bg-slate-900 disabled:opacity-40"
            />
            <span className="text-[8px] text-slate-500">More steps enhance frame clarity but increase GPU load.</span>
          </div>

          {/* CFG Guidance */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-400">CFG Guidance Scale</span>
              <span className="text-white font-bold">{project.cfgGuidance}</span>
            </div>
            <input
              type="range"
              min={1}
              max={20}
              step={0.5}
              value={project.cfgGuidance}
              onChange={(e) => handleCfgChange(parseFloat(e.target.value))}
              disabled={isSceneRendering}
              className="w-full accent-amber-500 cursor-pointer h-1 rounded-full bg-slate-900 disabled:opacity-40"
            />
            <span className="text-[8px] text-slate-500">Adherence weight to your stable diffusion image prompt.</span>
          </div>

          {/* Motion weight */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-slate-400">Motion Strength (LTX/Wan)</span>
              <span className="text-white font-bold">{project.motionWeight}x</span>
            </div>
            <input
              type="range"
              min={0.1}
              max={2.0}
              step={0.1}
              value={project.motionWeight}
              onChange={(e) => handleMotionChange(parseFloat(e.target.value))}
              disabled={isSceneRendering}
              className="w-full accent-amber-500 cursor-pointer h-1 rounded-full bg-slate-900 disabled:opacity-40"
            />
            <span className="text-[8px] text-slate-500">Paces frame interpolation speed for action-adventure cameras.</span>
          </div>
        </div>

        {/* GPU ACTIVE LOGGER TERMINAL MONITOR */}
        <div className="flex flex-col gap-1.5 mt-2">
          <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 uppercase tracking-wide">
            <span>GPU Cluster Console Feed</span>
            {isSceneRendering && (
              <span className="text-amber-500 font-bold animate-pulse">
                NODE_RUNNING: {currentRender?.progress}%
              </span>
            )}
          </div>
          <div className="bg-slate-950 border border-slate-850 p-3 rounded-lg h-48 overflow-y-auto font-mono text-[10px] leading-relaxed flex flex-col gap-1.5 select-all">
            <div className="flex items-center justify-between border-b border-slate-900 pb-1 text-slate-500 uppercase tracking-widest text-[8px] font-bold">
              <span>Node cluster #415</span>
              <span>VRAM 24GB active</span>
            </div>
            {scene.renderLogs && scene.renderLogs.length > 0 ? (
              scene.renderLogs.map((log, index) => {
                let colorClass = "text-slate-400";
                if (log.startsWith("[SDXL]") || log.startsWith("[LTX]") || log.startsWith("[VIDEO]")) {
                  colorClass = "text-sky-400";
                } else if (log.startsWith("[SUCCESS]")) {
                  colorClass = "text-emerald-400 font-bold";
                } else if (log.startsWith("[LUT]")) {
                  colorClass = "text-amber-400";
                } else if (log.startsWith("[GPU]") || log.startsWith("[DIFFUSION]")) {
                  colorClass = "text-teal-400";
                }
                return (
                  <p key={index} className={`${colorClass} truncate`}>
                    {log}
                  </p>
                );
              })
            ) : (
              <p className="text-slate-600 italic">No render tasks running. Console standby.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
