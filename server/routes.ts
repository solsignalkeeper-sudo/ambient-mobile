import type { Express } from "express";
import { createServer, type Server } from "node:http";

export async function registerRoutes(app: Express): Promise<Server> {
    app.get("/api/_env", (_req, res) => {
  const k = process.env.ELEVENLABS_API_KEY || "";
  res.setHeader("Cache-Control", "no-store");
  res.json({
    hasKey: !!k,
    prefix: k.slice(0, 3),
    len: k.length,
    nodeEnv: process.env.NODE_ENV || "",
  });
});

  app.get("/api/_env", (_req, res) => {
    const k = process.env.ELEVENLABS_API_KEY || "";
    res.setHeader("Cache-Control", "no-store");
    res.json({
      hasKey: !!k,
      prefix: k.slice(0, 3),
      len: k.length,
      nodeEnv: process.env.NODE_ENV || "",
    });
  });
  
  // SAFE env debug (does not leak key)
  app.get("/api/_env", (_req, res) => {
    const k = process.env.ELEVENLABS_API_KEY || "";
    res.json({
      hasKey: !!k,
      prefix: k.slice(0, 3),
      len: k.length,
      nodeEnv: process.env.NODE_ENV || "",
    });
  });

  app.post("/api/tts", async (req, res) => {
    const apiKey = process.env.ELEVENLABS_API_KEY;

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
