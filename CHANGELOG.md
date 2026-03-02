# Ändringslogg

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
