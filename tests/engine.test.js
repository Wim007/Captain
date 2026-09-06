import { test } from "node:test";
import assert from "node:assert/strict";
import { decode, reframe, simulate } from "../lib/engine.js";

test("decode herkent meerdere signalen en een open zenuwstelsel", () => {
  const r = decode("Ze bleef langer en liep mee naar mijn fiets. Ze raakte mijn onderarm aan en zei: we moeten dat restaurant eens proberen.");
  const active = r.signals.filter((s) => s.score > 0).map((s) => s.id);
  assert.ok(active.includes("touch"));
  assert.ok(active.includes("oneonone"));
  assert.ok(active.includes("we"));
  assert.ok(r.comfort >= 70, `comfort was ${r.comfort}`);
  assert.equal(r.state, "parasympathisch");
});

test("decode ziet afstand", () => {
  const r = decode("Ze heeft niet gereageerd op mijn bericht en zei dat ze het te druk heeft.");
  assert.ok(r.comfort < 45, `comfort was ${r.comfort}`);
  assert.ok(r.negatives.length >= 2);
  assert.match(r.move, /geen actie/i);
});

test("reframe haalt onrust uit een lang bericht en maakt een voorstel", () => {
  const r = reframe("Hey! Sorry dat ik weer stuur haha, ik vroeg me af of je misschien zin hebt om donderdag wat te drinken? Geen druk hoor, als je het druk hebt is het ook prima. Laat maar weten!");
  assert.ok(r.pressure > 50, `pressure was ${r.pressure}`);
  assert.equal(r.style, "Voorstel");
  assert.match(r.reframed, /^Donderdag/);
  assert.ok(r.reframed.split(" ").length < 15);
  assert.ok(r.diagnosis.some((d) => d.label === "Verontschuldigen"));
});

test("reframe adviseert stilte bij najagen", () => {
  const r = reframe("Heb je mijn bericht gezien? Je reageert nog steeds niet.");
  assert.equal(r.style, "Stilte");
  assert.equal(r.reframed, "");
});

test("simulate beloont een gegrond antwoord en straft campagne", () => {
  const good = simulate({ scenarioId: "cold", history: [], message: "Snap ik. Donderdag 20:00 wijn bij Bar Botanique?" });
  const bad = simulate({ scenarioId: "cold", history: [], message: "Sorry dat ik weer stuur, ik hoop dat ik niet vervelend ben? Ik vond het echt zo leuk en ik mis je een beetje, laat maar weten of je misschien wilt afspreken?? Geen druk hoor!" });
  assert.ok(good.analytics.frame >= 75, `good frame ${good.analytics.frame}`);
  assert.ok(bad.analytics.frame < 50, `bad frame ${bad.analytics.frame}`);
  assert.equal(good.persona, "Sofie");
  assert.ok(good.reply.length > 0 && bad.reply.length > 0);
});
