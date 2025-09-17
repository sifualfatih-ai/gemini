// File: api/generate.js
// Pintu rahasia (backend) untuk memanggil Gemini. API Key disimpan di Vercel (ENV).

export default async function handler(req, res) {
  // CORS preflight (agar boleh diakses dari GitHub Pages)
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Gunakan metode POST" });
  }

  try {
    // Ambil body JSON { prompt: "..." }
    let body = req.body;
    if (!body || typeof body !== "object") {
      body = await new Promise((resolve) => {
        let raw = "";
        req.on("data", (c) => (raw += c));
        req.on("end", () => resolve(JSON.parse(raw || "{}")));
      });
    }
    const prompt = body?.prompt || "Halo Gemini";

    // Panggil API Gemini (kunci diambil dari variabel ENV di Vercel)
    const r = await fetch(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
        process.env.GEMINI_API_KEY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }]}],
        }),
      }
    );

    const json = await r.json();

    // Ambil teks jawaban pertama
    const text =
      json?.candidates?.[0]?.content?.parts
        ?.map((p) => p.text)
        ?.filter(Boolean)
        ?.join("\n") ??
      "Tidak ada teks. Respon mentah:\n" + JSON.stringify(json, null, 2);

    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
}