import type { DocumentTemplate } from '../types/editor';

export const SAMPLE_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'formal-letter',
    name: 'Formální úřední dopis',
    description: 'Strukturovaný dopis s adresátem, předmětem a formálním podpisem.',
    content: `
      <p style="text-align: right;">V Praze dne 18. října 2026</p>
      <p><br></p>
      <p><strong>Odesílatel:</strong><br>Jan Novák<br>Květinová 123/4<br>110 00 Praha 1<br>E-mail: jan.novak@priklad.cz<br>Tel: +420 777 123 456</p>
      <p><br></p>
      <p><strong>Příjemce:</strong><br>Městský úřad Praha 1<br>Odbor správy majetku<br>Vodičkova 18<br>115 68 Praha 1</p>
      <p><br></p>
      <h2>Věc: Žádost o poskytnutí informací a povolení záboru</h2>
      <p>Vážená paní, vážený pane,</p>
      <p>obracím se na Vás s uctivou žádostí o stanovisko ve věci plánovaného záboru veřejného prostranství v ulici Květinová za účelem přistavení velkoobjemového kontejneru pro rekonstrukci bytové jednotky.</p>
      <p>Zábor je plánován v následujícím termínu a rozsahu:</p>
      <ul>
        <li><strong>Termín:</strong> od 1. listopadu 2026 do 5. listopadu 2026</li>
        <li><strong>Výměra:</strong> 12 m² chodníku podél budovy č.p. 123</li>
        <li><strong>Zabezpečení:</strong> Koridor pro chodce o šířce min. 1,5 m zůstane plně zachován</li>
      </ul>
      <blockquote>Předem děkuji za Vaši vstřícnost a včasné vyřízení této žádosti v zákonné lhůtě.</blockquote>
      <p>V případě doplňujících dotazů jsem Vám k dispozici na výše uvedeném telefonním čísle.</p>
      <p><br></p>
      <p>S úctou a pozdravem,</p>
      <p><br></p>
      <p><strong>Jan Novák</strong><br><em>vlastník jednotky</em></p>
    `,
  },
  {
    id: 'project-report',
    name: 'Zpráva o stavu projektu',
    description: 'Projektový report s tabulkami, milníky a statistikou.',
    content: `
      <h1>Zpráva o stavu projektu: Alpha 2026</h1>
      <p><em>Zpracoval: Projektový tým MyWords | Datum: Říjen 2026 | Verze: 1.4</em></p>
      <hr>
      <h2>1. Manažerské shrnutí</h2>
      <p>Tento dokument shrnuje aktuální progres vývoje klíčových modulů nového kancelářského systému. Všechny plánované cíle pro Q3 byly splněny v předstihu a v rámci schváleného rozpočtu.</p>
      <h2>2. Přehled klíčových milníků</h2>
      <table>
        <thead>
          <tr>
            <th>Milník</th>
            <th>Zodpovědná osoba</th>
            <th>Termín</th>
            <th>Stav</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Architektura jádra</td>
            <td>Martin Dvořák</td>
            <td>15.08.2026</td>
            <td>Dokončeno</td>
          </tr>
          <tr>
            <td>Implementace formátování</td>
            <td>Lucie Králová</td>
            <td>30.09.2026</td>
            <td>Dokončeno</td>
          </tr>
          <tr>
            <td>Export do DOCX a PDF</td>
            <td>Jakub Černý</td>
            <td>15.10.2026</td>
            <td>Ve finálním testu</td>
          </tr>
          <tr>
            <td>Uživatelské akceptační testy</td>
            <td>Elena Pokorná</td>
            <td>01.11.2026</td>
            <td>V přípravě</td>
          </tr>
        </tbody>
      </table>
      <h2>3. Rizika a doporučení</h2>
      <p>Tým identifikoval následující oblasti vyžadující zvýšenou pozornost:</p>
      <ol>
        <li>Zajištění kompatibility exportovaných souborů se staršími verzemi Microsoft Word (Office 2013-2016).</li>
        <li>Optimalizace rychlosti vykreslování vícestránkových rozsáhlých dokumentů (nad 100 stran).</li>
      </ol>
      <blockquote>Doporučení řídícího výboru: Pokračovat dle platného harmonogramu a zahájit pilotní nasazení pro vybrané uživatele od 10. listopadu.</blockquote>
    `,
  },
  {
    id: 'resume',
    name: 'Profesionální životopis (CV)',
    description: 'Přehledný životopis s dovednostmi, vzděláním a praxí.',
    content: `
      <h1 style="text-align: center;">Ing. Petra Svobodová</h1>
      <p style="text-align: center;">Senior Full-Stack Developer & Architekt | Praha, ČR<br>E-mail: petra.svobodova@dev.cz | Mobil: +420 608 987 654 | GitHub: /petrasvoboda</p>
      <hr>
      <h2>Profesní profil</h2>
      <p>Zkušená softwarová inženýrka s více než 8 lety praxe v návrhu a vývoji škálovatelných webových aplikací. Specializace na moderní frontendové architektury, cloudové integrace a uživatelský design.</p>
      <h2>Pracovní zkušenosti</h2>
      <p><strong>Lead Frontend Architect | TechFlow Innovations (2022 – současnost)</strong></p>
      <ul>
        <li>Vedení týmu 7 vývojářů na projektu mezinárodního editačního portálu.</li>
        <li>Přechod na moderní stack s 40% zrychlením odezvy a 99.9% dostupností.</li>
      </ul>
      <p><strong>Senior Software Engineer | SoftData Global (2018 – 2022)</strong></p>
      <ul>
        <li>Vývoj REST API a mikroservis v prostředí TypeScript a Node.js.</li>
        <li>Spolupráce na integracích platebních bran a exportních dokumentových enginů.</li>
      </ul>
      <h2>Vzdělání</h2>
      <p><strong>České vysoké učení technické v Praze (ČVUT FEL)</strong><br>Magisterský obor: Otevřená informatika (Ing., 2013 – 2018)</p>
      <h2>Dovednosti</h2>
      <table>
        <tbody>
          <tr>
            <td><strong>Jazyky & Frameworky</strong></td>
            <td>TypeScript, React, Node.js, Next.js, Python, Tailwind CSS</td>
          </tr>
          <tr>
            <td><strong>Nástroje & DevOps</strong></td>
            <td>Git, Docker, Kubernetes, AWS, CI/CD, Vite, Webpack</td>
          </tr>
          <tr>
            <td><strong>Jazykové znalosti</strong></td>
            <td>Čeština (rodilý mluvčí), Angličtina (C1 - plynule), Němčina (B1)</td>
          </tr>
        </tbody>
      </table>
    `,
  },
  {
    id: 'blank',
    name: 'Prázdný dokument',
    description: 'Čistý list papíru připravený k okamžitému psaní.',
    content: '<p></p>',
  }
];
