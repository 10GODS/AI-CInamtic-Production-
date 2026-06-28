/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { MessageSquare, Users, Send, CheckCircle, MessageCircleCode, VolumeX, ShieldCheck } from "lucide-react";
import { Comment, ChatMessage, StoryboardScene } from "../types";

interface CollabPanelProps {
  scene: StoryboardScene;
  comments: Comment[];
  chatMessages: ChatMessage[];
  onAddComment: (text: string) => void;
  onAddChatMessage: (text: string) => void;
}

export default function CollabPanel({
  scene,
  comments,
  chatMessages,
  onAddComment,
  onAddChatMessage
}: CollabPanelProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'chat'>('comments');
  const [inputText, setInputText] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const commentEndRef = useRef<HTMLDivElement>(null);

  // Filter comments belonging exclusively to current active scene
  const filteredComments = comments.filter(c => c.sceneId === scene.id);

  // Auto scroll to bottom when new messages come in
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {
    commentEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments, scene.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    if (activeTab === 'comments') {
      onAddComment(inputText);
    } else {
      onAddChatMessage(inputText);
    }
    setInputText("");
  };

  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Director': return 'text-rose-400 bg-rose-950/40 border-rose-900/60';
      case 'VFX Artist': return 'text-blue-400 bg-blue-950/40 border-blue-900/60';
      case 'Sound Designer': return 'text-emerald-400 bg-emerald-950/40 border-emerald-900/60';
      default: return 'text-amber-400 bg-amber-950/40 border-amber-900/60';
    }
  };

  return (
    <div className="bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 flex flex-col h-[350px] md:h-full" id="collab-panel">
      {/* Sub tabs */}
      <div className="flex border-b border-slate-800 text-[11px] font-mono">
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex-1 py-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'comments'
              ? "border-amber-500 text-white font-bold bg-slate-950/40"
              : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <MessageCircleCode className="h-3.5 w-3.5 text-amber-500" />
          Shot Review ({filteredComments.length})
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-3 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'chat'
              ? "border-amber-500 text-white font-bold bg-slate-950/40"
              : "border-transparent text-slate-400 hover:text-slate-300"
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5 text-rose-500" />
          Team Chat Room ({chatMessages.length})
        </button>
      </div>

      {/* Message viewports */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 min-h-0 bg-slate-950/20">
        {activeTab === 'comments' ? (
          filteredComments.length > 0 ? (
            <div className="flex flex-col gap-3">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-semibold border-b border-slate-850 pb-1 block">
                Shot Review Log &bull; {scene.title}
              </span>
              {filteredComments.map((comment) => (
                <div key={comment.id} className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 flex flex-col gap-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-200">{comment.userName}</span>
                      <span className={`text-[8px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold tracking-wider ${getRoleBadgeColor(comment.userRole)}`}>
                        {comment.userRole}
                      </span>
                    </div>
                    <span className="text-[9px] font-mono text-slate-500">{formatTime(comment.timestamp)}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{comment.text}</p>
                </div>
              ))}
              <div ref={commentEndRef} />
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-600">
              <MessageSquare className="h-8 w-8 text-slate-850 mb-2" />
              <p className="text-xs">No feedback on this shot yet.</p>
              <p className="text-[10px] text-slate-500 mt-1">Review the compositions and write your notes below to align the team.</p>
            </div>
          )
        ) : (
          /* Live Chat Room */
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-semibold border-b border-slate-850 pb-1 block">
              Multi-User Collaborative Chat
            </span>
            {chatMessages.map((msg) => (
              <div key={msg.id} className="flex flex-col gap-0.5">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-[11px] font-bold text-slate-200">{msg.userName}</span>
                  <span className={`text-[7px] font-mono px-1 rounded uppercase font-bold tracking-wider ${getRoleBadgeColor(msg.userRole)}`}>
                    {msg.userRole}
                  </span>
                  <span className="text-[8px] font-mono text-slate-500 ml-auto">{formatTime(msg.timestamp)}</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-900/40 p-2 rounded border border-slate-850/40 font-sans">
                  {msg.text}
                </p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Input box */}
      <form onSubmit={handleSubmit} className="border-t border-slate-800 p-2.5 bg-slate-900 flex gap-2" id="collab-input-form">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            activeTab === 'comments'
              ? "Add shot feedback, e.g., 'Increase contrast...'"
              : "Message the production team..."
          }
          className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
        />
        <button
          type="submit"
          className="bg-amber-500 hover:bg-amber-600 text-white p-1.5 rounded flex items-center justify-center cursor-pointer transition-colors"
          title="Send"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </form>
    </div>
  );
}
