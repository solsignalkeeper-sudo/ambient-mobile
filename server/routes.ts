import type { Express } from "express";
import { createServer, type Server } from "node:http";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/_ping", (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.json({ ok: true, ts: Date.now(), cors: "v4-fixed" });
  });

  // SAFE env debug (does not leak key)
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

  app.post("/api/tts", async (req, res) => {
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      return res
        .status(500)
        .json({ error: "Eleven Labs API key not configured" });
    }

    const body = (req as any).body || {};
    const text = body.text;
    const voiceId = body.voiceId;
    const voiceSettings = body.voiceSettings;

    if (!text || !voiceId) {
      return res
        .status(400)
        .json({ error: "Missing required fields: text, voiceId" });
    }

    try {
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "xi-api-key": apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: "eleven_turbo_v2_5",
            voice_settings:
              voiceSettings || {
                stability: 0.5,
                similarity_boost: 0.75,
              },
          }),
        }
      );

      if (!response.ok) {
        const ct = response.headers.get("content-type") || "";
        const errorText = await response.text();

        console.error("[tts] ElevenLabs upstream error", {
          status: response.status,
          contentType: ct,
          body: errorText?.slice(0, 1200),
        });

        // Return upstream error so curl shows the real reason in Render
        return res.status(response.status).json({
          error: "elevenlabs_failed",
          upstreamStatus: response.status,
          upstreamContentType: ct,
          upstreamBody: errorText?.slice(0, 1200),
        });
      }

      const audioBuffer = await response.arrayBuffer();
      res.set("Content-Type", "audio/mpeg");
      res.send(Buffer.from(audioBuffer));
    } catch (error: any) {
      console.error("[tts] Server error:", error?.message || error);
      res.status(500).json({
        error: "tts_server_error",
        message: error?.message || String(error),
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
