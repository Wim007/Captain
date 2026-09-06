// Offline coaching-engine. Werkt zonder API-sleutel en dient als fallback.
import { SIGNALS, NEGATIVE_MARKERS, ANXIETY_MARKERS, SCENARIOS, TEST_QUESTIONS } from "./knowledge.js";

const clamp = (n, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, Math.round(n)));

function findEvidence(text, keyword) {
  const idx = text.toLowerCase().indexOf(keyword.toLowerCase());
  if (idx < 0) return null;
  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + keyword.length + 40);
  return (start > 0 ? "…" : "") + text.slice(start, end).trim() + (end < text.length ? "…" : "");
}

// ---------- 1. SIGNAL DECODER ----------
export function decode(text) {
  const t = ` ${text.toLowerCase()} `;
  const signals = SIGNALS.map((s) => {
    const hits = s.keywords.filter((k) => t.includes(k.toLowerCase()));
    const score = hits.length === 0 ? 0 : clamp(38 + hits.length * 14, 0, 94);
    return {
      id: s.id,
      name: s.name,
      subtitle: s.subtitle,
      score,
      evidence: hits.length ? findEvidence(text, hits[0]) : null,
      body: s.body,
    };
  });

  const negatives = NEGATIVE_MARKERS.filter((m) => m.re.test(text)).map((m) => ({ label: m.label, weight: m.weight }));
  const active = signals.filter((s) => s.score > 0);
  const positive = active.reduce((a, s) => a + s.score * 0.3, 0);
  const negative = negatives.reduce((a, n) => a + n.weight, 0);
  const comfort = clamp(34 + positive - negative, 5, 96);

  let state, stateLabel;
  if (comfort >= 70) { state = "parasympathisch"; stateLabel = "Rust en verbinding"; }
  else if (comfort >= 45) { state = "overgang"; stateLabel = "Aftastend, open"; }
  else { state = "sympathisch"; stateLabel = "Op afstand, alert"; }

  const strongest = [...active].sort((a, b) => b.score - a.score)[0];

  let interpretation;
  if (active.length === 0 && negatives.length === 0) {
    interpretation = "Ik zie nog geen van de zes signalen in wat je beschrijft. Dat is geen slecht nieuws: het is vooral te weinig informatie. Let de volgende keer op aanraking, wij-taal en of ze momenten met jou alleen opzoekt.";
  } else if (active.length >= 3) {
    interpretation = `Meerdere signalen tegelijk (${active.map((s) => s.name.toLowerCase()).join(", ")}). Haar zenuwstelsel staat open. Dit is het moment om rustig te blijven en niets te forceren.`;
  } else if (strongest) {
    interpretation = `Het sterkste signaal is ${strongest.name.toLowerCase()}. ${strongest.body}`;
  } else {
    interpretation = "Ik zie vooral afstand in wat je beschrijft. Dat kan tijdelijk zijn (drukte, stemming) of structureel. Jouw taak verandert niet: ruimte geven en je eigen leven leiden.";
  }
  if (negatives.length && active.length) {
    interpretation += ` Tegelijk zie ik ${negatives.map((n) => n.label.toLowerCase()).join(" en ")}. Gemengde signalen betekenen: niet duwen, wel aanwezig blijven.`;
  }

  let move;
  if (comfort >= 70) move = "Kapiteinszet: stel één concreet voorstel voor (dag, tijd, plek) en laat het daarna los. Geen opvolgbericht.";
  else if (comfort >= 45) move = "Kapiteinszet: beloon openheid met openheid. Deel zelf iets kleins en persoonlijks, en laat dan stilte vallen.";
  else move = "Kapiteinszet: geen actie. Trek je rustig terug, investeer in je eigen week. Contrast doet nu meer dan contact.";

  return {
    source: "engine",
    comfort,
    state,
    stateLabel,
    signals,
    negatives,
    interpretation,
    move,
  };
}

// ---------- 2. REFRAMER ----------
const PROPOSAL_WORDS = [
  ["koffie", "Koffie"], ["drankje", "Een drankje"], ["drinken", "Wat drinken"], ["biertje", "Een biertje"], ["cocktail", "Cocktails"], ["borrel", "Een borrel"], ["wijn", "Wijn"], ["eten", "Eten"], ["dineren", "Eten"],
  ["wandelen", "Wandelen"], ["wandeling", "Wandelen"], ["film", "Film"], ["bioscoop", "Film"], ["museum", "Museum"], ["strand", "Strand"],
  ["afspreken", "Afspreken"], ["zien", "Elkaar zien"], ["bellen", "Bellen"], ["lunch", "Lunch"], ["concert", "Concert"], ["terras", "Terras"],
];
const DAYS = ["maandag", "dinsdag", "woensdag", "donderdag", "vrijdag", "zaterdag", "zondag", "weekend", "morgen", "vanavond", "vrijdagavond", "zaterdagavond"];

