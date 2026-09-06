# The Captain

Premium coaching-app voor mannen die een partner zoeken zonder zichzelf te verliezen. Rust, richting en frame in plaats van campagne voeren.

Vier modules:

| # | Module | Wat het doet |
|---|---|---|
| 01 | **Signal Decoder** | Beschrijf wat zij deed of zei. De app leest de zes onbewuste signalen en de staat van haar zenuwstelsel, en geeft één concrete kapiteinszet. |
| 02 | **De Reframer** | Plak een lang, onzeker bericht. De app meet de onrust, benoemt de patronen en geeft een korte, drukvrije versie plus een Grounded Exit (niets sturen). |
| 03 | **De Simulator** | Rollenspel in vier scenario's (koele reactie, twijfel, testvraag, eerste date). Na elke beurt een frame-analyse en een coachnotitie. |
| 04 | **Het Logboek** | De kennisbank (pijlers, signalen, aanraking met consent-regels, taal) en je eigen geschiedenis. |

Plus de **Emergency Anchor**: een knop voor het moment dat je wilt dubbel-texten. Berichten gaan op slot, een koperen cirkel ademt in 4-7-8 ritme, drie minuten lang.

Het dashboard toont de **Compass**: je frame-score, opgebouwd uit stilte-dagen, herschreven berichten, anker-momenten en simulator-resultaten. Alles staat lokaal op het apparaat (localStorage). Geen accounts.

## Stack

- Node.js 20+, Express
- Vanilla HTML/CSS/JS front-end (PWA, installeerbaar op telefoon)
- Claude API via `@anthropic-ai/sdk` (optioneel). Zonder sleutel draait de ingebouwde offline coaching-engine.

## Lokaal draaien

```bash
npm install
npm start
```

Open http://localhost:3000.

Met Claude (aanbevolen voor de beste analyses):

```bash
cp .env.example .env
# vul ANTHROPIC_API_KEY in
npm start
```

Of via Docker:

```bash
docker build -t the-captain .
docker run -p 3000:3000 -e ANTHROPIC_API_KEY=sk-ant-... the-captain
```

Tests:

```bash
npm test
```

## Deployen

### Railway

Repo koppelen aan een nieuwe Railway-service. `railway.toml` staat in de root, dus Railway pakt de Dockerfile automatisch.

| Instelling | Waarde |
|---|---|
| Root Directory | `/` (repo-root) |
| Builder | Dockerfile (automatisch via `railway.toml`) |
| Build Command | niet nodig (Dockerfile) |
| Start Command | `npm start` |
| Healthcheck | `/api/health` |

### Omgevingsvariabelen

| Variabele | Verplicht | Uitleg |
|---|---|---|
| `PORT` | nee | Railway zet deze zelf. Standaard 3000. |
| `ANTHROPIC_API_KEY` | nee | Zonder sleutel draait de offline engine. Met sleutel doet Claude de analyses. |
| `CAPTAIN_MODEL` | nee | Standaard `claude-opus-5`. |

De AI-laag gebruikt server-side fallbacks (`fallbacks: "default"`), zodat een geweigerd verzoek automatisch naar een ander Claude-model gaat. Faalt ook dat, dan valt de app terug op de offline engine. De gebruiker merkt er niets van.

## Structuur

```
server.js            Express-server en API
lib/knowledge.js     Kennisbank (pijlers, signalen, aanraking, taal, scenario's)
lib/engine.js        Offline coaching-engine (heuristieken)
lib/ai.js            Claude-laag met fallback naar de engine
public/              Front-end (index.html, styles.css, app.js, PWA-bestanden)
tests/               Engine-tests (node --test)
```

## API

| Endpoint | Body | Antwoord |
|---|---|---|
| `GET /api/health` | | `{ ok, ai }` |
| `GET /api/knowledge` | | kennisbank voor de front-end |
| `POST /api/decode` | `{ text }` | comfort, state, zes signalen, tegensignalen, lezing, zet |
| `POST /api/reframe` | `{ text }` | pressure, diagnose, herschreven bericht, Grounded Exit |
| `POST /api/simulate` | `{ scenarioId, history, message }` | antwoord persona, analytics (frame, onrust, flags), coachnotitie |
