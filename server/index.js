import express from "express";

const app = express();

// Browser sends raw SDP in the body
app.use(express.text({ type: ["application/sdp", "text/plain"] }));

// Serve the client (static)
app.use(express.static("public", { extensions: ["html"] }));

// Realtime session configuration.
// We keep it transcription-oriented; session schema may evolve, so adjust here if needed.
const sessionConfig = JSON.stringify({
  type: "transcription",
  model: "gpt-realtime",
  input_audio_format: "pcm16",
  input_audio_transcription: { model: "gpt-4o-transcribe", language: "" },
  turn_detection: { type: "server_vad", threshold: 0.5, prefix_padding_ms: 250, silence_duration_ms: 450 }
});

// Create a Realtime API call (WebRTC) and return SDP answer to the browser.
// Docs: POST https://api.openai.com/v1/realtime/calls with multipart form containing sdp + session config.
app.post("/session", async (req, res) => {
  try {
    const fd = new FormData();
    fd.set("sdp", req.body);
    fd.set("session", sessionConfig);

    const r = await fetch("https://api.openai.com/v1/realtime/calls", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: fd
    });

    const text = await r.text();
    if (!r.ok) {
      console.error("OpenAI error:", r.status, text);
      return res.status(500).send(text);
    }
    res.type("application/sdp").send(text);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create session" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server on http://localhost:${port}`));
