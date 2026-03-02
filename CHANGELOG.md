# Ändringslogg

## 2026-03-02 (dölj tips tills tippning stängd)
- Andras tips visas inte längre medan tippning är öppen – man ser bara om folk tippat, inte vad
- Tips avslöjas först när deadline passerat eller matchen startat (gäller båda Matcher- och Tips-fliken)

## 2026-03-02 (kodoptimering #2 – buggfixar & refaktorering)
### Buggfixar
- **Total Reset fungerade aldrig** – bekräftelselogiken var trasig (`!confirm() !== null` är alltid true). Bytt till `prompt()`-baserad bekräftelse där man måste skriva "RESET"
- **Bonustext visade +25 istället för +50** – UI-texten i matchvyn stämde inte med den faktiska poängberäkningen (50p). Korrigerat till ⭐+50
- **Oanvänd variabel** – tog bort `deadlinesRef` i `adminSaveDeadline()` som skapades men aldrig användes

### Prestanda
- **Match-Map för O(1) lookups** – alla `matches.find(m => m.id === matchId)` (5+ ställen) ersatta med en `matchMap` som byggs en gång per render-cykel. Lookup går från O(n) till O(1)
- **Cachad `getFirstMatch()`** – resultatet cachas och invalideras bara när matcher ändras från Firebase, istället för att skapa nya Date-objekt varje gång

### Kodkvalitet
- **`requireAdmin()`-helper** – admin-guarden som upprepades i 8+ funktioner är nu en delad funktion
- **Datumformateringshelpers** – `formatDateTime()` och `formatDateTimeFull()` ersätter 7+ upprepade `toLocaleString()`-anrop
- **XSS-skydd i `showStatus()`** – bytt från `innerHTML` till `textContent` via `createElement()` för att förhindra potentiell HTML-injektion

## 2026-03-02 (kodoptimering)
- Debounced rendering – alla render-anrop samlas ihop till en enda DOM-uppdatering per bildruta (istället för upp till 9)
- Extraherade duplicerad inloggningslogik till `activateSession()` (3 kopior → 1 funktion)
- Extraherade duplicerad poängberäkning till `getStandings()` (2 kopior → 1 funktion)
- Optimerade API-resultathämtning: grupperar nu matcher per datum+liga (1 anrop istället för 10+ per omgång)
- Lade till poäng-cache (`pointsCache`) som beräknas en gång per render-cykel istället för i varje loop
- Tog bort oanvända variabler (`PL_LEAGUE_ID`, `CURRENT_SEASON`, `currentRound`)
- Flyttade upprepade inline-styles i admin-panelen till CSS-klasser

## 2026-03-02
- Lade till "Hantera spelare" i admin – admin kan lägga till/ta bort spelare dynamiskt via Firebase
- Spelare synkroniseras nu från Firebase-sökvägen `players` (tidigare hårdkodad lista)
- Lade till spelare Lennart
- Lade till Champions League-stöd med stegbaserad gruppering (Ligafas, Kvartsfinal osv.)
- Lade till VM-stöd (för framtida bruk)
- Admin kan nu kombinera PL + CL och ange separat antal omgångar per liga
- Lade till "Historik"-flik – avslutade säsonger kan sparas permanent av admin
- Säsongsvinnare visas med 🏆 i topplistan (5 pokaler = ⭐ stjärna)
- Poängsystemet är nu dynamiskt baserat på antal spelare (formel istället för hårdkodad tabell)
- Exakt resultat-bonus höjd från 25p till 50p; bonusen ges alltid vid rätt resultat
- Lösenordsinloggning skyddad mot race condition med `passwordsLoaded`-flagga

## 2026-02-xx
- Lade till "Ligans Nostradamus" (bästa tippsträcka)
- Lade till kolumn för rätt 1X2
- Auto-hämtning av resultat var 15:e minut
- Aktivitetslogg för admin

## Initial release
- Matchadmin med låsning inför avspark
- Tippning per spelare
- Topplista med poängräkning
- Separata omgångar: OS och PL
