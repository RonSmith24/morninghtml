import express from "express";

const app = express();
app.use(express.json());

app.post("/generate", (req, res) => {
  console.log("Ada request masuk!");

  res.json({
    video: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4"
  });
});

app.listen(3000, () => {
  console.log("Server jalan di http://localhost:3000");
});
