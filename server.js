import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as ai from "./lib/ai.js";
import { SIGNALS, TOUCH, COMPLIMENTS, TEST_QUESTIONS, PILLARS, LESSONS, NOTICED, SCENARIOS } from "./lib/knowledge.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.disable("x-powered-by");
app.use(express.json({ limit: "64kb" }));
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});

const text = (v, max = 4000) => (typeof v === "string" ? v.trim().slice(0, max) : "");

app.get("/api/health", (req, res) => res.json({ ok: true, ai: ai.aiEnabled }));

app.get("/api/knowledge", (req, res) => {
  res.json({
    pillars: PILLARS,
    signals: SIGNALS.map(({ keywords, ...s }) => s),
    touch: TOUCH,
    compliments: COMPLIMENTS,
    testQuestions: TEST_QUESTIONS,
    noticed: NOTICED,
    lessons: LESSONS,
    scenarios: SCENARIOS.map(({ context, ...s }) => s),
    ai: ai.aiEnabled,
  });
});

app.post("/api/decode", async (req, res) => {
  const input = text(req.body?.text);
  if (input.length < 8) return res.status(400).json({ error: "Beschrijf iets uitgebreider wat ze deed of zei." });
  try {
    res.json(await ai.decode(input));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "De decoder is even uit de lucht." });
  }
});

app.post("/api/reframe", async (req, res) => {
  const input = text(req.body?.text);
  if (input.length < 3) return res.status(400).json({ error: "Plak eerst je bericht." });
  try {
    res.json(await ai.reframe(input));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "De reframer is even uit de lucht." });
  }
});

app.post("/api/simulate", async (req, res) => {
  const scenarioId = text(req.body?.scenarioId, 40);
  const message = text(req.body?.message, 1500);
  const history = Array.isArray(req.body?.history)
    ? req.body.history.slice(-16).map((h) => ({ role: h.role === "user" ? "user" : "assistant", content: text(h.content, 1500) }))
    : [];
  if (!message) return res.status(400).json({ error: "Typ eerst een bericht." });
  try {
    res.json(await ai.simulate({ scenarioId, history, message }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "De simulator is even uit de lucht." });
  }
});

app.use(express.static(path.join(here, "public"), { maxAge: process.env.NODE_ENV === "production" ? "1h" : 0, etag: true, extensions: ["html"] }));
app.get("*", (req, res) => res.sendFile(path.join(here, "public", "index.html")));

app.listen(PORT, () => {
  console.log(`The Captain draait op poort ${PORT} (AI: ${ai.aiEnabled ? "Claude " + (process.env.CAPTAIN_MODEL || "claude-opus-5") : "offline engine"})`);
});
