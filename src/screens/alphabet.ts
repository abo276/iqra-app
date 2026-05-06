import LETTERS from '../data/alphabet.json';
import { addXP, markLetterLearned, getState, showToast } from '../main';

export function initAlphabet(): void {
  const container = document.getElementById('sc-alphabet');
  if (!container) return;
  renderAlphabetList(container);
}

function renderAlphabetList(container: HTMLElement): void {
  const { learnedLetters } = getState();

  container.innerHTML = `
    <div style="padding:16px">
      <div class="ctag">Das arabische Alphabet</div>
      <div class="ctitle">الحروف الهجائية</div>
      <div style="font-family:var(--de-font);font-size:.8rem;color:var(--muted);margin-bottom:16px">
        Tippe auf einen Buchstaben um Details zu sehen · ${learnedLetters.size}/28 gelernt
      </div>
      <div class="alpha-grid">
        ${LETTERS.map(l => `
          <div class="alpha-card${learnedLetters.has(l.letter) ? ' learned' : ''}" data-letter="${l.letter}">
            <div class="alpha-letter">${l.letter}</div>
            <div class="alpha-name">${l.name}</div>
            <div class="alpha-sound">${l.sound}</div>
          </div>`).join('')}
      </div>
    </div>
    <div id="letterDetail"></div>`;

  container.querySelectorAll<HTMLElement>('.alpha-card').forEach(card => {
    card.addEventListener('click', () => {
      const letter = card.dataset.letter!;
      const l = LETTERS.find(x => x.letter === letter)!;
      showLetterDetail(letter, l);
    });
  });
}

function showLetterDetail(letter: string, l: typeof LETTERS[0]): void {
  const detail = document.getElementById('letterDetail');
  if (!detail) return;
  const { learnedLetters } = getState();
  const learned = learnedLetters.has(letter);

  detail.innerHTML = `
    <div style="position:fixed;inset:0;z-index:500;background:rgba(15,23,42,.7);display:flex;align-items:flex-end;justify-content:center" id="letterOverlay">
      <div style="background:white;border-radius:24px 24px 0 0;padding:28px 24px;width:100%;max-width:480px;animation:slideUp .3s ease">
        <div style="text-align:center;margin-bottom:20px">
          <div style="font-family:var(--ar-font);font-size:4rem;color:#92400e;line-height:1;margin-bottom:8px">${l.letter}</div>
          <div style="font-family:var(--de-font);font-size:1.3rem;font-weight:700;color:#1c1917">${l.name}</div>
          <div style="font-family:var(--de-font);font-size:.85rem;color:#92400e;margin-top:4px">Aussprache: <strong>${l.sound}</strong></div>
        </div>

        <div style="background:#fef9e7;border-radius:12px;padding:14px;margin-bottom:16px">
          <div style="font-family:var(--de-font);font-size:.6rem;color:#92400e;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Formen im Wort</div>
          <div style="display:flex;gap:12px;justify-content:center">
            ${formBox('Einzeln', l.isolated)}
            ${formBox('Wortanfang', l.initial)}
            ${formBox('Wortmitte', l.medial)}
            ${formBox('Wortende', l.final)}
          </div>
        </div>

        <div style="background:#f0fdf4;border-radius:12px;padding:12px;margin-bottom:16px">
          <div style="font-family:var(--de-font);font-size:.6rem;color:#166534;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px">Beispiel aus dem Koran</div>
          <div style="font-family:var(--ar-font);font-size:1.6rem;color:#1c1917;text-align:center;direction:rtl">${l.example}</div>
          <div style="font-family:var(--de-font);font-size:.8rem;color:var(--muted);text-align:center;margin-top:4px">${l.example_de}</div>
        </div>

        <div style="display:flex;gap:10px">
          <button id="markLearnedBtn" style="flex:1;padding:13px;border:none;border-radius:12px;cursor:pointer;font-family:var(--ui-font);font-size:.9rem;font-weight:700;background:${learned ? '#f1f5f9' : 'linear-gradient(135deg,#92400e,#f59e0b)'};color:${learned ? 'var(--muted)' : 'white'}">
            ${learned ? '✅ Gelernt' : '✓ Als gelernt markieren'}
          </button>
          <button id="closeLetterBtn" style="padding:13px 18px;background:#f1f5f9;border:none;border-radius:12px;cursor:pointer;font-family:var(--ui-font);color:var(--muted)">✕</button>
        </div>
      </div>
    </div>`;

  document.getElementById('closeLetterBtn')?.addEventListener('click', () => detail.innerHTML = '');
  document.getElementById('letterOverlay')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) detail.innerHTML = ''; });
  document.getElementById('markLearnedBtn')?.addEventListener('click', () => {
    if (!learnedLetters.has(letter)) {
      markLetterLearned(letter);
      addXP(10);
      showToast(`✨ ${l.name} gelernt! +10 XP`);
    }
    detail.innerHTML = '';
    const sc = document.getElementById('sc-alphabet');
    if (sc) renderAlphabetList(sc);
  });
}

function formBox(label: string, form: string): string {
  return `<div style="text-align:center;flex:1">
    <div style="font-family:var(--ar-font);font-size:1.5rem;color:#1c1917;min-height:36px;line-height:1.2">${form}</div>
    <div style="font-family:var(--de-font);font-size:.55rem;color:var(--muted);margin-top:2px">${label}</div>
  </div>`;
}
