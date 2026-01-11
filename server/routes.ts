import type { Express } from "express";
import { createServer, type Server } from "node:http";
function applyTtsCors(req: any, res: any) {
  const origin = req.headers.origin as string | undefined;

  // Allow local dev + capacitor/ionic + replit
  const allowed =
    !origin ||
    origin === "http://localhost" ||
    origin === "https://localhost" ||
    origin.startsWith("http://localhost:") ||
    origin.startsWith("https://localhost:") ||
    origin === "capacitor://localhost" ||
    origin === "ionic://localhost" ||
    (origin.startsWith("https://") && (origin.includes(".replit.app") || origin.includes(".replit.dev")));

  if (origin && allowed) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  } else {
    // safe fallback (no credentials involved)
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    req.headers["access-control-request-headers"] || "content-type"
  );
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.options("/api/tts", (req, res) => {
  applyTtsCors(req, res);
  return res.status(204).end();
});

  app.post("/api/tts", async (req, res) => {
    applyTtsCors(req, res);

    const apiKey = process.env.ELEVENLABS_API_KEY;
    console.log("ELEVEN KEY PRESENT:", !!process.env.ELEVENLABS_API_KEY);

    if (!apiKey) {
      return res.status(500).json({ error: "Eleven Labs API key not configured" });
    }

    const { text, voiceId, voiceSettings } = req.body;

    if (!text || !voiceId) {
      return res.status(400).json({ error: "Missing required fields: text, voiceId" });
    }

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: voiceSettings || {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Eleven Labs API error:", errorText);
        return res.status(response.status).json({ error: "Failed to generate speech" });
      }

      const audioBuffer = await response.arrayBuffer();
      res.set("Content-Type", "audio/mpeg");
      res.send(Buffer.from(audioBuffer));
    } catch (error) {
      console.error("TTS error:", error);
      res.status(500).json({ error: "Failed to generate speech" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
