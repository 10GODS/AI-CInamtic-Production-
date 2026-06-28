/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Film, Sparkles, RefreshCw, AlertCircle, Play, Sliders, Settings, MessageSquare, ShieldAlert } from "lucide-react";
import WorkspaceHeader from "./components/WorkspaceHeader";
import TimelinePacingEditor from "./components/TimelinePacingEditor";
import ScriptGeneratorPanel from "./components/ScriptGeneratorPanel";
import CinematicPreviewPanel from "./components/CinematicPreviewPanel";
import RenderPipelineSettings from "./components/RenderPipelineSettings";
import CollabPanel from "./components/CollabPanel";
import { Project, StoryboardScene, Comment, ChatMessage, CoEditor } from "./types";

export default function App() {
  const [project, setProject] = useState<Project | null>(null);
  const [selectedSceneId, setSelectedSceneId] = useState<string>("");
  const [isGeminiConnected, setIsGeminiConnected] = useState(false);
  
  // Collaboration / Sync States
  const [comments, setComments] = useState<Comment[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [coEditors, setCoEditors] = useState<CoEditor[]>([]);
  const [activeRenders, setActiveRenders] = useState<{ sceneId: string, type: string, progress: number }[]>([]);

  // Local UX states
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Initial Fetch on Mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const projRes = await fetch("/api/project");
        const projData = await projRes.json();
        if (projData.project) {
          setProject(projData.project);
          // Auto select first scene
          if (projData.project.scenes?.length > 0) {
            setSelectedSceneId(projData.project.scenes[0].id);
          }
        }
        setIsGeminiConnected(projData.isGeminiConnected);

        const collabRes = await fetch("/api/collab");
        const collabData = await collabRes.json();
        setComments(collabData.comments || []);
        setChatMessages(collabData.chatMessages || []);
        setCoEditors(collabData.coEditors || []);
        setActiveRenders(collabData.activeRenders || []);
      } catch (err) {
        console.error("Failed to connect to backend service:", err);
        setErrorMessage("Warning: Connection to Express backend not active yet. Ensure server is initialized.");
      }
    };

    fetchInitialData();
  }, []);

  // 2. Real-time Multi-User Sync Polling Loop (every 2.5 seconds)
  useEffect(() => {
    const syncCollaboration = async () => {
      if (!project) return;
      try {
        const res = await fetch("/api/collab");
        const data = await res.json();
        setComments(data.comments || []);
        setChatMessages(data.chatMessages || []);
        setCoEditors(data.coEditors || []);
        setActiveRenders(data.activeRenders || []);

        // Also fetch project state to keep renders and scenes in sync
        const projRes = await fetch("/api/project");
        const projData = await projRes.json();
        if (projData.project) {
          setProject(prev => {
            if (!prev) return projData.project;
            
            // Merge in render logs/progress for scenes that are rendering, but preserve user's local input configurations
            const mergedScenes = projData.project.scenes.map((serverScene: StoryboardScene) => {
              const localScene = prev.scenes.find(s => s.id === serverScene.id);
              if (!localScene) return serverScene;
              
              // If server finished rendering, update render urls, progress, and status
              return {
                ...localScene,
                renderStatus: serverScene.renderStatus,
                renderProgress: serverScene.renderProgress,
                renderLogs: serverScene.renderLogs,
                renderedImageUrl: serverScene.renderedImageUrl || localScene.renderedImageUrl,
                renderedVideoUrl: serverScene.renderedVideoUrl || localScene.renderedVideoUrl
              };
            });

            return {
              ...prev,
              scenes: mergedScenes
            };
          });
        }
      } catch (err) {
        console.warn("Real-time sync interrupted:", err);
      }
    };

    const interval = setInterval(syncCollaboration, 2500);
    return () => clearInterval(interval);
  }, [project]);

  // 3. API Handlers
  const handleUpdateProject = async (updatedProj: Project) => {
    setProject(updatedProj);
    try {
      await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project: updatedProj })
      });
    } catch (err) {
      console.error("Failed to persist project update to server:", err);
    }
  };

  const handleUpdateScene = (updatedScene: StoryboardScene) => {
    if (!project) return;
    const updatedScenes = project.scenes.map((s) => (s.id === updatedScene.id ? updatedScene : s));
    handleUpdateProject({ ...project, scenes: updatedScenes });
  };

  const handleGenerateScript = async (notes: string) => {
    if (!project) return;
    setIsGeneratingScript(true);
    setErrorMessage(null);
    try {
      const response = await fetch("/api/generate-script", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: project.title,
          genre: project.genre,
          logline: project.logline,
          targetDurationMinutes: project.targetDurationMinutes,
          scriptNotes: notes
        })
      });

      if (!response.ok) {
        throw new Error("Server responded with a non-200 code");
      }

      const data = await response.json();
      if (data.success) {
        const updatedProject: Project = {
          ...project,
          title: data.title,
          logline: data.logline,
          scenes: data.scenes,
          scriptNotes: notes,
          characters: data.characters || project.characters,
          updatedAt: Date.now()
        };
        setProject(updatedProject);
        if (data.scenes?.length > 0) {
          setSelectedSceneId(data.scenes[0].id);
        }
      } else {
        throw new Error(data.error || "Script synthesis failed");
      }
    } catch (err) {
      console.error("Script generation error:", err);
      setErrorMessage("Gemini API script generation failed. Reverting to local simulation script pipeline.");
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleAddComment = async (text: string) => {
    if (!project || !selectedSceneId) return;
    try {
      await fetch("/api/collab/comment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneId: selectedSceneId,
          text,
          userName: "Lead Colorist",
          userRole: "Colorist"
        })
      });
      // Instant local feedback
      setComments(prev => [
        ...prev,
        {
          id: `local-comm-${Date.now()}`,
          sceneId: selectedSceneId,
          userName: "Lead Colorist",
          userRole: "Colorist",
          text,
          timestamp: Date.now()
        }
      ]);
    } catch (err) {
      console.error("Failed to post comment:", err);
    }
  };

  const handleAddChatMessage = async (text: string) => {
    try {
      await fetch("/api/collab/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          userName: "Lead Colorist",
          userRole: "Colorist"
        })
      });
      // Instant local feedback
      setChatMessages(prev => [
        ...prev,
        {
          id: `local-chat-${Date.now()}`,
          userName: "Lead Colorist",
          userRole: "Colorist",
          text,
          timestamp: Date.now()
        }
      ]);
    } catch (err) {
      console.error("Failed to post chat message:", err);
    }
  };

  const handleRenderScene = async (sceneId: string, type: 'stable-diffusion' | 'ltx-video' | 'wan-video') => {
    try {
      await fetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sceneId, type })
      });
      // Instant progress update simulation in list
      setProject(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          scenes: prev.scenes.map(s => {
            if (s.id === sceneId) {
              return {
                ...s,
                renderStatus: "rendering",
                renderProgress: 0,
                renderLogs: ["[PIPELINE] Initializing Cinematic Node...", `[GPU] Allocating VRAM for ${type}...`]
              };
            }
            return s;
          })
        };
      });
    } catch (err) {
      console.error("Failed to queue render job:", err);
    }
  };

  const handleResetProject = async () => {
    try {
      const res = await fetch("/api/project/reset", { method: "POST" });
      const data = await res.json();
      if (data.project) {
        setProject(data.project);
        if (data.project.scenes?.length > 0) {
          setSelectedSceneId(data.project.scenes[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to reset project:", err);
    }
  };

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-white font-mono gap-4" id="app-loading">
        <RefreshCw className="h-10 w-10 text-amber-500 animate-spin" />
        <div className="flex flex-col items-center">
          <span className="text-sm font-bold tracking-widest text-slate-300">CINEMATIC PIPELINE</span>
          <span className="text-xs text-slate-500 mt-1">Acquiring GPU Clusters & Workspace state...</span>
        </div>
      </div>
    );
  }

  const selectedScene = project.scenes.find((s) => s.id === selectedSceneId) || project.scenes[0];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans" id="cinematic-suite">
      {/* 1. Header Row */}
      <WorkspaceHeader
        project={project}
        coEditors={coEditors}
        onUpdateProject={handleUpdateProject}
        isGeminiConnected={isGeminiConnected}
      />

      {/* Error alert drawer */}
      {errorMessage && (
        <div className="bg-amber-950/40 border-b border-amber-900 px-4 py-2 flex items-center justify-between text-xs text-amber-300" id="error-bar">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button 
            onClick={() => setErrorMessage(null)}
            className="text-[10px] text-amber-500 hover:text-amber-300 font-mono"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* 2. Primary Workspace Body */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden" id="workspace-body">
        
        {/* Left Side: Script breakdowns / Character models (Width 20-25%) */}
        <div className="w-full md:w-[350px] shrink-0 border-r border-slate-800">
          <ScriptGeneratorPanel
            project={project}
            onUpdateProject={handleUpdateProject}
            onGenerateScript={handleGenerateScript}
            isGenerating={isGeneratingScript}
            selectedSceneId={selectedSceneId}
            onSelectScene={setSelectedSceneId}
          />
        </div>

        {/* Center Canvas: Camera Viewfinder & Timeline */}
        <div className="flex-1 flex flex-col min-w-0 bg-slate-950" id="canvas-center">
          
          {/* Main Frame Viewfinder Panel */}
          <div className="flex-1 min-h-0">
            <CinematicPreviewPanel
              scene={selectedScene}
              project={project}
              onUpdateScene={handleUpdateScene}
              onRenderScene={handleRenderScene}
            />
          </div>

          {/* Interactive timeline tracking */}
          <TimelinePacingEditor
            scenes={project.scenes}
            selectedSceneId={selectedSceneId}
            onSelectScene={setSelectedSceneId}
            onRenderScene={handleRenderScene}
          />
        </div>

        {/* Right Side Column: Diffusers Settings + Team Review Feed */}
        <div className="w-full md:w-[380px] shrink-0 flex flex-col border-l border-slate-800 h-full overflow-hidden" id="workspace-right">
          
          {/* Top Half: Diffusion Engine controls + GPU log terminal */}
          <div className="h-1/2 min-h-[300px] border-b border-slate-800">
            <RenderPipelineSettings
              scene={selectedScene}
              project={project}
              onUpdateProject={handleUpdateProject}
              onRenderScene={handleRenderScene}
              activeRenders={activeRenders}
            />
          </div>

          {/* Bottom Half: Team Chat and Comments Synchronization */}
          <div className="flex-1 min-h-[250px]">
            <CollabPanel
              scene={selectedScene}
              comments={comments}
              chatMessages={chatMessages}
              onAddComment={handleAddComment}
              onAddChatMessage={handleAddChatMessage}
            />
          </div>
        </div>
      </div>
      
      {/* Tiny utility footer */}
      <footer className="h-6 bg-slate-950 border-t border-slate-800/60 px-4 flex items-center justify-between text-[9px] text-slate-500 font-mono" id="suite-footer">
        <span>RED EPIC ANAMORPHIC PIPELINE SIMULATION v4.2 &bull; COMPATIBILITY: LUT, VFX, 3D, CGI</span>
        <button 
          onClick={handleResetProject}
          className="hover:text-white transition-colors cursor-pointer bg-slate-900 border border-slate-800 px-2 rounded hover:border-slate-600"
        >
          RESET PIPELINE TO DEFAULT
        </button>
      </footer>
    </div>
  );
}
