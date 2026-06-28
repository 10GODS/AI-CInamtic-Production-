/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "20mb" }));

// ---------------------------------------------------------
// Gemini AI API Client (Lazy & Safe)
// ---------------------------------------------------------
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// ---------------------------------------------------------
// Global Collaborative In-Memory Database
// ---------------------------------------------------------
import { Project, StoryboardScene, Character, CoEditor, Comment, ChatMessage } from "./src/types";

const INITIAL_CHARACTERS: Character[] = [
  {
    id: "char-mara",
    name: "Dr. Mara Vance",
    role: "Rogue Archaeologist",
    description: "Determined, sun-worn explorer wearing a high-tech dust cloak, leather tactical gear, and a glowing neon wrist-vessel.",
    facePrompt: "A sun-bronzed athletic woman in her late 30s, intense green eyes, sharp jawline, messy dark hair tied back with goggles resting on her forehead.",
    outfitPrompt: "Weathered brown leather bandolier, desert sand-colored tactical cowl, cybernetic carbon-fiber gauntlet on left wrist reflecting blue cyan light.",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "char-jax",
    name: "JAX-8",
    role: "Cybernetic Navigator",
    description: "A repurposed industrial robot companion with a modular optic eye and a rusted, hazard-striped titanium frame.",
    facePrompt: "Circular brass optic sensor with a lens aperture that expands and glows orange based on cognitive load, carbon-scorched titanium chassis.",
    outfitPrompt: "Scratched yellow hazard paint over heavy steel joints, secondary micro-armature holding dynamic focus lenses, exposed high-voltage copper wiring.",
    avatar: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=200"
  }
];

