import express from "express";
import fetch from "node-fetch";
import fs from "fs";
import { exec } from "child_process";

const app = express();
app.use(express.json());
app.use(express.static("."));

const OPENAI_API = "YOUR_OPENAI_API_KEY";
const PEXELS_API = "YOUR_PEXELS_API_KEY";

app.post("/generate", async (req, res) => {
  const { prompt, style, duration } = req.body;

  // 1. Generate Script
  const scriptRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENAI_API}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {role: "user", content: `Buat script video ${style} durasi ${duration} detik: ${prompt}`}
      ]
    })
  });

  const scriptData = await scriptRes.json();
  const script = scriptData.choices[0].message.content;

  fs.writeFileSync("script.txt", script);

  // 2. Get Video dari Pexels
  const vidRes = await fetch(`https://api.pexels.com/videos/search?query=motivasi&per_page=1`, {
    headers: { Authorization: PEXELS_API }
  });

  const vidData = await vidRes.json();
  const videoUrl = vidData.videos[0].video_files[0].link;

  // Download video
  const videoBuffer = await fetch(videoUrl).then(r => r.arrayBuffer());
  fs.writeFileSync("video.mp4", Buffer.from(videoBuffer));

  // 3. Generate Voice (dummy dulu)
  fs.writeFileSync("voice.mp3", "");

  // 4. Render pakai FFmpeg
  exec(`ffmpeg -i video.mp4 -c:v copy -c:a aac output.mp4`, (err) => {
    if (err) return res.send("Error rendering");

    res.json({ video: "/output.mp4" });
  });
});

app.listen(3000, () => console.log("Server jalan di http://localhost:3000"));