// The Captain - kennisbank. Alle coaching-inhoud staat hier, in het Nederlands.
// Toon: kalm, direct, geen pick-up-taal, geen manipulatie. Wederkerigheid en respect zijn de basis.

export const PILLARS = [
  {
    id: "cake",
    title: "Cake & Cherry",
    short: "Jouw leven is de taart. Zij is de kers.",
    body:
      "Een vrouw mag nooit de stip aan de horizon zijn. Dan hangt je stemming aan haar reactie en voelt zij die druk direct. Bouw een leven dat op zichzelf staat: werk, vrienden, lichaam, doelen. Zij is een prachtige toevoeging, maar de taart staat ook zonder haar.",
  },
  {
    id: "zero",
    title: "Zero Performance",
    short: "Hoe harder je campagne voert, hoe meer waarde je verliest.",
    body:
      "Auditie doen, bewijzen, overtuigen: het is allemaal campagne voeren. Waarde zit in rust en zelfbezit. Je hoeft niets te winnen. Je laat zien wie je bent en laat haar zelf kiezen.",
  },
  {
    id: "contrast",
    title: "Contrast & Afwezigheid",
    short: "Aantrekking groeit in stilte, niet in aanwezigheid.",
    body:
      "Constante aanwezigheid maakt je achtergrondruis. Selectieve afwezigheid en stilte scheppen ruimte voor nieuwsgierigheid en mentale herhaling. Niet als spel, maar omdat je een leven hebt dat je aandacht verdient.",
  },
];

export const SIGNALS = [
  {
    id: "touch",
    name: "Strategisch contact",
    subtitle: "Gechoreografeerde aanraking",
    body:
      "Een kraag rechttrekken, aan je horloge zitten, een korte aanraking op je onderarm, een knie die onder tafel blijft rusten. Dit maakt oxytocine vrij en tast voorzichtig fysieke grenzen af.",
    science: "Oxytocine-afgifte bij lichte, bewuste aanraking.",
    keywords: ["aanraak", "aanrak", "raakte", "onderarm", "haar hand", "mijn hand", "knie", "kraag", "horloge", "schouder", "tegen me aan", "stootte", "duwde", "knuffel", "omhels", "pluisje", "mijn arm", "mijn been", "haar been", "streek", "aaide"],
  },
  {
    id: "disclosure",
    name: "Strategische kwetsbaarheid",
    subtitle: "Wederzijdse zelfonthulling",
    body:
      "Ze deelt persoonlijke, ongefilterde verhalen: jeugdherinneringen, angsten, dingen die ze normaal afschermt. Onderzoek van Arthur Aron (Stony Brook) laat zien dat dit binding versnelt.",
    science: "Aron et al. - versnelde intimiteit door wederzijdse zelfonthulling.",
    keywords: ["vertelde", "jeugd", "vroeger", "bang", "angst", "onzeker", "geheim", "nooit iemand", "niemand weet", "huil", "haar vader", "haar moeder", "ouders", "haar ex", "scheiding", "verdriet", "eerlijk", "persoonlijk", "kwetsbaar", "trauma", "therapie", "droom", "opgegroeid"],
  },
  {
    id: "oneonone",
    name: "Plausibele 1-op-1 momenten",
    subtitle: "Toevallige privé-ruimte",
    body:
      "Ze regelt stilletjes momenten met jou alleen: blijft langer, appt je apart in plaats van in de groep, loopt met je mee. Verpakt als toeval.",
    science: "Proximity seeking - nabijheid zoeken als hechtingsgedrag.",
    keywords: ["alleen", "apart", "privé", "prive", "bleef", "langer", "mee naar", "liep mee", "samen naar", "appte me", "stuurde me", " dm", "buiten de groep", "even samen", "na afloop", "wachtte", "meerijden", "naar huis", "ophalen", "met z'n tweeën", "met zn tweeen"],
  },
  {
    id: "mirroring",
    name: "Onbewust spiegelen",
    subtitle: "Neurale koppeling",
    body:
      "Ze kopieert je houding, gebaren, het moment waarop je je glas pakt, je spreektempo. Automatische synchronisatie op onbewust niveau.",
    science: "Neural coupling - synchronisatie van motoriek en ritme.",
    keywords: ["zelfde", "hetzelfde", "spiegel", "na deed", "nadeed", "kopieer", "tegelijk", "net als ik", "mijn woorden", "lachte mee", "tempo", "ritme", "haar glas", "zelfde moment", "ook naar voren", "leunde"],
  },
  {
    id: "we",
    name: "Wij-taal",
    subtitle: "Collectieve toekomstprojectie",
    body:
      "Haar taal verschuift van 'ik' naar 'wij' over de middellange termijn: 'We moeten dat restaurant eens proberen.' Volgens Gottman een sterke voorspeller van een gedeeld verhaal.",
    science: "Gottman - het 'wij'-narratief als relatievoorspeller.",
    keywords: ["we moeten", "wij moeten", "we zouden", "moeten we", "zullen we", "gaan we", "we gaan", "volgende keer", "eens samen", "ooit samen", "binnenkort", "wij samen", "we kunnen", "we zien", "zei ze we", "zei we"],
  },
  {
    id: "voice",
    name: "Stemverandering",
    subtitle: "Lagere, zachtere toon en vocal fry",
    body:
      "Haar stem zakt naar een zachter, warmer, ademiger register. Meer 'vocal fry' aan het eind van zinnen. Een evolutionair signaal van veiligheid en comfort.",
    science: "Stirling University - toonhoogteverlaging bij ervaren veiligheid.",
    keywords: ["stem", "zacht", "zachter", "lager", "fluister", "hees", "ademig", "warme toon", "toon", "praatte zacht", "lachje", "giechel", "langzaam", "kraak"],
  },
];

