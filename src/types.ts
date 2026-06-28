/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ColorAdjustments {
  exposure: number;     // -100 to 100
  contrast: number;     // -100 to 100
  saturation: number;   // -100 to 100
  vignette: number;     // 0 to 100
  filmGrain: number;    // 0 to 100
  chromaticAberration: number; // 0 to 100
}

export interface Character {
  id: string;
  name: string;
  role: string;
  description: string;
  facePrompt: string;  // Description for facial consistency
  outfitPrompt: string; // Description for costume consistency
  avatar: string;
}

export interface DialogueSegment {
  speaker: string;
  text: string;
  emotion: 'intense' | 'whisper' | 'melodramatic' | 'heroic' | 'fearful' | 'neutral';
  startSecond: number;
  durationSeconds: number;
  voiceoverAudioUrl?: string; // Generated TTS
}

export interface StoryboardScene {
  id: string;
  sceneNumber: number;
  title: string;
  description: string;
  shotType: 'Extreme Wide Shot' | 'Wide Shot' | 'Medium Shot' | 'Close-Up' | 'Extreme Close-Up' | 'Over-the-Shoulder' | 'Dutch Angle';
  lens: '24mm Wide-Angle' | '35mm Anamorphic Cinema' | '50mm Prime' | '85mm Portrait' | '135mm Telephoto';
  movement: 'Static' | 'Pan & Tilt' | 'Slow Dolly In' | 'Tracking Shot' | 'Crane down & Zoom' | 'Handheld Shake';
  lighting: 'Chiaroscuro Neon Noir' | 'Golden Hour Warm' | 'High-Key Cinematic' | 'Moonlit Moody' | 'Sundance Natural' | 'Cyberpunk Neon';
  vfxNotes: string; // VFX, CGI, 3D overlays
  soundEffects: string; // sound cues, low rumbles, high-tech bleeps
  duration: number; // in seconds
  imagePrompt: string; // prompt for stable diffusion
  videoPrompt: string; // prompt for LTX/Wan video movement
  dialogue: DialogueSegment;
  customLut: 'none' | 'teal-orange' | 'technicolor' | 'matrix-green' | 'noir-high' | 'cyberpunk' | 'sundance-warm';
  colorAdjustments: ColorAdjustments;
  
  // Render Outputs
  renderedImageUrl?: string;
  renderedVideoUrl?: string;
  renderStatus: 'idle' | 'rendering' | 'completed' | 'failed';
  renderProgress: number; // 0 to 100
  renderLogs: string[];
}

export interface Project {
  id: string;
  title: string;
  genre: 'Action Adventure' | 'Sci-Fi Cyberpunk' | 'Fantasy Epic' | 'Noir Thriller' | 'Horror Survival';
  logline: string;
  targetDurationMinutes: number; // e.g. 20
  scriptNotes: string;
  scenes: StoryboardScene[];
  characters: Character[];
  lutPreset: 'none' | 'teal-orange' | 'technicolor' | 'matrix-green' | 'noir-high' | 'cyberpunk' | 'sundance-warm';
  customLutIntensity: number; // 0 to 100
  renderResolution: '720p' | '1080p' | 'Cinema-4K';
  aspectRatio: '16:9' | '2.39:1 Anamorphic' | '9:16 Vertical' | '1:1 Square';
  hdrEnabled: boolean;
  diffusionSteps: number; // 20-150
  cfgGuidance: number; // 1 to 20
  motionWeight: number; // 0.1 to 2.0
  createdAt: number;
  updatedAt: number;
}

export interface CoEditor {
  id: string;
  name: string;
  role: 'Director' | 'Colorist' | 'VFX Artist' | 'Sound Designer' | 'Cinematographer';
  activeSceneId?: string;
  color: string;
  avatar: string;
  cursorField?: string; // Field they are currently looking at/editing
  lastActive: number;
}

export interface Comment {
  id: string;
  sceneId: string;
  userName: string;
  userRole: string;
  text: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  userName: string;
  userRole: string;
  text: string;
  timestamp: number;
}