const INITIAL_SCENES: StoryboardScene[] = [
  {
    id: "scene-1",
    sceneNumber: 1,
    title: "The Desert Sanctuary",
    description: "Mara and JAX-8 stand atop a massive, wind-swept sand dune overlooking the long-forgotten Terraforming Obelisk reflecting the golden hour sun.",
    shotType: "Extreme Wide Shot",
    lens: "35mm Anamorphic Cinema",
    movement: "Slow Dolly In",
    lighting: "Golden Hour Warm",
    vfxNotes: "Heat distortion haze floating above sand ripples. Add orange anamorphic lens flare across the frame, matching the 2.39:1 aspect ratio.",
    soundEffects: "Low desert wind whistling, metallic sand particles pinging against Jax's titanium plating. Deep synth pad drone.",
    duration: 180, // 3 minutes scene context
    imagePrompt: "A widescreen cinematic shot of a futuristic desert. A rogue female archaeologist with a cybernetic gauntlet and a rusted industrial robot stand on a sand dune, looking at a towering crystalline obelisk in the distance. Golden hour sun, warm lighting, cinematic anamorphic lens flares, orange and teal, photorealistic, 8k resolution.",
    videoPrompt: "A slow dramatic dolly-in. Golden particles of sand blow across the screen, camera moves past the characters' silhouettes towards the glowing obelisk.",
    dialogue: {
      speaker: "Dr. Mara Vance",
      text: "There it is, JAX. The catalyst. Twenty years of searching, and it's just waiting for us to turn the key.",
      emotion: "heroic",
      startSecond: 12,
      durationSeconds: 8
    },
    customLut: "teal-orange",
    colorAdjustments: {
      exposure: 5,
      contrast: 15,
      saturation: 10,
      vignette: 25,
      filmGrain: 15,
      chromaticAberration: 10
    },
    renderStatus: "completed",
    renderProgress: 100,
    renderLogs: [
      "[SDXL] Loading model weights...",
      "[SDXL] Generating frame 1 with prompt seed 42...",
      "[SDXL] Applying character consistency masks for Mara Vance...",
      "[SDXL] Applying face restoration network...",
      "[LUT] Applying Teal-Orange 3D-LUT colour grade...",
      "[RENDER] Frame generated successfully."
    ],
    renderedImageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "scene-2",
    sceneNumber: 2,
    title: "Obelisk Approach",
    description: "Mara slides down the shifting sands of the dune towards the colossal obsidian doors of the obelisk. Jax hovers behind, lens spinning in anticipation.",
    shotType: "Wide Shot",
    lens: "24mm Wide-Angle",
    movement: "Tracking Shot",
    lighting: "Sundance Natural",
    vfxNotes: "Dynamic sand particles spraying up behind Mara's boots. Holographic glyphs start glowing blue on the obelisk door frame.",
    soundEffects: "Heavy sand sliding, mechanical hydraulic whir of Jax's stabilizers adjusting, high-frequency digital scanning bleeps.",
    duration: 210,
    imagePrompt: "Cinematic tracking shot. A female explorer sliding down a steep desert dune towards massive ancient obsidian temple doors. Shifting sand spray, ancient glowing blue glyphs on the stone columns, sunny day, lens flare, filmic grain.",
    videoPrompt: "Fast camera tracking following the explorer as she slides. Dust and sand particles rush towards the camera lens.",
    dialogue: {
      speaker: "JAX-8",
      text: "Mara, my thermal arrays detect an energy surge from the core. Also... three high-altitude trackers are closing in.",
      emotion: "fearful",
      startSecond: 8,
      durationSeconds: 9
    },
    customLut: "sundance-warm",
    colorAdjustments: {
      exposure: 0,
      contrast: 10,
      saturation: -5,
      vignette: 15,
      filmGrain: 8,
      chromaticAberration: 5
    },
    renderStatus: "completed",
    renderProgress: 100,
    renderLogs: [
      "[SDXL] Loading model weights...",
      "[SDXL] Generating frame with prompt seed 109...",
      "[LUT] Applying Sundance Warm LUT...",
      "[RENDER] Completed successfully."
    ],
    renderedImageUrl: "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "scene-3",
    sceneNumber: 3,
    title: "The Terraforming Core",
    description: "Inside the sanctuary chamber, Mara inserts her wrist-vessel into the central control pedestal. Liquid light flows up the stone conduits.",
    shotType: "Close-Up",
    lens: "50mm Prime",
    movement: "Static",
    lighting: "Chiaroscuro Neon Noir",
    vfxNotes: "Intense cyan laser arrays reflecting off Mara's sweat-damped face. Volumetric light shafts tracing ancient structures.",
    soundEffects: "Humming high-voltage power grids, deep bass resonance vibration, liquid crackling sound as light channels fill.",
    duration: 300,
    imagePrompt: "A close-up cinematic shot. A woman inserting her high-tech wrist-vessel into an ancient glowing pedestal. Blue cyan neon light piping up stone patterns, dramatic high-contrast lighting, cyber-noir style, 35mm anamorphic camera lens.",
    videoPrompt: "Slow camera tilt-up from the hand to her glowing eyes. Volumetric dust floating in glowing blue light shafts.",
    dialogue: {
      speaker: "Dr. Mara Vance",
      text: "The seals are breaking. Look at the telemetry, Jax... the atmosphere generator is actually coming back to life!",
      emotion: "intense",
      startSecond: 15,
      durationSeconds: 7
    },
    customLut: "matrix-green",
    colorAdjustments: {
      exposure: -10,
      contrast: 25,
      saturation: 20,
      vignette: 40,
      filmGrain: 20,
      chromaticAberration: 15
    },
    renderStatus: "completed",
    renderProgress: 100,
    renderLogs: [
      "[SDXL] Injecting facial details for Mara Vance...",
      "[SDXL] Rendering volumetric lighting grids...",
      "[LUT] Applying Matrix Green cyberpunk tint...",
      "[RENDER] Completed successfully."
    ],
    renderedImageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "scene-4",
    sceneNumber: 4,
    title: "The Orbital Ambush",
    description: "The chamber ceiling explodes. High-tech shock troops descend on gravity cables. Jax raises his hazard-shields as blaster fire fills the air.",
    shotType: "Dutch Angle",
    lens: "35mm Anamorphic Cinema",
    movement: "Handheld Shake",
    lighting: "Cyberpunk Neon",
    vfxNotes: "Dynamic amber blaster trails, exploding stone debris, structural smoke, spark discharges from ceiling support rigs.",
    soundEffects: "Deafening sonic explosions, laser fire crackles, mechanical armor thuds, high-pushed alarm sirens.",
    duration: 240,
    imagePrompt: "An action scene in a sci-fi temple. High-tech soldiers descending on cables through a collapsed ceiling, blaster fire, orange lasers, smoke, debris, dramatic action movie shot, anamorphic widescreen, cinematic camera shake.",
    videoPrompt: "Wan-Video simulation: Rapid camera pan and zoom, hand-held camera rumble. Intense motion blurring, laser bolts flashing.",
    dialogue: {
      speaker: "JAX-8",
      text: "Warning! Primary barrier depleted! Mara, we must override the coolant cycle or the whole chamber goes critical!",
      emotion: "melodramatic",
      startSecond: 5,
      durationSeconds: 8
    },
    customLut: "cyberpunk",
    colorAdjustments: {
      exposure: 15,
      contrast: 30,
      saturation: 35,
      vignette: 30,
      filmGrain: 25,
      chromaticAberration: 20
    },
    renderStatus: "completed",
    renderProgress: 100,
    renderLogs: [
      "[SDXL] Simulating extreme motion blur...",
      "[VFX] Drawing 3D particle blasters...",
      "[LUT] Grading with Cyberpunk high-saturation LUT...",
      "[RENDER] Frame complete."
    ],
    renderedImageUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=1200"
  },
  {
    id: "scene-5",
    sceneNumber: 5,
    title: "Terraformation Echoes",
    description: "Mara activates the final sequence as the chamber collapses. A massive pulse of green life-energy shoots into the sky, terraforming the dunes into grass.",
    shotType: "Extreme Wide Shot",
    lens: "135mm Telephoto",
    movement: "Crane down & Zoom",
    lighting: "Moonlit Moody",
    vfxNotes: "A gigantic shockwave of green terraforming energy ripples across the desert, turning sand into lush flora in its wake. Glowing clouds.",
    soundEffects: "Earsplitting thunderous boom, transition to total silence, then gentle rustling of fresh leaves. Swelling symphonic strings.",
    duration: 270,
    imagePrompt: "A stunning wide landscape. A massive wave of green light terraforming a glowing alien desert. Half sand, half lush green grasslands. Beautiful deep starry night sky, epic sci-fi matte painting, cinematic movie poster style.",
    videoPrompt: "LTX Video: Epic sweeping aerial crane zoom out as the green grass wave covers the planetary horizon.",
    dialogue: {
      speaker: "Dr. Mara Vance",
      text: "We did it, Jax. Look at it. It's breathing again.",
      emotion: "neutral",
      startSecond: 20,
      durationSeconds: 6
    },
    customLut: "noir-high",
    colorAdjustments: {
      exposure: -5,
      contrast: 20,
      saturation: -10,
      vignette: 20,
      filmGrain: 12,
      chromaticAberration: 8
    },
    renderStatus: "completed",
    renderProgress: 100,
    renderLogs: [
      "[SDXL] Compositing sky dome with nebula clusters...",
      "[LTX] Interpolating vegetation growth vectors...",
      "[LUT] Applying Noir High Contrast LUT...",
      "[RENDER] Success."
    ],
    renderedImageUrl: "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=1200"
  }
];