export const NEGATIVE_MARKERS = [
  { re: /niet gereageerd|geen antwoord|geen reactie|gelezen maar|blauwe vinkjes|ghost/i, weight: 22, label: "Geen reactie" },
  { re: /\bhaha ok\b|\bprima\b|\bmisschien\b|\bwe zien wel\b|\bik kijk wel\b|\bok(e|é)?\b\.?\s*$/i, weight: 12, label: "Vlak of ontwijkend antwoord" },
  { re: /kort(e)? (antwoord|reactie)|één woord|een woord|eenlettergrepig/i, weight: 15, label: "Korte antwoorden" },
  { re: /geen tijd|te druk|later misschien|afgezegd|cancel|afzeggen|verzet/i, weight: 14, label: "Druk of afzeggen" },
  { re: /afstand|keek weg|wegkeek|op haar telefoon|armen over elkaar|draaide weg|wegdraai/i, weight: 14, label: "Fysieke afstand" },
  { re: /haar vriend\b|vriendje|heeft een relatie|verkering|samenwonen met/i, weight: 8, label: "Noemt een ander" },
];

export const ANXIETY_MARKERS = [
  { re: /sorry|excuus|excuses|vergeef|het spijt me/gi, weight: 14, label: "Verontschuldigen", detail: "Sorry zeggen voor iets wat geen fout is, verlaagt je as." },
  { re: /geen druk|no pressure|als je wilt|als je zin hebt|als je tijd hebt|hoeft niet|mag ook niet|is ook prima|maakt niet uit hoor/gi, weight: 12, label: "Voorvechten van afwijzing", detail: "Je geeft haar de nee al cadeau voordat ze hem hoeft te geven." },
  { re: /ik hoop|hopelijk|ik hoopte/gi, weight: 10, label: "Hopen", detail: "Hopen legt de uitkomst bij haar. Een kapitein stelt voor en laat los." },
  { re: /laat maar weten|laat het me weten|hoor het graag|ik wacht|wacht op je/gi, weight: 10, label: "Wachten op haar", detail: "Je positioneert jezelf als wachtende partij." },
  { re: /ik dacht|ik vroeg me af|ik vraag me af|misschien|eventueel|zou je misschien|wellicht/gi, weight: 8, label: "Aarzelend taalgebruik", detail: "Misschien, eventueel, wellicht: elk woord haalt scherpte weg." },
  { re: /\?/g, weight: 6, label: "Veel vragen", detail: "Meer dan één vraag maakt van je bericht een verhoor.", min: 2 },
  { re: /!!+|\?\?+/g, weight: 8, label: "Dubbele leestekens", detail: "Uitroeptekens stapelen leest als spanning." },
  { re: /omdat|want|namelijk|het zit zo|ik bedoel|eigenlijk|het is niet zo dat/gi, weight: 6, label: "Uitleggen", detail: "Uitleg vraagt om begrip. Je hebt geen begrip nodig, je hebt een voorstel." },
  { re: /mis je|miste je|denk aan je|denk veel aan je|kan je niet vergeten|verliefd/gi, weight: 14, label: "Te vroeg emotioneel investeren", detail: "Gevoelens benoemen voor er wederkerigheid is, zet haar op een voetstuk." },
  { re: /nog steeds|alweer|weer niks|je reageert niet|waarom reageer|heb je mijn bericht|gezien\?/gi, weight: 16, label: "Najagen", detail: "Vragen naar een reactie is het luidste teken van onrust." },
  { re: /😊😊|🙏|😅|😬|🥺/g, weight: 6, label: "Onzekere emoji", detail: "Emoji's die verzachten, verzachten ook je frame." },
];

