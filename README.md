# MyWords — Profesionální webový textový editor

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)

**MyWords** je moderní, plně responzivní a bleskově rychlý webový textový editor inspirovaný nástroji jako *Microsoft Word*, *Apple Pages* a *LibreOffice Writer*. Běží kompletně v prohlížeči, bez nutnosti instalace či přihlašování, s plnou podporou práce offline a okamžitou automatickou synchronizací v `localStorage`.

---

## ✨ Hlavní funkce

### 📂 Správa projektů (Záložky projektů)
- Práce s více dokumenty současně v podobě záložek.
- **Drag & drop přetahování** pro snadnou změnu pořadí záložek.
- Rychlé přejmenování (dvojklikem nebo přes kontextové menu).
- Duplikace projektu a export/import do souboru `.mywords` (JSON).
- Rychlé přepínání klávesovými zkratkami `Ctrl+Alt+→` / `Ctrl+Alt+←`.

### 📄 Rozvržení stránky & Tisková příprava
- **Předvolby formátů:** A4, A5, B5, Letter, Legal, Executive, Kniha / Příručka (135 × 205 mm, 140 × 205 mm). Všechny rozměry standardizovány v cm/mm.
- **Režimy zobrazení:**
  - *Stránkový náhled (Page view)* s interaktivním dělením na stránky.
  - *Dvojstránka (Kniha / Knižní vazba)* pro rozvržení levé a pravé stránky se zrcadlovými okraji a hřbetem (Gutter).
  - *Plynulý režim (Continuous)* bez okrajů pro nerušené psaní.
- Vizuální zobrazení okrajů a hřbetu s jemným barevným tónováním.
- Volba barvy a textury papíru (bílá, slonová kost, recyklovaný papír, jemná modř atd.).
- Interaktivní pravítko s milimetrovými značkami.

### ✍️ Bohaté formátování textu
- Široký výběr typografických fontů: *Inter, Roboto, Montserrat, Segoe UI, Georgia, Arial, Times New Roman, Playfair Display, EB Garamond, Lora, JetBrains Mono, Fira Code*.
- Odstavcové styly (Nadpis 1–3, normální text, blokové citace, blok kódu).
- **Nastavitelné řádkování odstavců** (1.0, 1.15, 1.5, 1.75, 2.0).
- Zvýrazňování textu a vzorník barev s hex paletou.
- Odrážkové i číslované seznamy, zarovnání textu (vlevo, na střed, vpravo, do bloku).
- Plovoucí bublinové menu (Bubble Menu) přímo nad vybraným textem.

### 🖼️ Interaktivní objekty & Média
- **Libovolná změna velikosti objektů (Resize handles):** Chycením rohů či stran můžete snadno zmenšovat/zvětšovat vložené obrázky a grafy s live přepočtem rozměrů v centimetrech (cm).
- **Vkládání grafů (SVG):** Sloupcové (Bar), spojnicové (Line), koláčové (Pie) a prstencové (Doughnut) grafy s možností editace hodnot přímo v dialogu.
- **Tabulky:** Vizuální volič rozměrů, přidávání/mazání řádků a sloupců, záhlaví.
- **Typografické symboly a měny:** České uvozovky („ “), pomlčky (—, –), symboly měn (€, $, Kč, £, ¥), matematické operátory (±, ×, ÷, ≠, ≤, ≥, ∑, √, ∞, π) a emotikony.

### 📑 Záhlaví, zápatí & Číslování stránek
- Vlastní texty pro záhlaví a zápatí.
- Samostatné nastavení pro liché a sudé stránky.
- Automatické číslování stran s výběrem stylu (*Strana X*, *Strana X z Y*, *— X —*).

### 💾 Export & Import
- **DOCX:** Generování nativního `.docx` souboru pro Microsoft Word a LibreOffice.
- **PDF:** Export do formátu PDF.
- **Tisk:** Perfektně vyladěný CSS tisk (`@media print`) s přesnými fyzickými rozměry a skrytím všech nástrojových lišt.
- **Text, HTML, Markdown:** Export čistého textu nebo strukturovaného kódu.
- **.mywords:** Kompletní záloha projektu včetně nastavení geometrie stránek.

---

## 🛠️ Použité technologie

- **Frontend framework:** [React 19](https://react.dev/)
- **Build nástroj:** [Vite 8](https://vite.dev/)
- **Typový systém:** [TypeScript](https://www.typescriptlang.org/)
- **Editor jádro:** [TipTap](https://tiptap.dev/) & [ProseMirror](https://prosemirror.net/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Ikony:** [Lucide React](https://lucide.dev/)
- **DOCX generátor:** [docx](https://docx.js.org/)
- **Linter & Code quality:** [oxlint](https://oxc-project.github.io/)

---

## 🚀 Spuštění a instalace

### Požadavky
- [Node.js](https://nodejs.org/) verze 18 nebo vyšší
- Správce balíčků `npm` nebo `pnpm`

### Lokální vývoj
```bash
# 1. Klonování repozitáře
git clone https://github.com/vase-jmeno/MyWords.git
cd MyWords

# 2. Instalace závislostí
npm install

# 3. Spuštění lokálního vývojového serveru
npm run dev
```
Aplikace poběží na adrese `http://localhost:5173/`.

### Produkční sestavení (Build)
```bash
npm run build
```
Výsledné optimalizované statické soubory budou uloženy ve složce `dist/`, odkud je lze nasadit na libovolný statický hosting (GitHub Pages, Vercel, Netlify, Cloudflare Pages).

### Kontrola kvality kódu (Linter)
```bash
npm run lint
```

---

## 🌐 Nasazení na GitHub Pages (Doporučený postup)

V souboru `vite.config.ts` nastavte `base`:
```ts
export default defineConfig({
  base: '/MyWords/', // název vašeho repozitáře na GitHubu
  plugins: [react(), tailwindcss()],
})
```
Následně můžete využít GitHub Actions pro automatický deployment větve `main` do GitHub Pages.

---

## 📄 Licence
Tento projekt je licencován pod licencí [MIT](LICENSE).
