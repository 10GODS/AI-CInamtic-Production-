/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Film, Users, Wifi, Layers, Video, ShieldCheck, HelpCircle } from "lucide-react";
import { Project, CoEditor } from "../types";

interface WorkspaceHeaderProps {
  project: Project;
  coEditors: CoEditor[];
  onUpdateProject: (proj: Project) => void;
  isGeminiConnected: boolean;
}

export default function WorkspaceHeader({
  project,
  coEditors,
  onUpdateProject,
  isGeminiConnected
}: WorkspaceHeaderProps) {
  
  const handleResolutionChange = (res: '720p' | '1080p' | 'Cinema-4K') => {
    onUpdateProject({ ...project, renderResolution: res });
  };

  const handleAspectChange = (aspect: '16:9' | '2.39:1 Anamorphic' | '9:16 Vertical' | '1:1 Square') => {
    onUpdateProject({ ...project, aspectRatio: aspect });
  };

  const handleHdrToggle = () => {
    onUpdateProject({ ...project, hdrEnabled: !project.hdrEnabled });
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4" id="workspace-header">
      {/* Brand & Active Project Info */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-tr from-amber-500 to-rose-600 p-2.5 rounded-lg text-white shadow-lg shadow-amber-500/10">
          <Film className="h-6 w-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-white">{project.title}</h1>
            <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-700">
              {project.genre}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 max-w-md truncate" title={project.logline}>
            {project.logline || "Collaborative cinematic rendering pipeline"}
          </p>
        </div>
      </div>

      {/* Production Format Controls & Cloud Collaboration Status */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Render Formats */}
        <div className="flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-lg border border-slate-800 text-xs font-mono">
          {/* Resolution Selector */}
          <div className="flex flex-col px-2">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Format</span>
            <select
              value={project.renderResolution}
              onChange={(e) => handleResolutionChange(e.target.value as any)}
              className="bg-transparent text-slate-300 font-medium border-none outline-none focus:ring-0 cursor-pointer pr-1 py-0"
            >
              <option value="720p" className="bg-slate-900 text-slate-300">HD (720p)</option>
              <option value="1080p" className="bg-slate-900 text-slate-300">FHD (1080p)</option>
              <option value="Cinema-4K" className="bg-slate-900 text-slate-300">Cinema 4K (DCI)</option>
            </select>
          </div>

          <div className="w-px h-6 bg-slate-800 self-center" />

          {/* Aspect Ratio Selector */}
          <div className="flex flex-col px-2">
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">Aspect Ratio</span>
            <select
              value={project.aspectRatio}
              onChange={(e) => handleAspectChange(e.target.value as any)}
              className="bg-transparent text-slate-300 font-medium border-none outline-none focus:ring-0 cursor-pointer pr-1 py-0"
            >
              <option value="16:9" className="bg-slate-900 text-slate-300">16:9 HDTV</option>
              <option value="2.39:1 Anamorphic" className="bg-slate-900 text-slate-300">2.39:1 Scope</option>
              <option value="9:16 Vertical" className="bg-slate-900 text-slate-300">9:16 Reel</option>
              <option value="1:1 Square" className="bg-slate-900 text-slate-300">1:1 Square</option>
            </select>
          </div>

          <div className="w-px h-6 bg-slate-800 self-center" />

          {/* HDR Switch */}
          <button
            onClick={handleHdrToggle}
            className={`flex flex-col px-2 text-left justify-center cursor-pointer transition-colors ${
              project.hdrEnabled ? "text-amber-400" : "text-slate-500 hover:text-slate-400"
            }`}
          >
            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-semibold">HDR Output</span>
            <span className="font-medium">{project.hdrEnabled ? "Rec.2020 10-bit" : "SDR 8-bit"}</span>
          </button>
        </div>

        {/* Gemini Status indicator */}
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-mono ${
          isGeminiConnected 
            ? "bg-indigo-950/40 border-indigo-900/60 text-indigo-300"
            : "bg-slate-900/80 border-slate-800 text-slate-400"
        }`}>
          <Layers className="h-3.5 w-3.5 animate-pulse text-indigo-400" />
          <span>Gemini AI: {isGeminiConnected ? "Connected" : "Fallback-Active"}</span>
        </div>

        {/* Team Avatars */}
        <div className="flex items-center gap-2 border-l border-slate-800 pl-4">
          <div className="flex -space-x-2">
            {coEditors.map((editor) => (
              <div
                key={editor.id}
                className="relative group cursor-pointer"
                title={`${editor.name} (${editor.role})`}
              >
                <img
                  src={editor.avatar}
                  alt={editor.name}
                  className="w-8 h-8 rounded-full border-2 border-slate-950 object-cover hover:scale-105 transition-transform"
                  style={{ borderColor: editor.color }}
                  referrerPolicy="no-referrer"
                />
                <span 
                  className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-slate-950"
                  style={{ backgroundColor: editor.color }}
                />
              </div>
            ))}
            <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center text-xs text-slate-400 hover:text-white hover:border-slate-500 cursor-pointer transition-colors">
              +
            </div>
          </div>
          <div className="hidden lg:flex flex-col text-right">
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-mono">
              <Wifi className="h-3 w-3 animate-pulse" />
              <span>Pipeline Synced</span>
            </div>
            <span className="text-[10px] text-slate-500">4 co-editors online</span>
          </div>
        </div>
      </div>
    </header>
  );
}