export const TOUCH = [
  { id: "back", name: "De rustige onderrug", body: "Haar door een drukte begeleiden met een warme, stabiele handpalm op haar onderrug. Kort, doelgericht, beschermend.", consent: "Alleen als jullie al fysiek contact hebben gehad en zij daar zichtbaar ontspannen op reageerde." },
  { id: "cradle", name: "De tweehandige hand", body: "Beide handen om één van haar handen. Symmetrische prikkel, bilaterale stimulatie: 'ik ben helemaal hier'.", consent: "Op een moment van rust en oogcontact, nooit als verrassing." },
  { id: "forehead", name: "Voorhoofd tegen voorhoofd", body: "Voorhoofden zacht tegen elkaar, ogen dicht, adem synchroniseren. De sterkste hechtingsbouwer.", consent: "Alleen in een fase van duidelijke wederzijdse intimiteit." },
  { id: "nape", name: "De nek", body: "Een hand in haar nek, een gevoelig en onbeschermd gebied. Combinatie van opwinding en vertrouwen (dopamine en oxytocine).", consent: "Pas als eerdere aanraking door haar is beantwoord. Bij twijfel: niet." },
  { id: "thumb", name: "De duimstreek", body: "Tijdens contact langzaam en ritmisch je duim heen en weer bewegen. Activeert C-tactiele vezels en de insula: directe emotionele nabijheid.", consent: "Alleen tijdens contact dat zij al toelaat, bijvoorbeeld hand vasthouden." },
  { id: "pull", name: "De stille beweging", body: "Haar zonder woorden dichter naar je zij halen. Veilige hechting laat zich zien in nabijheid zoeken zonder uitleg.", consent: "Licht en omkeerbaar. Als ze niet meebeweegt, laat je direct los." },
  { id: "hug", name: "De 20-seconden omhelzing", body: "Volledige omhelzing van minstens 20 seconden. Cortisol daalt, haar zenuwstelsel schakelt van vecht-of-vlucht naar rust en verbinding.", consent: "Nodig haar uit ('kom eens hier') en voel of ze ontspant. Zo niet, korter." },
];

export const NOTICED = {
  title: "'Ik zag dat...'",
  body: "Drie woorden waardoor een vrouw zich echt gezien voelt. Geen algemene complimenten, maar een specifieke observatie: 'Ik zag dat je anders lacht als je over je werk praat.' Dat zet mentale herhaling in gang.",
};

