// File: api/hello.js
export default function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  return res.status(200).json({ ok: true, msg: "hello from vercel" });
}