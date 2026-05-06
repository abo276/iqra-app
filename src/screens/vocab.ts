import VOCAB from '../data/vocab.json';
import { addXP, markWordLearned, getState, showToast } from '../main';

export function initVocab(): void {
  const container = document.getElementById('sc-vocab');
  if (!container) return;

  const { learnedWords } = getState();
  const categories = [...new Set(VOCAB.map(v => v.category))];

  container.innerHTML = `
    <div style="padding:16px">
      <div class="ctag">Koran-Wortschatz</div>
      <div class="ctitle">المفردات القرآنية</div>
      <div style="font-family:var(--de-font);font-size:.8rem;color:var(--muted);margin-bottom:14px">
        ${learnedWords.size}/${VOCAB.length} Wörter gelernt
      </div>
      <div style="height:5px;background:#e2e8f0;border-radius:3px;margin-bottom:16px;overflow:hidden">
        <div style="height:100%;width:${Math.round(learnedWords.size/VOCAB.length*100)}%;background:linear-gradient(90deg,#92400e,#fbbf24);border-radius:3px;transition:width .5s"></div>
      </div>

      ${categories.map(cat => {
        const words = VOCAB.filter(v => v.category === cat);
        const catDone = words.filter(v => learnedWords.has(v.ar)).length;
        return `
          <div style="margin-bottom:14px">
            <div style="font-family:var(--de-font);font-size:.65rem;color:#92400e;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;display:flex;justify-content:space-between">
              <span>${catLabel(cat)}</span>
              <span style="color:var(--muted)">${catDone}/${words.length}</span>
            </div>
            ${words.map(w => `
              <div class="vrow${learnedWords.has(w.ar) ? ' learned' : ''}" data-ar="${encodeURIComponent(w.ar)}">
                <div style="flex:1;min-width:0">
                  <div class="v-ar">${w.ar}</div>
                  <div class="v-de">${w.de}</div>
                  <div class="v-ph">[${w.ph}]</div>
                </div>
                <div style="display:flex;gap:6px;align-items:center">
                  <button class="spk" data-word="${encodeURIComponent(w.ar)}">🔊</button>
                  <button class="learn-word-btn" data-ar="${encodeURIComponent(w.ar)}"
                    style="background:none;border:none;font-size:1.1rem;cursor:pointer;padding:4px">
                    ${learnedWords.has(w.ar) ? '✅' : '○'}
                  </button>
                </div>
              </div>`).join('')}
          </div>`;
      }).join('')}
    </div>`;

  container.querySelectorAll<HTMLButtonElement>('.spk').forEach(btn => {
    btn.addEventListener('click', () => {
      const word = decodeURIComponent(btn.dataset.word!);
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(word);
        u.lang = 'ar-SA'; u.rate = 0.75;
        speechSynthesis.speak(u);
      }
    });
  });

  container.querySelectorAll<HTMLButtonElement>('.learn-word-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const ar = decodeURIComponent(btn.dataset.ar!);
      const { learnedWords } = getState();
      if (!learnedWords.has(ar)) {
        markWordLearned(ar);
        addXP(5);
        showToast('✅ Wort gelernt! +5 XP');
        btn.textContent = '✅';
        btn.closest('.vrow')?.classList.add('learned');
      }
    });
  });
}

function catLabel(cat: string): string {
  const labels: Record<string, string> = {
    grundlagen: '⭐ Grundlagen',
    glaube: '🕌 Glaube (Iman)',
    praxis: '🤲 Praxis (Ibadat)',
    koran: '📖 Koran',
    eigenschaften: '✨ Eigenschaften Allahs',
    schöpfung: '🌍 Schöpfung',
    mensch: '👤 Der Mensch',
    paradies: '🌿 Paradies',
    zeit: '⏰ Zeit',
    wissen: '💡 Wissen',
  };
  return labels[cat] ?? cat;
}