export const COMPLIMENTS = [
  { text: "Er is iets aan jou dat ik nog niet kan plaatsen. Maar ik wil het wel graag ontdekken.", why: "Opent een vraag zonder afronding." },
  { text: "Je lijkt me iemand met verhalen die de meeste mensen nooit te horen krijgen.", why: "Waardeert haar verborgen diepte." },
  { text: "Ik weet nog niet of je heel goed voor me zou zijn, of een klein beetje gevaarlijk.", why: "Zet een speels beoordelingskader neer." },
  { text: "Je denkt op een manier die ik nog niet eerder ben tegengekomen. Ik weet niet of dat me gaat inspireren of gek gaat maken.", why: "Erkent haar eigen manier van denken." },
];

export const TEST_QUESTIONS = [
  {
    q: "Ben je veel alleen?",
    test: "Test op beschikbaarheid versus vastzitten in routines.",
    answer: "Ik geniet van mijn ruimte, maar ik sta altijd open voor goed gezelschap.",
  },
  {
    q: "Wat zoek je eigenlijk, tegenwoordig?",
    test: "Test op richting versus drijven.",
    answer: "Ik bouw aan een simpeler, sterker hoofdstuk met de juiste mensen. Meer intentie, meer ervaringen, meer momenten die ertoe doen.",
  },
];

export const LESSONS = [
  "Stuur nooit een tweede bericht om het eerste te redden.",
  "Een voorstel is compleet zonder uitleg. 'Donderdag, wijn, 20:00?' is een hele zin.",
  "Haar stilte is informatie, geen noodgeval.",
  "Wie de meeste ruimte laat, is degene met het meeste vertrouwen.",
  "Je hoeft niet interessant te zijn. Je hoeft geïnteresseerd te zijn, en dan weer weg.",
  "Als je twijfelt of je moet appen: niet appen.",
  "Val voor haar, niet voor het idee van haar.",
  "Een kapitein vraagt geen toestemming om richting te kiezen.",
  "Elk 'sorry' is een klein stukje as dat je weggeeft.",
  "Aandacht is je duurste valuta. Geef het bewust, nooit uit paniek.",
  "Zij is de kers. Werk vandaag aan de taart.",
  "Rust is aantrekkelijker dan alles wat je kunt zeggen.",
  "Wat je niet hoeft, kun je pas echt ontvangen.",
  "Ga weg als het goed is. Dat is het moment dat blijft hangen.",
];

export const SCENARIOS = [
  {
    id: "cold",
    name: "Koele reactie",
    persona: "Sofie",
    desc: "Ze reageert kort en vlak op je berichten na een leuke eerste date.",
    opening: "Hey. Ja was gezellig. Drukke week hier.",
    context: "Sofie (31) had een leuke eerste date met de gebruiker. Ze is nu kort en afstandelijk in haar berichten, deels omdat het druk is, deels omdat ze aftast hoe hij omgaat met ruimte.",
  },
  {
    id: "hesitation",
    name: "Twijfel bij een voorstel",
    persona: "Eva",
    desc: "Je stelde een tweede afspraak voor. Ze twijfelt hardop.",
    opening: "Hmm, ik weet het nog niet zo goed. Ik heb het gevoel dat het allemaal wat snel gaat?",
    context: "Eva (28) vindt de gebruiker leuk maar is voorzichtig na een vorige relatie. Ze test of hij ruimte kan geven zonder zich terug te trekken of te gaan overtuigen.",
  },
  {
    id: "test",
    name: "De testvraag",
    persona: "Laura",
    desc: "Op een terras stelt ze de vraag waar het echt om gaat.",
    opening: "Mag ik je iets vragen? Wat zoek je eigenlijk, tegenwoordig?",
    context: "Laura (34) is volwassen en scherp. Ze stelt de twee testvragen (ben je veel alleen / wat zoek je) en let op richting en rust. Ze houdt van eerlijkheid zonder zwaarte.",
  },
  {
    id: "firstdate",
    name: "Eerste date",
    persona: "Noor",
    desc: "Wijnbar, tweede glas. Het gesprek is goed. Wat nu?",
    opening: "Oké, eerlijk antwoord: ben je veel alleen? Je komt best zelfstandig over.",
    context: "Noor (30) is warm en nieuwsgierig. Ze deelt af en toe iets persoonlijks en let op of hij ook kwetsbaar durft te zijn zonder te gaan pleasen.",
  },
];
