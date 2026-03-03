# Krokens Copa

Ett tipptävlingssystem för en sluten grupp vänner. Deltagarna tippar matchresultat och samlas i en gemensam topplista.

**Live:** https://vg1414.github.io/KrokensCopa/

## Funktioner

- **Matcher** – Admin laddar upp kommande matcher via API (Premier League, Champions League)
- **Tippa** – Välj 1X2 och exakt resultat för varje match
- **Låsning** – Tippningar låses för alla när den första matchen i omgången startar
- **Topplista** – Dynamisk poängräkning; sällsynta tips ger mer poäng
- **Exakt resultat** – +50 bonuspoäng om man gissar rätt målsättning
- **Historik** – Avslutade säsonger sparas permanent; säsongsvinnare visas med 🏆
- **Spelarhantering** – Admin kan lägga till och ta bort spelare

## Poängsystem

Poängen beräknas dynamiskt beroende på hur många spelare som gissade rätt:
- Färre som gissade rätt = mer poäng (max 100p)
- +50p om exakt resultat också stämmer
- 0p vid uppskjuten match

## Teknik

- Vanilla HTML/CSS/JavaScript – inga ramverk eller byggsteg
- Firebase Realtime Database – realtidssynk av tippningar och resultat
- football-data.org API – hämtar matcher och resultat automatiskt
- Mobilanpassad med flikar (Matcher / Tippa / Topplista / Historik / Admin)
- Blå/mörk design med guld-accent

## Made by: David Hefner