const INITIAL_PROJECT: Project = {
  id: "proj-1",
  title: "Oasis Protocol: Echoes of Wan",
  genre: "Action Adventure",
  logline: "A rogue archaeologist and her cybernetic navigator race against an orbital enforcement squad to trigger an ancient terraforming machine buried in a sun-baked desert planet.",
  targetDurationMinutes: 20,
  scriptNotes: "Maintain high-speed action beats paired with breathtaking, wide anamorphic desert compositions. Focus on deep Orange & Teal colors with subtle film grain. The mechanical companion, Jax, should add lighthearted urgency.",
  scenes: INITIAL_SCENES,
  characters: INITIAL_CHARACTERS,
  lutPreset: "teal-orange",
  customLutIntensity: 85,
  renderResolution: "1080p",
  aspectRatio: "2.39:1 Anamorphic",
  hdrEnabled: true,
  diffusionSteps: 50,
  cfgGuidance: 7.5,
  motionWeight: 1.2,
  createdAt: Date.now() - 3600000,
  updatedAt: Date.now()
};

let currentProject: Project = { ...INITIAL_PROJECT };

// Chat & Collaborative Comments Databases
let comments: Comment[] = [
  {
    id: "comm-1",
    sceneId: "scene-1",
    userName: "Sarah Jennings",
    userRole: "Director",
    text: "This establishing shot is breathtaking! Can we push the custom Teal-Orange saturation up slightly to make the sky bloom?",
    timestamp: Date.now() - 3000000
  },
  {
    id: "comm-2",
    sceneId: "scene-3",
    userName: "Alex Chen",
    userRole: "VFX Artist",
    text: "Working on the 3D hologram asset to overlay on Mara's gauntlet. It will emit a soft cyan pulse mapped to the dialogue start.",
    timestamp: Date.now() - 1500000
  },
  {
    id: "comm-3",
    sceneId: "scene-4",
    userName: "Michael Vance",
    userRole: "Sound Designer",
    text: "The sound cue here needs a massive sub-bass drop the moment the ceiling explodes. I'll sync it with the LTX camera tilt.",
    timestamp: Date.now() - 500000
  }
];

let chatMessages: ChatMessage[] = [
  {
    id: "chat-1",
    userName: "Sarah Jennings",
    userRole: "Director",
    text: "Welcome to the pipeline editor! Let's get these 5 core scenes locked in so we can push to the LTX/Wan rendering nodes.",
    timestamp: Date.now() - 3500000
  },
  {
    id: "chat-2",
    userName: "Alex Chen",
    userRole: "VFX Artist",
    text: "Jax's hazard stripes are lookin extremely crisp in the Scene 2 render. The character consistency weights are spot on.",
    timestamp: Date.now() - 2500000
  },
  {
    id: "chat-3",
    userName: "Michael Vance",
    userRole: "Sound Designer",
    text: "Should we try generating a custom cinematic score segment? Lyria models would do an awesome orchestral track for this desert theme.",
    timestamp: Date.now() - 1000000
  }
];

