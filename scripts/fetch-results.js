// Krokens Copa – Auto-fetch PL results
// Runs via GitHub Actions. Fetches finished match results from football-data.org
// and saves them directly to Firebase Realtime Database via REST API.

const FIREBASE_DB_URL = 'https://krokens-copa-default-rtdb.europe-west1.firebasedatabase.app';
const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY || '406217531e18462e97f40aea2c744b8e';

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

async function main() {
    console.log(`\n=== Krokens Copa – Auto-fetch ${new Date().toISOString()} ===`);

    // 1. Load matches from Firebase
    const matchRes = await fetch(`${FIREBASE_DB_URL}/matches.json`);
    if (!matchRes.ok) {
        console.error(`Firebase read failed: ${matchRes.status}`);
        process.exit(1);
    }
    const matches = await matchRes.json();

    if (!matches || !Array.isArray(matches)) {
        console.log('No matches in database.');
        return;
    }

    const now = new Date();
    let foundResults = 0;
    let checked = 0;

    for (let i = 0; i < matches.length; i++) {
        const match = matches[i];
        if (!match) continue;

        // Skip if result already set
        if (match.actualOutcome) continue;

        // Skip if match hasn't started yet
        const matchTime = new Date(match.date);
        if (now < matchTime) continue;

        // Wait at least 100 minutes after kick-off
        const minutesSinceStart = (now - matchTime) / (1000 * 60);
        if (minutesSinceStart < 100) {
            console.log(`  ⏰ ${match.homeTeam} vs ${match.awayTeam}: only ${minutesSinceStart.toFixed(0)} min since start, skipping`);
            continue;
        }

        checked++;
        console.log(`Checking: ${match.homeTeam} vs ${match.awayTeam} (${match.date})`);

        try {
            const matchDate = match.date.split('T')[0];
            const apiUrl = `https://api.football-data.org/v4/competitions/PL/matches?dateFrom=${matchDate}&dateTo=${matchDate}`;

            const apiRes = await fetch(apiUrl, {
                headers: { 'X-Auth-Token': FOOTBALL_API_KEY }
            });

            if (apiRes.status === 429) {
                console.log('  ⚠️  Rate limited – waiting 60s...');
                await sleep(60000);
                i--; // Retry same match
                continue;
            }

            if (!apiRes.ok) {
                console.log(`  ⚠️  API error: ${apiRes.status}`);
                continue;
            }

            const data = await apiRes.json();
            const games = data.matches || [];

            // Match by team name (fuzzy)
            const game = games.find(g => {
                const apiHome = (g.homeTeam?.shortName || g.homeTeam?.name || '').toLowerCase();
                const apiAway = (g.awayTeam?.shortName || g.awayTeam?.name || '').toLowerCase();
                const ourHome = match.homeTeam.toLowerCase();
                const ourAway = match.awayTeam.toLowerCase();
                return (apiHome.includes(ourHome) || ourHome.includes(apiHome)) &&
                       (apiAway.includes(ourAway) || ourAway.includes(apiAway));
            });

            if (!game) {
                console.log(`  ❌ Not found in API (teams: ${match.homeTeam} vs ${match.awayTeam})`);
                continue;
            }

            if (game.status !== 'FINISHED') {
                console.log(`  ⏳ Status: ${game.status}`);
                continue;
            }

            const homeGoals = game.score?.fullTime?.home;
            const awayGoals = game.score?.fullTime?.away;

            if (homeGoals === null || homeGoals === undefined ||
                awayGoals === null || awayGoals === undefined) {
                console.log(`  ⚠️  No score data`);
                continue;
            }

            let outcome;
            if (homeGoals > awayGoals) outcome = '1';
            else if (homeGoals < awayGoals) outcome = '2';
            else outcome = 'X';

            matches[i].actualOutcome = outcome;
            matches[i].actualScore = `${homeGoals}-${awayGoals}`;
            matches[i].setBy = 'GitHub Actions';
            matches[i].setAt = new Date().toISOString();

            console.log(`  ✅ ${match.homeTeam} ${homeGoals}-${awayGoals} ${match.awayTeam} → ${outcome}`);
            foundResults++;

            // Respect rate limit: max 10 req/min on free tier
            await sleep(6000);

        } catch (err) {
            console.error(`  ❌ Error: ${err.message}`);
        }
    }

    if (checked === 0) {
        console.log('No matches to check right now.');
        return;
    }

    if (foundResults > 0) {
        // Save updated matches array back to Firebase
        const putRes = await fetch(`${FIREBASE_DB_URL}/matches.json`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(matches)
        });

        if (putRes.ok) {
            console.log(`\n✅ Saved ${foundResults} new result(s) to Firebase.`);

            // Log to activityLog in Firebase
            const logRes = await fetch(`${FIREBASE_DB_URL}/activityLog.json`);
            const existingLog = logRes.ok ? (await logRes.json() || []) : [];
            const log = Array.isArray(existingLog) ? existingLog : [];
            log.push({
                action: 'AUTO_RESULT_GITHUB',
                detail: `GitHub Actions: ${foundResults} resultat sparade`,
                player: 'System',
                timestamp: new Date().toISOString()
            });
            // Keep max 100 entries
            if (log.length > 100) log.splice(0, log.length - 100);
            await fetch(`${FIREBASE_DB_URL}/activityLog.json`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(log)
            });
        } else {
            const body = await putRes.text();
            console.error(`❌ Firebase write failed: ${putRes.status} – ${body}`);
            process.exit(1);
        }
    } else {
        console.log(`\nChecked ${checked} match(es) – no new results yet.`);
    }
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
