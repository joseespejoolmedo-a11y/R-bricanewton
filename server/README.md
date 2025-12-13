# Live TV Subtitles (iPad-friendly)

This project is a **low-latency live subtitles** web app (PWA) + a tiny Node server that connects to OpenAI Realtime (WebRTC).

## What you need
- An **OpenAI API key** (kept on the server as `OPENAI_API_KEY`).
- A place to run the **server** (any Node hosting). If you only have an iPad, you can deploy it on a cloud host.

## How it works (high level)
- The iPad opens the web app.
- The web app captures microphone audio and starts a WebRTC session by POSTing SDP to `/session`.
- The server forwards that SDP to OpenAI Realtime `/v1/realtime/calls` and returns the SDP answer.

## Quick local run (Mac/PC)
1) Install Node 18+
2) In `server/`:
   - `npm install`
   - `OPENAI_API_KEY=YOUR_KEY npm start`
3) Open: http://localhost:3000 on the same network device.

## iPad-only deployment idea
- Deploy `server/` to a Node hosting provider and set env var `OPENAI_API_KEY`.
- Then open the hosted URL in Safari and tap **Share → Add to Home Screen**.

## Notes
- Speaker labels are **best-effort** and may be absent depending on API event shape.
- Latency tuning: use the Fast / Balanced / Accurate selector.