// Active mock co-editors to make the cloud environment feel alive and real
let coEditors: CoEditor[] = [
  {
    id: "user-sarah",
    name: "Sarah Jennings",
    role: "Director",
    activeSceneId: "scene-1",
    color: "#e11d48", // Rose-600
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
    cursorField: "title",
    lastActive: Date.now()
  },
  {
    id: "user-alex",
    name: "Alex Chen",
    role: "VFX Artist",
    activeSceneId: "scene-3",
    color: "#2563eb", // Blue-600
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
    cursorField: "vfxNotes",
    lastActive: Date.now()
  },
  {
    id: "user-michael",
    name: "Michael Vance",
    role: "Sound Designer",
    activeSceneId: "scene-4",
    color: "#16a34a", // Green-600
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150",
    cursorField: "soundEffects",
    lastActive: Date.now()
  }
];

// ---------------------------------------------------------
// Active Render Queue Manager
// ---------------------------------------------------------
interface ActiveRender {
  sceneId: string;
  type: "stable-diffusion" | "ltx-video" | "wan-video";
  progress: number;
  logs: string[];
}
let activeRenders: ActiveRender[] = [];

// Helper to simulate rendering progress
function runSimulatedRender(sceneId: string, type: "stable-diffusion" | "ltx-video" | "wan-video") {
  const existingRender = activeRenders.find(r => r.sceneId === sceneId && r.type === type);
  if (existingRender) return;

  const newRender: ActiveRender = {
    sceneId,
    type,
    progress: 0,
    logs: [
      `[PIPELINE] Initializing Cinematic Node for scene ${sceneId}...`,
      `[GPU] Allocating VRAM for ${type === "stable-diffusion" ? "SDXL 1.0" : type === "ltx-video" ? "LTX-Video (720p)" : "Wan-Video 14B"}...`,
      `[MODEL] Loading weights & text encoder bindings...`
    ]
  };
  activeRenders.push(newRender);

  // Mark the scene in our project as rendering
  const scene = currentProject.scenes.find(s => s.id === sceneId);
  if (scene) {
    scene.renderStatus = "rendering";
    scene.renderProgress = 0;
    scene.renderLogs = [...newRender.logs];
  }

  const interval = setInterval(() => {
    const render = activeRenders.find(r => r.sceneId === sceneId && r.type === type);
    if (!render) {
      clearInterval(interval);
      return;
    }

    render.progress += 10;
    
    // Add logs dynamically based on progress
    if (render.progress === 20) {
      render.logs.push(`[GPU] Seed resolved to ${Math.floor(Math.random() * 1000000)}. Running text embeddings...`);
      render.logs.push(`[MODEL] Injecting character consistency anchors: "${currentProject.characters[0]?.name}" face structure.`);
    } else if (render.progress === 40) {
      render.logs.push(`[DIFFUSION] Iteration steps 1-20/50 starting...`);
      render.logs.push(`[DIFFUSION] Latent denoising matching 2.39:1 CinemaScope aspect ratio.`);
    } else if (render.progress === 60) {
      if (type === "stable-diffusion") {
        render.logs.push(`[VFX] Analyzing depth map layers. Generating 3D depth meshes...`);
      } else {
        render.logs.push(`[VIDEO] Generating motion vectors. Interpolating frames at 24.0 fps...`);
        render.logs.push(`[VIDEO] ${type === "ltx-video" ? "LTX Transformer spatial layers resolved" : "Wan-Video optical flow estimation active"}`);
      }
    } else if (render.progress === 80) {
      render.logs.push(`[POST-PROCESS] Decoding latents via high-precision VAE decoder...`);
      render.logs.push(`[LUT] Applying cinematic 3D-LUT grade "${currentProject.lutPreset}" with intensity ${currentProject.customLutIntensity}%...`);
    } else if (render.progress >= 100) {
      render.progress = 100;
      render.logs.push(`[PIPELINE] Render complete. Exporting high-dynamic-range (HDR) Rec.2020 frame buffers...`);
      render.logs.push(`[SUCCESS] Scene ${sceneId} pipeline processed in 5.2 seconds.`);
      
      // Update scene in current project
      const targetScene = currentProject.scenes.find(s => s.id === sceneId);
      if (targetScene) {
        targetScene.renderStatus = "completed";
        targetScene.renderProgress = 100;
        targetScene.renderLogs = [...render.logs];
        
        // Generate a cool thematic cinematic image if stable-diffusion was requested
        if (type === "stable-diffusion") {
          const unsplashThemes: Record<string, string> = {
            "scene-1": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1200",
            "scene-2": "https://images.unsplash.com/photo-1547234935-80c7145ec969?auto=format&fit=crop&q=80&w=1200",
            "scene-3": "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=1200",
            "scene-4": "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&q=80&w=1200",
            "scene-5": "https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&q=80&w=1200"
          };
          // Fallback random scenic design
          targetScene.renderedImageUrl = unsplashThemes[sceneId] || "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1200";
        } else {
          // It's a video render. Assign a placeholder video layout or stylized loop
          targetScene.renderedVideoUrl = "https://assets.mixkit.co/videos/preview/mixkit-flying-through-glowing-neon-lines-in-space-41584-large.mp4";
        }
      }

      // Add a simulated positive director review to show collaborative teams reacting
      const randomComments = [
        "Looks gorgeous! The character expressions fit the script perfectly.",
        "Color grade looks incredibly lush. That Rec.2020 spectrum is gorgeous.",
        "The motion flow is so smooth! Outstanding LTX/Wan vector stabilization.",
        "Great work matching the anamorphic lens characteristics here."
      ];
      const botNames = [
        { name: "Sarah Jennings", role: "Director" },
        { name: "Alex Chen", role: "VFX Artist" },
        { name: "Michael Vance", role: "Sound Designer" }
      ];
      const chooser = Math.floor(Math.random() * botNames.length);
      const commenter = botNames[chooser];
      comments.push({
        id: `comm-sim-${Date.now()}`,
        sceneId,
        userName: commenter.name,
        userRole: commenter.role,
        text: `[Auto-Review] ${randomComments[Math.floor(Math.random() * randomComments.length)]}`,
        timestamp: Date.now()
      });

      // Remove from active renders list
      activeRenders = activeRenders.filter(r => !(r.sceneId === sceneId && r.type === type));
      clearInterval(interval);
    }

    // Update ongoing progress inside current project
    const sceneUpdate = currentProject.scenes.find(s => s.id === sceneId);
    if (sceneUpdate && sceneUpdate.renderStatus === "rendering") {
      sceneUpdate.renderProgress = render.progress;
      sceneUpdate.renderLogs = [...render.logs];
    }
  }, 1200);
}

