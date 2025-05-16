# IP Camera Dashboard

Stream multiple RTSP IP cameras to the web using FFmpeg and HLS.

## Setup

1. Copy `.env.example` to `.env` and set `ADMIN_PASSWORD`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   node server.js
   ```

## Deployment

- Deploy to [Render](https://render.com)
- Use `node server.js` as your start command
- Add `ADMIN_PASSWORD` as an environment variable