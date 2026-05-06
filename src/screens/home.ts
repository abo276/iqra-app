import { getState } from '../main';

export function initHome(): void {
  const container = document.getElementById('sc-home');
  if (!container) return;

  const { xp, learnedLetters, learnedWords } = getState();
  const name = localStorage.getItem('iqra_name') ?? 'Schüler';

  container.innerHTML = `
    <div style="padding:16px">
      <!-- Hero -->
      <div style="background:linear-gradient(135deg,#1a0d00,#92400e);border-radius:22px;padding:24px 20px;color:white;margin-bottom:16px;position:relative;overflow:hidden">
        <div style="position:absolute;top:-30px;right:-30px;width:120px;height:120px;border-radius:50%;background:radial-gradient(circle,rgba(251,191,36,.2),transparent)"></div>
        <div style="font-size:.7rem;color:rgba(255,255,255,.5);letter-spacing:2px;text-transform:uppercase;margin-bottom:6px;font-family:var(--de-font)">Willkommen zurück</div>
        <div style="font-family:var(--ar-font);font-size:1.4rem;font-weight:700;color:#fbbf24;margin-bottom:4px">${name}</div>
        <div style="font-family:var(--de-font);font-size:.8rem;color:rgba(255,255,255,.6);margin-bottom:16px">Auf dem Weg zum Koran-Verstehen ✨</div>
        <div style="display:flex;gap:20px">
          <div style="text-align:center">
            <div style="font-family:var(--de-font);font-size:1.4rem;font-weight:900;color:#fbbf24">${xp}</div>
            <div style="font-family:var(--de-font);font-size:.6rem;color:rgba(255,255,255,.5)">XP</div>
          </div>
          <div style="text-align:center">
            <div style="font-family:var(--de-font);font-size:1.4rem;font-weight:900;color:#fbbf24">${learnedLetters.size}</div>
            <div style="font-family:var(--de-font);font-size:.6rem;color:rgba(255,255,255,.5)">Buchstaben</div>
          </div>
          <div style="text-align:center">
            <div style="font-family:var(--de-font);font-size:1.4rem;font-weight:900;color:#fbbf24">${learnedWords.size}</div>
            <div style="font-family:var(--de-font);font-size:.6rem;color:rgba(255,255,255,.5)">Wörter</div>
          </div>
        </div>
      </div>

      <!-- Quick Start -->
      <div style="font-family:var(--de-font);font-size:.6rem;color:var(--muted);letter-spacing:2px;text-transform:uppercase;margin-bottom:10px">Schnellstart</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">
        ${quickBtn('🔤', 'alphabet', 'Arabisches Alphabet', '28 Buchstaben', '#92400e')}
        ${quickBtn('📖', 'vocab', 'Koran-Wortschatz', '50 Kernwörter', '#166534')}
        ${quickBtn('📿', 'suras', 'Suren verstehen', 'Vers für Vers', '#1e3a8a')}
        ${quickBtn('🎵', 'tajweed', 'Tajweed-Regeln', 'Richtig rezitieren', '#d97706')}
        ${quickBtn('🎯', 'quiz', 'Quiz', 'Wissen testen', '#7c3aed')}
      </div>

      <!-- Tipp -->
      <div style="background:#fef9e7;border:1px solid #fcd34d;border-radius:14px;padding:14px 16px">
        <div style="font-family:var(--de-font);font-size:.6rem;color:#92400e;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px">Tipp des Tages</div>
        <div style="font-family:var(--de-font);font-size:.85rem;color:#1c1917;line-height:1.5">
          ${getDailyTip()}
        </div>
      </div>
    </div>`;

  container.querySelectorAll<HTMLElement>('[data-goto]').forEach(el => {
    el.addEventListener('click', () => {
      const tab = el.dataset.goto!;
      document.querySelector<HTMLElement>(`.bn[data-tab="${tab}"]`)?.click();
    });
  });
}

function quickBtn(icon: string, tab: string, label: string, sub: string, color: string): string {
  return `<div data-goto="${tab}" style="background:white;border:2px solid #e2e8f0;border-top:3px solid ${color};border-radius:16px;padding:16px 12px;cursor:pointer;text-align:center;transition:all .2s;box-shadow:0 2px 8px rgba(0,0,0,.04)">
    <div style="font-size:1.8rem;margin-bottom:6px">${icon}</div>
    <div style="font-family:var(--de-font);font-size:.82rem;font-weight:700;color:#0f172a">${label}</div>
    <div style="font-family:var(--de-font);font-size:.65rem;color:var(--muted)">${sub}</div>
  </div>`;
}

const TIPS = [
  "Das arabische Alphabet hat 28 Buchstaben — beginne mit den einfachsten: ب ت ث",
  "Das Wort 'اللَّه' kommt über 2.000 Mal im Koran vor.",
  "Lerne täglich 3 neue Wörter — nach 2 Monaten kennst du die häufigsten Koran-Wörter.",
  "Die Sure Al-Fatiha wird in jedem Gebet mindestens 17x rezitiert.",
  "Das arabische Wurzel-System: Aus 3 Buchstaben entstehen Hunderte Wörter.",
  "رَحْمَان und رَحِيم kommen beide von der Wurzel رحم (Barmherzigkeit).",
  "Übe täglich 10 Minuten — Beständigkeit ist wichtiger als lange Sessions.",
  "Das Wort صَبْر (Sabr / Geduld) erscheint im Koran über 90 Mal.",
];

function getDailyTip(): string {
  const day = Math.floor(Date.now() / 86400000);
  return TIPS[day % TIPS.length];
}