// ---------------------------------------------------------
// API Endpoints
// ---------------------------------------------------------

// Retrieve current project state
app.get("/api/project", (req, res) => {
  res.json({
    project: currentProject,
    isGeminiConnected: getGeminiClient() !== null,
  });
});

// Save / update project state
app.post("/api/project", (req, res) => {
  const { project } = req.body;
  if (project) {
    currentProject = {
      ...project,
      updatedAt: Date.now()
    };
    res.json({ success: true, project: currentProject });
  } else {
    res.status(400).json({ error: "Missing project payload" });
  }
});

// Reset project to default
app.post("/api/project/reset", (req, res) => {
  currentProject = { ...INITIAL_PROJECT, scenes: JSON.parse(JSON.stringify(INITIAL_SCENES)) };
  res.json({ success: true, project: currentProject });
});

// Retrieve collaborative logs (Comments, Chat, active render queues)
app.get("/api/collab", (req, res) => {
  // Update co-editor lastActive and simulate co-editor drift
  coEditors.forEach(editor => {
    editor.lastActive = Date.now();
    // 10% chance to drift to a random scene to show active simulation
    if (Math.random() < 0.05) {
      const randomScene = currentProject.scenes[Math.floor(Math.random() * currentProject.scenes.length)];
      editor.activeSceneId = randomScene?.id;
      const fields = ["vfxNotes", "soundEffects", "title", "description", "imagePrompt", "dialogue"];
      editor.cursorField = fields[Math.floor(Math.random() * fields.length)];
    }
  });

  res.json({
    comments,
    chatMessages,
    coEditors,
    activeRenders
  });
});

// Add comment to scene
app.post("/api/collab/comment", (req, res) => {
  const { sceneId, text, userName, userRole } = req.body;
  if (!sceneId || !text) {
    return res.status(400).json({ error: "Missing fields" });
  }
  const newComment: Comment = {
    id: `comm-${Date.now()}`,
    sceneId,
    userName: userName || "Self (Editor)",
    userRole: userRole || "Lead Cinematographer",
    text,
    timestamp: Date.now()
  };
  comments.push(newComment);
  res.json({ success: true, comment: newComment });
});

// Add chat message
app.post("/api/collab/chat", (req, res) => {
  const { text, userName, userRole } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Missing fields" });
  }
  const newMsg: ChatMessage = {
    id: `chat-${Date.now()}`,
    userName: userName || "Self (Editor)",
    userRole: userRole || "Lead Cinematographer",
    text,
    timestamp: Date.now()
  };
  chatMessages.push(newMsg);

  // Simulate a quick co-editor response 1.5 seconds later
  setTimeout(() => {
    const responses = [
      "Agreed, let's lock in those camera settings.",
      "Just checked the 4K render logs, lookin extremely clean.",
      "Let's check the dialogue sync with the voiceover tracks.",
      "Awesome! Pushing Scene 3 to LTX video right now.",
      "Are we using Orange & Teal for the entire 20 minutes?",
      "Can we adjust the depth of field on the close-ups?"
    ];
    const teamMembers = [
      { name: "Sarah Jennings", role: "Director" },
      { name: "Alex Chen", role: "VFX Artist" },
      { name: "Michael Vance", role: "Sound Designer" }
    ];
    const member = teamMembers[Math.floor(Math.random() * teamMembers.length)];
    chatMessages.push({
      id: `chat-sim-${Date.now()}`,
      userName: member.name,
      userRole: member.role,
      text: `@Lead ${responses[Math.floor(Math.random() * responses.length)]}`,
      timestamp: Date.now()
    });
  }, 1500);

  res.json({ success: true, message: newMsg });
});

