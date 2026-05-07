import LETTERS from '../data/alphabet.json';
import { addXP, markLetterLearned, getState, showToast } from '../main';
import { speakAr, spkBtn, bindSpkBtns } from '../utils/speak';

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
        🔊 = Anhören · Tippe auf Karte = Details · ${learnedLetters.size}/28 gelernt
      </div>
      <div class="alpha-grid">
        ${LETTERS.map(l => `
          <div class="alpha-card${learnedLetters.has(l.letter) ? ' learned' : ''}" data-letter="${l.letter}" style="position:relative">
            <div class="alpha-letter">${l.letter}</div>
            <div class="alpha-name">${l.name}</div>
            <div class="alpha-sound">${l.sound}</div>
            <button class="spk-ar" data-ar="${encodeURIComponent(l.name_ar)}"
              style="position:absolute;top:5px;right:5px;background:rgba(146,64,14,.12);
              border:1px solid rgba(146,64,14,.2);border-radius:50%;width:24px;height:24px;
              display:flex;align-items:center;justify-content:center;cursor:pointer;
              font-size:.65rem;padding:0;line-height:1">🔊</button>
          </div>`).join('')}
      </div>
    </div>
    <div id="letterDetail"></div>`;

  bindSpkBtns(container);

  container.querySelectorAll<HTMLElement>('.alpha-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).classList.contains('spk-ar')) return;
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

        <!-- Buchstabe + Hören -->
        <div style="text-align:center;margin-bottom:20px">
          <div style="display:flex;align-items:center;justify-content:center;gap:14px;margin-bottom:8px">
            <div style="font-family:var(--ar-font);font-size:4rem;color:#92400e;line-height:1">${l.letter}</div>
            ${spkBtn(l.name_ar, '🔊')}
          </div>
          <div style="font-family:var(--de-font);font-size:1.3rem;font-weight:700;color:#1c1917">${l.name}</div>
          <div style="font-family:var(--de-font);font-size:.85rem;color:#92400e;margin-top:4px">Aussprache: <strong>${l.sound}</strong></div>
        </div>

        <!-- Formen im Wort -->
        <div style="background:#fef9e7;border-radius:12px;padding:14px;margin-bottom:16px">
          <div style="font-family:var(--de-font);font-size:.6rem;color:#92400e;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">Formen im Wort</div>
          <div style="display:flex;gap:12px;justify-content:center">
            ${formBox('Einzeln', l.isolated, l.name_ar)}
            ${formBox('Wortanfang', l.initial, l.name_ar)}
            ${formBox('Wortmitte', l.medial, l.name_ar)}
            ${formBox('Wortende', l.final, l.name_ar)}
          </div>
        </div>

        <!-- Koran-Beispiel -->
        <div style="background:#f0fdf4;border-radius:12px;padding:12px;margin-bottom:16px">
          <div style="font-family:var(--de-font);font-size:.6rem;color:#166534;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px">Beispiel aus dem Koran</div>
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div style="font-family:var(--ar-font);font-size:1.6rem;color:#1c1917;direction:rtl;flex:1;text-align:center">${l.example}</div>
            ${spkBtn(l.example)}
          </div>
          <div style="font-family:var(--de-font);font-size:.8rem;color:var(--muted);text-align:center;margin-top:4px">${l.example_de}</div>
        </div>

        <!-- Buttons -->
        <div style="display:flex;gap:10px">
          <button id="markLearnedBtn" style="flex:1;padding:13px;border:none;border-radius:12px;cursor:pointer;font-family:var(--ui-font);font-size:.9rem;font-weight:700;background:${learned ? '#f1f5f9' : 'linear-gradient(135deg,#92400e,#f59e0b)'};color:${learned ? 'var(--muted)' : 'white'}">
            ${learned ? '✅ Gelernt' : '✓ Als gelernt markieren'}
          </button>
          <button id="closeLetterBtn" style="padding:13px 18px;background:#f1f5f9;border:none;border-radius:12px;cursor:pointer;font-family:var(--ui-font);color:var(--muted)">✕</button>
        </div>
      </div>
    </div>`;

  bindSpkBtns(detail);
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

function formBox(label: string, form: string, nameAr: string): string {
  return `<div class="spk-ar" data-ar="${encodeURIComponent(nameAr)}"
    style="text-align:center;flex:1;cursor:pointer;border-radius:8px;padding:4px;transition:background .2s;user-select:none">
    <div style="font-family:var(--ar-font);font-size:1.5rem;color:#1c1917;min-height:36px;line-height:1.2">${form}</div>
    <div style="font-family:var(--de-font);font-size:.55rem;color:var(--muted);margin-top:2px">${label}</div>
  </div>`;
}
