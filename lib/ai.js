// AI-laag: gebruikt Claude als er een sleutel is, anders de offline engine.
import Anthropic from "@anthropic-ai/sdk";
import * as engine from "./engine.js";
import { SIGNALS, PILLARS, TEST_QUESTIONS, COMPLIMENTS, NOTICED, SCENARIOS } from "./knowledge.js";

const MODEL = process.env.CAPTAIN_MODEL || "claude-opus-5";
const hasCredentials = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
const client = hasCredentials ? new Anthropic() : null;

export const aiEnabled = hasCredentials;

const COACH_CORE = `Je bent De Kapitein: een kalme, directe relatiecoach voor mannen. Nederlands, korte zinnen, geen therapietaal, geen pick-up-trucs, geen manipulatie. Je coacht mannen om op hun eigen as te staan.

Pijlers:
${PILLARS.map((p) => `- ${p.title}: ${p.short} ${p.body}`).join("\n")}

De zes onbewuste signalen van aantrekking:
${SIGNALS.map((s) => `- ${s.id} (${s.name}): ${s.body}`).join("\n")}

Testvragen van de volwassen vrouw en ideale antwoorden:
${TEST_QUESTIONS.map((t) => `- "${t.q}" -> ${t.test} Ideaal: "${t.answer}"`).join("\n")}

Taal van mysterie: ${NOTICED.body}
Krachtige observaties (gebruik spaarzaam): ${COMPLIMENTS.map((c) => `"${c.text}"`).join(" | ")}

Grenzen: respect en wederkerigheid zijn niet onderhandelbaar. Als iets wijst op een duidelijke nee, benoem dat eerlijk en adviseer terugtrekken. Nooit adviseren om grenzen te negeren.`;

async function askJSON(system, user, maxTokens = 1800) {
  const params = {
    model: MODEL,
    max_tokens: maxTokens,
    system: `${COACH_CORE}\n\nAntwoord uitsluitend met geldige JSON, zonder markdown of uitleg eromheen.\n\n${system}`,
    messages: [{ role: "user", content: user }],
  };
  let response;
  try {
    response = await client.beta.messages.create({
      ...params,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
    });
  } catch (err) {
    if (err?.status === 400) response = await client.messages.create(params);
    else throw err;
  }
  if (response.stop_reason === "refusal") throw new Error("refusal");
  const text = response.content.filter((b) => b.type === "text").map((b) => b.text).join("");
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end < 0) throw new Error("no json");
  return JSON.parse(text.slice(start, end + 1));
}

export async function decode(text) {
  const base = engine.decode(text);
  if (!client) return base;
  try {
    const out = await askJSON(
      `Analyseer wat de gebruiker beschrijft over wat een vrouw deed of zei. Geef JSON:
{"comfort": 0-100 (hoe veilig/open haar zenuwstelsel lijkt), "state": "sympathisch"|"overgang"|"parasympathisch", "stateLabel": korte NL beschrijving,
 "signals": [{"id": een van ${SIGNALS.map((s) => s.id).join("/")}, "score": 0-100, "evidence": citaat of null}] (alle zes),
 "negatives": [{"label": korte NL tekst}], "interpretation": 2-4 zinnen NL, "move": 1-2 zinnen concrete kapiteinszet, beginnend met "Kapiteinszet:"}`,
      text,
    );
    const signals = SIGNALS.map((s) => {
      const found = (out.signals || []).find((x) => x.id === s.id) || {};
      return { id: s.id, name: s.name, subtitle: s.subtitle, body: s.body, score: Math.max(0, Math.min(100, Number(found.score) || 0)), evidence: found.evidence || null };
    });
    return { ...base, ...out, signals, source: "claude" };
  } catch (err) {
    console.warn("[ai.decode] fallback:", err.message);
    return base;
  }
}

export async function reframe(text) {
  const base = engine.reframe(text);
  if (!client) return base;
  try {
    const out = await askJSON(
      `De gebruiker plakt een bericht dat hij wil sturen aan een vrouw. Herschrijf het naar een kort, rustig, drukvrij bericht. Geef JSON:
{"pressure": 0-100 (hoeveel onrust/druk het origineel uitstraalt), "diagnosis": [{"label": kort NL, "detail": 1 zin NL}],
 "reframed": het nieuwe bericht (max 25 woorden, geen uitleg, geen hoop, geen sorry; lege string als niets sturen beter is),
 "style": "Voorstel"|"Stilte"|"Lichte terugverwijzing"|"Kern behouden", "notes": [1-2 korte NL zinnen waarom dit werkt],
 "groundedExit": {"text": korte NL tekst voor de optie niets sturen, "why": 1-2 zinnen}}`,
      text,
    );
    const pressure = Math.max(0, Math.min(100, Number(out.pressure) || base.pressure));
    return { ...base, ...out, pressure, frame: 100 - pressure, source: "claude" };
  } catch (err) {
    console.warn("[ai.reframe] fallback:", err.message);
    return base;
  }
}

export async function simulate({ scenarioId, history, message }) {
  const base = engine.simulate({ scenarioId, history, message });
  if (!client) return base;
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];
  try {
    const transcript = [...history, { role: "user", content: message }]
      .map((h) => `${h.role === "user" ? "HIJ" : scenario.persona.toUpperCase()}: ${h.content}`)
      .join("\n");
    const out = await askJSON(
      `Je speelt ${scenario.persona} in een rollenspel. Context: ${scenario.context}
Reageer als ${scenario.persona} op zijn laatste bericht: realistisch, menselijk, 1-3 zinnen, informeel Nederlands. Warmer als hij rustig en gegrond is, koeler of afstandelijker als hij duwt, uitlegt, smeekt of overtuigt.
Beoordeel daarnaast als De Kapitein zijn laatste bericht. Geef JSON:
{"reply": tekst van ${scenario.persona}, "analytics": {"frame": 0-100, "anxiety": "Laag / veilig"|"Verhoogd"|"Hoog", "flags": [korte NL labels]}, "note": 1-2 zinnen coachnotitie, direct en concreet}`,
      transcript,
    );
    return { ...base, ...out, persona: scenario.persona, source: "claude" };
  } catch (err) {
    console.warn("[ai.simulate] fallback:", err.message);
    return base;
  }
}