export function reframe(text) {
  const raw = text.trim();
  const words = raw.split(/\s+/).filter(Boolean).length;
  const diagnosis = [];
  let pressure = 0;

  for (const m of ANXIETY_MARKERS) {
    const matches = raw.match(m.re);
    const count = matches ? matches.length : 0;
    const min = m.min || 1;
    if (count >= min) {
      const w = m.weight * Math.min(count, 3);
      pressure += w;
      diagnosis.push({ label: m.label, detail: m.detail, count });
    }
  }
  if (words > 60) { pressure += 18; diagnosis.push({ label: "Te lang", detail: `${words} woorden. Een bericht dat langer is dan wat zij stuurde, voelt als investering die zij moet terugbetalen.`, count: 1 }); }
  else if (words > 35) { pressure += 8; diagnosis.push({ label: "Aan de lange kant", detail: `${words} woorden. Korter leest zelfverzekerder.`, count: 1 }); }

  pressure = clamp(pressure);
  const frame = 100 - pressure;

  const lower = raw.toLowerCase();
  const proposal = PROPOSAL_WORDS.find(([k]) => new RegExp(`\\b${k}`, "i").test(lower));
  const day = DAYS.find((d) => lower.includes(d));
  const timeMatch = raw.match(/\b([01]?\d|2[0-3])[:.u]([0-5]\d)?\b/);
  const time = timeMatch ? timeMatch[0].replace(".", ":").replace(/u$/, ":00") : null;

  const chasing = /nog steeds|alweer|je reageert niet|gezien\?|heb je mijn bericht/i.test(raw);

  let reframed;
  let style;
  if (chasing) {
    reframed = "";
    style = "Stilte";
  } else if (proposal) {
    const when = day ? day.charAt(0).toUpperCase() + day.slice(1) : "Donderdag";
    const at = time ? ` ${time}` : "";
    const what = proposal[1].toLowerCase();
    reframed = `${when}${at}, ${what}? Ik weet een goede plek.`;
    style = "Voorstel";
  } else if (/mis je|denk aan je|verliefd/i.test(raw)) {
    reframed = "Dacht net aan dat verhaal van je over [onderwerp]. Nog steeds de beste anekdote van de week.";
    style = "Lichte terugverwijzing";
  } else {
    const sentences = raw.split(/(?<=[.!?])\s+/).filter((s) => s.trim().length > 0);
    const clean = sentences.filter((s) => !ANXIETY_MARKERS.some((m) => new RegExp(m.re.source, "i").test(s)));
    const core = (clean[0] || sentences[0] || raw).replace(/\s+/g, " ").trim();
    reframed = core.length > 90 ? core.slice(0, 87).replace(/[,;:\s]+\S*$/, "") + "." : core;
    style = "Kern behouden";
  }

  const groundedExit = {
    text: style === "Stilte" ? "Niets sturen." : "Niets sturen. Je vorige bericht staat nog.",
    why: style === "Stilte"
      ? "Ze heeft je bericht gezien. Een tweede bericht neemt haar de kans af om zelf te komen. Stilte is nu het sterkste signaal dat je hebt."
      : "Een bericht dat je niet hoeft te sturen, is vaak het beste bericht. Vraag jezelf af: stuur ik dit vanuit rust of vanuit onrust?",
  };

  const notes = [];
  if (style === "Voorstel") notes.push("Eén concreet voorstel. Dag, plek, klaar. Geen uitleg waarom, geen uitweg voor haar ingebouwd.");
  if (style === "Stilte") notes.push("Er is hier geen betere versie van dit bericht. De beste versie is geen bericht.");
  if (style === "Lichte terugverwijzing") notes.push("Je laat zien dat je haar onthoudt, zonder gevoelens op tafel te leggen die nog geen wederkerigheid hebben.");
  if (style === "Kern behouden") notes.push("Ik heb de zinnen weggehaald die om begrip of geruststelling vragen. Wat overblijft is wat je eigenlijk wilde zeggen.");
  if (diagnosis.length === 0) notes.push("Dit bericht is al behoorlijk gegrond. Kleine verbetering: korter is bijna altijd beter.");

  return {
    source: "engine",
    pressure,
    frame,
    words,
    diagnosis,
    reframed,
    style,
    notes,
    groundedExit,
  };
}

// ---------- 3. SIMULATOR ----------
function scoreUserTurn(msg) {
  let penalty = 0;
  const flags = [];
  for (const m of ANXIETY_MARKERS) {
    const matches = msg.match(m.re);
    const count = matches ? matches.length : 0;
    if (count >= (m.min || 1)) { penalty += m.weight * Math.min(count, 2); flags.push(m.label); }
  }
  const words = msg.split(/\s+/).filter(Boolean).length;
  if (words > 45) { penalty += 15; flags.push("Te lang"); }
  if (words <= 12 && penalty === 0) penalty -= 5;
  // grounded markers
  if (/\b(dinsdag|woensdag|donderdag|vrijdag|zaterdag|zondag|\d{1,2}[:.u]\d{0,2})\b/i.test(msg)) penalty -= 6;
  if (/ik geniet van mijn ruimte|goed gezelschap|met intentie|sterker hoofdstuk|juiste mensen/i.test(msg)) penalty -= 12;
  if (/prima|helemaal goed|geen probleem|neem je tijd|alle ruimte|doe rustig/i.test(msg) && !/maar/i.test(msg)) penalty -= 6;
  const frame = clamp(88 - penalty, 10, 99);
  const anxiety = frame >= 75 ? "Laag / veilig" : frame >= 50 ? "Verhoogd" : "Hoog";
  return { frame, anxiety, flags: [...new Set(flags)], words };
}