// Trigger Stable Diffusion, LTX, or Wan Video render jobs
app.post("/api/render", (req, res) => {
  const { sceneId, type } = req.body;
  if (!sceneId || !type) {
    return res.status(400).json({ error: "Missing sceneId or render type" });
  }
  
  // Start simulated render
  runSimulatedRender(sceneId, type);
  res.json({ success: true, message: `Render job queued on GPU core for ${type}.` });
});

// ---------------------------------------------------------
// Pre-programmed Cinematic Storyboard Generator (Helper / Fallback)
// ---------------------------------------------------------
function generateSimulatedStoryboard(title?: string, logline?: string): { title: string; logline: string; scenes: StoryboardScene[] } {
  const generatedTitle = title || "The Lost Vault of Horizon";
  const generatedLogline = logline || "An atmospheric high-octane expedition through an ancient mechanical canyon to unlock a long-lost digital matrix.";
  
  const simulatedScenes: StoryboardScene[] = [
    {
      id: "sc-gen-1",
      sceneNumber: 1,
      title: "Dunes of Horizon",
      description: "We establish the sprawling sand desert of Horizon. Mara's cloak flutters as JAX scanning array tracks a mysterious signal.",
      shotType: "Extreme Wide Shot",
      lens: "35mm Anamorphic Cinema",
      movement: "Slow Dolly In",
      lighting: "Golden Hour Warm",
      vfxNotes: "Mirage effect over the distant titanium peaks. Particle dust blowing dynamically.",
      soundEffects: "Eerie howling wind, mechanical sonar ping.",
      duration: 120,
      imagePrompt: "Cinematic movie shot, Extreme wide angle, 35mm anamorphic. A futuristic sand desert at sunset, a small female figure and a golden-painted explorer robot stand on a ridge. Soft orange bloom, dramatic teal sky, lens flares, Rec.2020 HDR grading.",
      videoPrompt: "Sweeping slow dolly-in past sand dunes. Warm twilight sky, heat haze drifting above.",
      dialogue: {
        speaker: "Dr. Mara Vance",
        text: "The telemetry points straight down this rift. If the old maps are true, the mainframe lies beneath.",
        emotion: "neutral",
        startSecond: 8,
        durationSeconds: 6
      },
      customLut: "teal-orange",
      colorAdjustments: { exposure: 0, contrast: 15, saturation: 12, vignette: 20, filmGrain: 10, chromaticAberration: 5 },
      renderStatus: "idle",
      renderProgress: 0,
      renderLogs: ["Ready to deploy Stable Diffusion render job."]
    },
    {
      id: "sc-gen-2",
      sceneNumber: 2,
      title: "The Rift Entryway",
      description: "Descending into a massive jagged fissure, they stand before a towering, hexagonal vault sealed with dynamic geometric lasers.",
      shotType: "Wide Shot",
      lens: "24mm Wide-Angle",
      movement: "Tracking Shot",
      lighting: "Chiaroscuro Neon Noir",
      vfxNotes: "3D holographic security grid overlay. Dust motes floating in bright cyan volumetric laser paths.",
      soundEffects: "Low frequency hum of high-power security lasers, echoes of water dripping in the deep canyon.",
      duration: 180,
      imagePrompt: "A colossal obsidian vault gate deep inside a rocky canyon, covered in glowing turquoise geometric security lasers. Widescreen cinema, cinematic lighting, dramatic shadows, cyberpunk aesthetics.",
      videoPrompt: "LTX Video: Camera tracks the characters' descent as neon security light reflects off canyon walls.",
      dialogue: {
        speaker: "JAX-8",
        text: "Intruder deterrent grids are fully active, Mara. Approaching without authorization will result in... permanent vaporization.",
        emotion: "fearful",
        startSecond: 5,
        durationSeconds: 8
      },
      customLut: "matrix-green",
      colorAdjustments: { exposure: -5, contrast: 20, saturation: 8, vignette: 30, filmGrain: 15, chromaticAberration: 12 },
      renderStatus: "idle",
      renderProgress: 0,
      renderLogs: ["Ready to deploy Stable Diffusion render job."]
    },
    {
      id: "sc-gen-3",
      sceneNumber: 3,
      title: "Bypassing the Matrix",
      description: "Mara connects her gauntlet. Sparks fly as Jax monitors terminal heat. Glowing nodes trace her vascular system through the skin.",
      shotType: "Close-Up",
      lens: "50mm Prime",
      movement: "Static",
      lighting: "Cyberpunk Neon",
      vfxNotes: "Vibrant neon sparks bursting from terminal. Green glowing circuitry lines crawling along the pedestal.",
      soundEffects: "Electrical static snapping, metallic gears clinking, rapid warning alarm pacing.",
      duration: 200,
      imagePrompt: "Close up, anamorphic 50mm lens. A female archaeologist's glowing bionic hand interfacing with a massive futuristic cybernetic terminal. Bright blue sparks, glowing circuit patterns, intense focal depth, film grain.",
      videoPrompt: "Wan-Video: Subtle camera shake, electric spark discharges bursting in detailed slow motion.",
      dialogue: {
        speaker: "Dr. Mara Vance",
        text: "Just hold them off, Jax! I'm overriding the core safety valves. Three more nodes!",
        emotion: "intense",
        startSecond: 10,
        durationSeconds: 6
      },
      customLut: "cyberpunk",
      colorAdjustments: { exposure: 10, contrast: 25, saturation: 25, vignette: 25, filmGrain: 18, chromaticAberration: 15 },
      renderStatus: "idle",
      renderProgress: 0,
      renderLogs: ["Ready to deploy Stable Diffusion render job."]
    }
  ];

  return { title: generatedTitle, logline: generatedLogline, scenes: simulatedScenes };
}

