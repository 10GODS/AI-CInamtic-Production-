/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Sparkles, Users, HelpCircle, Film, Plus, Trash2, Edit2, Check, RefreshCw } from "lucide-react";
import { Project, Character, StoryboardScene } from "../types";

interface ScriptGeneratorPanelProps {
  project: Project;
  onUpdateProject: (proj: Project) => void;
  onGenerateScript: (notes: string) => Promise<void>;
  isGenerating: boolean;
  selectedSceneId: string;
  onSelectScene: (id: string) => void;
}

export default function ScriptGeneratorPanel({
  project,
  onUpdateProject,
  onGenerateScript,
  isGenerating,
  selectedSceneId,
  onSelectScene
}: ScriptGeneratorPanelProps) {
  const [activeTab, setActiveTab] = useState<'script' | 'characters'>('script');
  const [promptNotes, setPromptNotes] = useState(project.scriptNotes);
  const [editingCharId, setEditingCharId] = useState<string | null>(null);
  
  // Buffers for editing character fields
  const [charName, setCharName] = useState("");
  const [charDescription, setCharDescription] = useState("");
  const [charFace, setCharFace] = useState("");
  const [charOutfit, setCharOutfit] = useState("");

  const handleGenerate = () => {
    onGenerateScript(promptNotes);
  };

  const startEditCharacter = (char: Character) => {
    setEditingCharId(char.id);
    setCharName(char.name);
    setCharDescription(char.description);
    setCharFace(char.facePrompt);
    setCharOutfit(char.outfitPrompt);
  };

  const saveCharacter = (charId: string) => {
    const updatedChars = project.characters.map(c => {
      if (c.id === charId) {
        return {
          ...c,
          name: charName,
          description: charDescription,
          facePrompt: charFace,
          outfitPrompt: charOutfit
        };
      }
      return c;
    });
    onUpdateProject({ ...project, characters: updatedChars });
    setEditingCharId(null);
  };

  const handleAddNewScene = () => {
    const newNumber = project.scenes.length + 1;
    const newScene: StoryboardScene = {
      id: `sc-custom-${Date.now()}`,
      sceneNumber: newNumber,
      title: `Untitled Scene ${newNumber}`,
      description: "Describe the cinematic narrative action taking place in this frame.",
      shotType: "Medium Shot",
      lens: "50mm Prime",
      movement: "Static",
      lighting: "High-Key Cinematic",
      vfxNotes: "None",
      soundEffects: "Ambient background track",
      duration: 120,
      imagePrompt: "A high-quality cinematic frame matching this scene.",
      videoPrompt: "Static camera. Soft focus.",
      dialogue: {
        speaker: "Dr. Mara Vance",
        text: "Insert dialogue text line here...",
        emotion: "neutral",
        startSecond: 5,
        durationSeconds: 5
      },
      customLut: "none",
      colorAdjustments: { exposure: 0, contrast: 0, saturation: 0, vignette: 10, filmGrain: 10, chromaticAberration: 0 },
      renderStatus: "idle",
      renderProgress: 0,
      renderLogs: ["Ready to deploy Stable Diffusion render job."]
    };

    onUpdateProject({
      ...project,
      scenes: [...project.scenes, newScene]
    });
    onSelectScene(newScene.id);
  };

  const handleDeleteScene = (sceneId: string) => {
    if (project.scenes.length <= 1) return;
    const filtered = project.scenes.filter(s => s.id !== sceneId);
    // Renumber remaining scenes
    const renumbered = filtered.map((s, idx) => ({
      ...s,
      sceneNumber: idx + 1
    }));
    onUpdateProject({
      ...project,
      scenes: renumbered
    });
    // Fallback selection to first scene
    if (selectedSceneId === sceneId) {
      onSelectScene(renumbered[0].id);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800" id="script-generator-panel">
      {/* Sub-tabs */}
      <div className="flex border-b border-slate-800 text-xs font-mono">
        <button
          onClick={() => setActiveTab('script')}
          className={`flex-1 py-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'script' 
              ? "border-amber-500 text-white font-bold bg-slate-950/40" 
              : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <Film className="h-3.5 w-3.5 text-amber-500" />
          Script & Storyboards
        </button>
        <button
          onClick={() => setActiveTab('characters')}
          className={`flex-1 py-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'characters' 
              ? "border-amber-500 text-white font-bold bg-slate-950/40" 
              : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <Users className="h-3.5 w-3.5 text-rose-500" />
          Character Sheet ({project.characters.length})
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {activeTab === 'script' ? (
          <>
            {/* AI Generator Box */}
            <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
                <span>Orchestrate Script via Gemini API</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Generate or enrich your 20-minute short film script outline, scenes, SD prompt matrices, and automated dialogue tracks.
              </p>
              
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-mono uppercase tracking-wide">Cinematography Directives</label>
                <textarea
                  value={promptNotes}
                  onChange={(e) => setPromptNotes(e.target.value)}
                  placeholder="E.g., An action sequence where Mara tries to trigger the obelisk but is ambushed by high-tech security guards. Deep orange and teal colors..."
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-300 focus:outline-none focus:border-amber-500 font-serif h-24 resize-none leading-relaxed"
                />
              </div>

              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 disabled:from-slate-800 disabled:to-slate-800 text-white font-bold text-xs py-2 rounded flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10 cursor-pointer disabled:cursor-not-allowed transition-all"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Synthesizing Storyboards...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 fill-white" />
                    <span>Generate Cinematic Pipeline</span>
                  </>
                )}
              </button>
            </div>

            {/* Scenes List */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest font-semibold">Storyboard Scenes</span>
                <button
                  onClick={handleAddNewScene}
                  className="text-[10px] text-amber-400 font-mono hover:text-amber-300 flex items-center gap-1 cursor-pointer bg-slate-800 px-2 py-1 rounded border border-slate-700"
                >
                  <Plus className="h-3 w-3" /> Add Shot
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {project.scenes.map((scene, idx) => {
                  const isSelected = scene.id === selectedSceneId;
                  return (
                    <div
                      key={scene.id}
                      onClick={() => onSelectScene(scene.id)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                        isSelected 
                          ? "bg-slate-950 border-amber-500/80 shadow-md shadow-amber-500/5" 
                          : "bg-slate-900/50 border-slate-800/60 hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono text-slate-500 font-bold">
                          SHOT {idx + 1} &bull; {scene.duration}s
                        </span>
                        
                        <div className="flex items-center gap-1.5">
                          {/* Render type tag */}
                          <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded-full border ${
                            scene.renderStatus === "completed" 
                              ? "bg-emerald-950/40 border-emerald-900 text-emerald-400"
                              : scene.renderStatus === "rendering"
                              ? "bg-amber-950/40 border-amber-900 text-amber-400 animate-pulse"
                              : "bg-slate-950 border-slate-800 text-slate-500"
                          }`}>
                            {scene.renderStatus}
                          </span>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteScene(scene.id);
                            }}
                            className="text-slate-500 hover:text-rose-500 p-0.5"
                            title="Delete Shot"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      <h4 className="text-xs font-semibold text-white mt-1">{scene.title}</h4>
                      <p className="text-[10.5px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {scene.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          /* Characters Panel with SD face and outfit prompts */
          <div className="flex flex-col gap-4" id="character-sheets">
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              Define physical models, clothing elements, and optic configurations to ensure precise, consistent character geometry across Stable Diffusion frame iterations.
            </p>

            <div className="flex flex-col gap-4">
              {project.characters.map((char) => (
                <div 
                  key={char.id}
                  className="bg-slate-950/60 rounded-lg p-3 border border-slate-800/80 flex flex-col gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img 
                      src={char.avatar} 
                      alt={char.name} 
                      className="w-11 h-11 rounded-lg object-cover border border-slate-750"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white">{char.name}</h4>
                        <span className="text-[9px] font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-850 text-slate-400">
                          {char.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 italic">{char.description}</p>
                    </div>
                  </div>

                  <div className="w-full bg-slate-900/60 p-2.5 rounded border border-slate-850 flex flex-col gap-2">
                    {editingCharId === char.id ? (
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-mono text-slate-500">Character Model Name</label>
                          <input 
                            value={charName}
                            onChange={(e) => setCharName(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded p-1 text-xs text-white"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-mono text-slate-500">Role Title</label>
                          <input 
                            value={charDescription}
                            onChange={(e) => setCharDescription(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded p-1 text-xs text-white"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-mono text-amber-500 font-bold">Stable Diffusion Face Consistency Anchor</label>
                          <textarea 
                            value={charFace}
                            onChange={(e) => setCharFace(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded p-1 text-xs text-slate-300 font-mono h-12 resize-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] font-mono text-rose-400 font-bold">Outfit & Costume Anchor</label>
                          <textarea 
                            value={charOutfit}
                            onChange={(e) => setCharOutfit(e.target.value)}
                            className="bg-slate-950 border border-slate-800 rounded p-1 text-xs text-slate-300 font-mono h-12 resize-none"
                          />
                        </div>
                        <button
                          onClick={() => saveCharacter(char.id)}
                          className="bg-emerald-600 text-white font-bold text-xs py-1.5 rounded flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Check className="h-3.5 w-3.5" /> Save Configuration
                        </button>
                      </div>
                    ) : (
                      <div className="text-[10px] flex flex-col gap-2">
                        <div>
                          <span className="text-amber-500 font-mono font-bold block mb-0.5">Stable Diffusion Face Anchor:</span>
                          <p className="text-slate-300 bg-slate-950/40 p-1.5 rounded border border-slate-850 font-mono">
                            {char.facePrompt}
                          </p>
                        </div>
                        <div>
                          <span className="text-rose-400 font-mono font-bold block mb-0.5">Costume & Weapon Attributes:</span>
                          <p className="text-slate-300 bg-slate-950/40 p-1.5 rounded border border-slate-850 font-mono">
                            {char.outfitPrompt}
                          </p>
                        </div>
                        <button
                          onClick={() => startEditCharacter(char)}
                          className="self-end text-slate-400 hover:text-white flex items-center gap-1 mt-1 font-mono text-[9px]"
                        >
                          <Edit2 className="h-3 w-3" /> Configure Model Prompt
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