const REPLIES = {
  cold: {
    high: ["Haha oké, dat klinkt goed. Donderdag zou ik eventueel wel kunnen.", "Je bent lekker rustig, dat had ik niet verwacht. Vertel, wat ga je dit weekend doen?", "Oké dat vind ik wel leuk. Waar dan?"],
    mid: ["Ja, misschien. Ik kijk even hoe m'n week loopt.", "Hmm, ik zie het wel. Ben nog wat moe van alles.", "Kan zijn. Ik laat het je weten."],
    low: ["Ja... ik voel een beetje druk nu eerlijk gezegd.", "Het is gewoon druk, ik zei het toch?", "Ik ga even niet reageren hierop, sorry."],
  },
  hesitation: {
    high: ["Oké. Dat je dat zo rustig zegt maakt het eigenlijk makkelijker. Zaterdag dan?", "Fijn dat je me niet probeert te overtuigen. Dat zegt best veel.", "Hm. Je bent anders dan ik dacht. Op een goede manier."],
    mid: ["Ja, ik snap dat. Ik weet het gewoon nog niet.", "Misschien over een paar weken? Ik moet het even voelen.", "Ik hoor je. Laat me er even over nadenken."],
    low: ["Zie je, dit is precies wat ik bedoel met snel.", "Ik voel me een beetje in een hoek gedrukt zo.", "Kunnen we het even laten rusten?"],
  },
  test: {
    high: ["Dat is een mooi antwoord. De meeste mannen beginnen dan over hun werk.", "'Met de juiste mensen.' Ik onthoud dat. En wat is voor jou de juiste?", "Ik vind het knap als iemand zo zonder omwegen praat. Ben je veel alleen?"],
    mid: ["Hm, oké. Dat klinkt een beetje als een standaardantwoord, eerlijk gezegd.", "Ja... en wat betekent dat concreet?", "Interessant. Maar ik vroeg wat jíj zoekt."],
    low: ["Dat is heel veel uitleg voor een simpele vraag.", "Oké. Je hoeft je niet te verdedigen hoor.", "Ik denk dat je zelf ook nog niet weet wat je zoekt."],
  },
  firstdate: {
    high: ["Goed gezelschap. Ik mag hopen dat ik daaronder val.", "Ik zag dat je iets anders keek toen je dat zei. Vertel eens meer.", "Ik heb dat vroeger ook gehad. Mijn vader was er nooit, ik heb geleerd mezelf te vermaken. Weinig mensen weten dat."],
    mid: ["Hmm, oké. Nog een glas dan?", "Je ontwijkt de vraag een beetje. Maar goed.", "Ja, zo ken ik er meer."],
    low: ["Wow, oké, dat was eerlijk. Ietsje te veel misschien.", "Je hoeft me niet te overtuigen dat je leuk bent.", "Zullen we het over iets anders hebben?"],
  },
};

const COACH_NOTES = {
  high: ["Dit is het. Kort, rustig, richting. Laat haar nu komen.", "Je gaf ruimte zonder je terug te trekken. Dat is precies het verschil.", "Goed. Geen uitleg, geen hoop, gewoon een man die weet wat hij wil."],
  mid: ["Bijna. Haal één zin weg en je bent er.", "Je twijfel zit in je woorden. Kies: stel voor, of zwijg.", "Je bent aan het uitleggen. Zij vroeg niet om uitleg."],
  low: ["Dit is campagne voeren. Stop. Adem. Wat zou je zeggen als je haar niet nodig had?", "Je vecht voor een uitkomst. Een kapitein stelt koers in en laat de wind zijn werk doen.", "Lees je bericht nog eens. Het vraagt om geruststelling. Die krijg je niet door erom te vragen."],
};

function pick(arr, seed) { return arr[seed % arr.length]; }

export function simulate({ scenarioId, history = [], message }) {
  const scenario = SCENARIOS.find((s) => s.id === scenarioId) || SCENARIOS[0];
  const turn = history.filter((h) => h.role === "user").length;
  const score = scoreUserTurn(message || "");
  const band = score.frame >= 75 ? "high" : score.frame >= 50 ? "mid" : "low";
  let reply = pick(REPLIES[scenario.id][band], turn);
  if (scenario.id === "test" && band === "high" && turn >= 1 && /alleen/i.test(reply)) {
    reply = "Dat is een mooi antwoord. De meeste mannen beginnen dan over hun werk.";
  }
  const note = pick(COACH_NOTES[band], turn + score.words);
  const tip = band !== "high" && scenario.id === "test" ? `Voorbeeld: "${TEST_QUESTIONS[1].answer}"` : null;
  return {
    source: "engine",
    persona: scenario.persona,
    reply,
    analytics: { frame: score.frame, anxiety: score.anxiety, flags: score.flags },
    note: tip ? `${note} ${tip}` : note,
  };
}