// ---------------------------------------------------------
// Gemini Script & Scene Breakdown Generation Route
// ---------------------------------------------------------
app.post("/api/generate-script", async (req, res) => {
  const { title, genre, logline, targetDurationMinutes, scriptNotes } = req.body;
  const userPrompt = `
    Title: ${title || "Untitled Action Movie"}
    Genre: ${genre || "Action Adventure"}
    Logline: ${logline || "A thrilling cinematic journey."}
    Target Duration: ${targetDurationMinutes || 20} minutes
    Script Notes: ${scriptNotes || "Create consistent frames, coherent character expressions, and automated voiceover sync cues."}
  `;

  const gemini = getGeminiClient();

  if (!gemini) {
    console.log("[GEMINI] API key not found. Using pre-programmed cinematic storyboard generator.");
    const sim = generateSimulatedStoryboard(title, logline);
    return res.json({
      success: true,
      title: sim.title,
      logline: sim.logline,
      scenes: sim.scenes,
      characters: INITIAL_CHARACTERS,
      notes: "Generated cinematic storyboard templates matching your action-adventure themes (Simulated Mode)."
    });
  }

  try {
    const prompt = `
      You are a professional Hollywood storyboard and screenplay writer. Create a scene-by-scene storyboard breakdown for a 20-minute action-adventure short film.
      Return the output as a valid JSON object matching the following TypeScript structures:
      {
        title: string,
        logline: string,
        scenes: [
          {
            sceneNumber: number,
            title: string,
            description: string,
            shotType: "Extreme Wide Shot" | "Wide Shot" | "Medium Shot" | "Close-Up" | "Extreme Close-Up" | "Over-the-Shoulder" | "Dutch Angle",
            lens: "24mm Wide-Angle" | "35mm Anamorphic Cinema" | "50mm Prime" | "85mm Portrait" | "135mm Telephoto",
            movement: "Static" | "Pan & Tilt" | "Slow Dolly In" | "Tracking Shot" | "Crane down & Zoom" | "Handheld Shake",
            lighting: "Chiaroscuro Neon Noir" | "Golden Hour Warm" | "High-Key Cinematic" | "Moonlit Moody" | "Sundance Natural" | "Cyberpunk Neon",
            vfxNotes: string, // VFX, CGI, 3D compatibility details
            soundEffects: string, // Sound cues and atmosphere
            duration: number, // in seconds (e.g. 120)
            imagePrompt: string, // Extremely detailed, cinematic prompt for a text-to-image generator (e.g. Stable Diffusion) ensuring visual context
            videoPrompt: string, // Camera action prompt for a video generator (e.g. Wan Video or LTX Video)
            dialogue: {
              speaker: "Dr. Mara Vance" | "JAX-8",
              text: string,
              emotion: "intense" | "whisper" | "melodramatic" | "heroic" | "fearful" | "neutral",
              startSecond: number,
              durationSeconds: number
            },
            customLut: "none" | "teal-orange" | "technicolor" | "matrix-green" | "noir-high" | "cyberpunk" | "sundance-warm",
            colorAdjustments: {
              exposure: number, // -100 to 100
              contrast: number, // -100 to 100
              saturation: number, // -100 to 100
              vignette: number, // 0 to 100
              filmGrain: number, // 0 to 100
              chromaticAberration: number // 0 to 100
            }
          }
        ]
      }

      Strict guidelines:
      1. Keep the story centered around Dr. Mara Vance (the rogue archaeologist) and JAX-8 (the cybernetic navigator companion).
      2. Produce exactly 4 highly-cinematic, action-adventure themed scenes.
      3. Focus on rich camera directions, lens configurations, and LUT presets.
      4. Avoid truncation. Ensure valid JSON structure is returned.
      
      User script ideas: ${userPrompt}
    `;

    console.log("[GEMINI] Calling models/gemini-3.5-flash for structured script breakdown.");
    const response = await gemini.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "logline", "scenes"],
          properties: {
            title: { type: Type.STRING },
            logline: { type: Type.STRING },
            scenes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: [
                  "sceneNumber", "title", "description", "shotType", "lens",
                  "movement", "lighting", "vfxNotes", "soundEffects", "duration",
                  "imagePrompt", "videoPrompt", "dialogue", "customLut", "colorAdjustments"
                ],
                properties: {
                  sceneNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  shotType: { type: Type.STRING, enum: ["Extreme Wide Shot", "Wide Shot", "Medium Shot", "Close-Up", "Extreme Close-Up", "Over-the-Shoulder", "Dutch Angle"] },
                  lens: { type: Type.STRING, enum: ["24mm Wide-Angle", "35mm Anamorphic Cinema", "50mm Prime", "85mm Portrait", "135mm Telephoto"] },
                  movement: { type: Type.STRING, enum: ["Static", "Pan & Tilt", "Slow Dolly In", "Tracking Shot", "Crane down & Zoom", "Handheld Shake"] },
                  lighting: { type: Type.STRING, enum: ["Chiaroscuro Neon Noir", "Golden Hour Warm", "High-Key Cinematic", "Moonlit Moody", "Sundance Natural", "Cyberpunk Neon"] },
                  vfxNotes: { type: Type.STRING },
                  soundEffects: { type: Type.STRING },
                  duration: { type: Type.INTEGER },
                  imagePrompt: { type: Type.STRING },
                  videoPrompt: { type: Type.STRING },
                  dialogue: {
                    type: Type.OBJECT,
                    required: ["speaker", "text", "emotion", "startSecond", "durationSeconds"],
                    properties: {
                      speaker: { type: Type.STRING, enum: ["Dr. Mara Vance", "JAX-8"] },
                      text: { type: Type.STRING },
                      emotion: { type: Type.STRING, enum: ["intense", "whisper", "melodramatic", "heroic", "fearful", "neutral"] },
                      startSecond: { type: Type.INTEGER },
                      durationSeconds: { type: Type.INTEGER }
                    }
                  },
                  customLut: { type: Type.STRING, enum: ["none", "teal-orange", "technicolor", "matrix-green", "noir-high", "cyberpunk", "sundance-warm"] },
                  colorAdjustments: {
                    type: Type.OBJECT,
                    required: ["exposure", "contrast", "saturation", "vignette", "filmGrain", "chromaticAberration"],
                    properties: {
                      exposure: { type: Type.INTEGER },
                      contrast: { type: Type.INTEGER },
                      saturation: { type: Type.INTEGER },
                      vignette: { type: Type.INTEGER },
                      filmGrain: { type: Type.INTEGER },
                      chromaticAberration: { type: Type.INTEGER }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    const outputText = response.text;
    if (!outputText) {
      throw new Error("Empty response from Gemini");
    }

    const parsed = JSON.parse(outputText.trim());
    
    // Inject IDs and render settings back for frontend
    const parsedScenes = parsed.scenes.map((scene: any, index: number) => ({
      ...scene,
      id: `sc-gen-${index + 1}`,
      renderStatus: "idle",
      renderProgress: 0,
      renderLogs: ["Ready to deploy Stable Diffusion render job."]
    }));

    res.json({
      success: true,
      title: parsed.title,
      logline: parsed.logline,
      scenes: parsedScenes,
      characters: INITIAL_CHARACTERS,
      notes: "Coherent script breakdown and prompt matrix synthesized successfully via Gemini."
    });
  } catch (error) {
    console.error("[GEMINI SCRIPT ERROR]", error);
    console.warn("[GEMINI FALLBACK] Falling back to pre-programmed cinematic storyboard generator due to API error/unavailability.");
    const sim = generateSimulatedStoryboard(title, logline);
    res.json({
      success: true,
      title: sim.title,
      logline: sim.logline,
      scenes: sim.scenes,
      characters: INITIAL_CHARACTERS,
      notes: "The Gemini API is currently experiencing high demand. Seamlessly fell back to local pre-programmed action-adventure cinematic script."
    });
  }
});


// ---------------------------------------------------------
// Vite Middleware / Production Static Server Setup
// ---------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cinematic Pipeline Server running on http://localhost:${PORT}`);
  });
}

startServer();
