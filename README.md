# MyWords — Profesionální webový textový editor

Moderní, lehká a výkonná obdoba textových procesorů Microsoft Word, Apple Pages a LibreOffice Writer, vytvořená pro webové prostředí.

## 🚀 Klíčové funkce

### 1. Levý panel s kompletním nastavením v logických záložkách
- **Formátování (Text & Odstavce):**
  - Výběr rodiny písma (Inter, Roboto, Montserrat, Merriweather, Playfair Display, EB Garamond, Lora, JetBrains Mono, Fira Code, Arial, Georgia, Times New Roman).
  - Styly odstavce a nadpisy (Normální text, Nadpis 1, Nadpis 2, Nadpis 3).
  - Řez písma: Tučné, Kurzíva, Podtržené, Přeškrtnuté, Dolní index, Horní index.
  - Vzorník barev textu a zvýrazňovač s paletou.
  - Zarovnání: Vlevo, Na střed, Vpravo, Do bloku (Justify).
  - Seznamy s odrážkami, číslované seznamy, blokové citace, blok kódu.
  - Tlačítko pro vymazání formátování.
- **Vložit:**
  - **Tabulky:** Vložení mřížky přes interaktivní volič (až 8×8) nebo zadáním rozměrů, kontextové nástroje (přidat/odebrat řádky a sloupce, přepnout záhlaví, smazat tabulku).
  - **Obrázky:** Nahrání souboru ze zařízení (automatický převod na DataURL) nebo zadání webové adresy URL, náhled, alternativní text.
  - **Symboly a speciální znaky:** Typografické uvozovky a pomlčky („ “, —, ©, ®), měny (€, $, £, Kč, ¥), matematické znaky (±, ×, ÷, ≠, ≤, ≥, √, ∞, π), šipky a emojis.
  - **Oddělovače a datum:** Vodorovná oddělovací čára, aktuální české datum, zalomení stránky (Page break).
  - **Odkazy:** Vložení a editace hypertextových odkazů.
- **Stránka & Rozvržení:**
  - Formát stránky: A4 (210 × 297 mm), A5 (148 × 210 mm), Letter, Legal.
  - Orientace listu: Na výšku (Portrét) / Na šířku (Krajina).
  - Předvolby okrajů: Normální (25 mm), Úzké (12.7 mm), Široké (35 mm) a vlastní rozměry v mm.
  - Barva papíru: Čistě bílá, Slonová kost, Jemně šedá, Pergamen, Modravá.
  - Vodorovné pravítko s milimetrovými značkami a vyznačením okrajů.
- **Záhlaví & Zápatí:**
  - Zapnutí/vypnutí záhlaví s vlastním textem a zarovnáním.
  - Zapnutí/vypnutí zápatí s vlastním textem a zarovnáním.
  - Stránkování: Bez číslování, Jednoduché („Strana 1“), Plné („Strana 1 z 1“), Odrážkové („— 1 —“).
  - Volba pozice číslování: Vlevo, Na střed, Vpravo.
- **Export & Tisk:**
  - **Export do DOCX:** Generování nativního Microsoft Word souboru (`.docx`) kompatibilního s MS Word, Apple Pages i LibreOffice.
  - **Export do PDF:** Vizuální PDF soubor ke stažení.
  - **Tisk:** Přímý dialog tisku s čistými `@media print` pravidly (skryje všechny panely a ovládací prvky, vytiskne pouze čistou stránku s přesnými okraji).
  - **Text (.txt), HTML (.html), Markdown (.md):** Okamžitý export do různých formátů.
  - **Uložení / Otevření projektu (.mywords):** Uložení stavu dokumentu včetně nastavení okrajů, záhlaví a papíru.
  - **Předpřipravené šablony:** Úřední dopis, Zpráva o stavu projektu, Profesionální životopis (CV), Prázdný list.
- **Statistika & Nástroje:**
  - Živý počet slov, znaků (s mezerami i bez), počet odstavců.
  - Odhadovaná doba čtení.
  - Hledat a nahradit (Find & Replace).
  - Historie změn Zpět (Undo) a Znovu (Redo).
  - Přehled klávesových zkratek.

### 2. Horní lišta & Rychlé ovládání
- Přejmenování dokumentu kliknutím na název.
- Rychlé přepínání zvětšení (Zoom 50 % až 160 %).
- Přepínač režimu zobrazení: **Režim stránek (A4)** vs. **Plynulý režim**.
- Rychlé tlačítko pro stažení DOCX a okamžitý tisk.
- Automatické ukládání do lokálního úložiště prohlížeče (`localStorage`).

### 3. Plovoucí kontextové menu (Bubble Menu)
- Při označení libovolného textu se přímo nad výběrem zobrazí rychlá lišta pro formátování (tučné, kurzíva, podtržení, přeškrtnutí, zvýrazňovač, odkaz).

## 🛠 Spuštění projektu

```bash
# Instalace závislostí (již provedeno)
npm install

# Spuštění vývojového serveru
npm run dev

# Sestavení produkčního balíčku
npm run build
```

Vývojový server běží na: `http://localhost:5173/`
