import SURAS from '../data/suras.json';
import { addXP, getState, showToast } from '../main';
import { bindVerseBtns, bindWordChips, stopCurrentAudio } from '../utils/speak';

export function initSuras(): void {
  const container = document.getElementById('sc-suras');
  if (!container) return;

  container.innerHTML = `
    <div style="padding:16px">
      <div class="ctag">Suren verstehen</div>
      <div class="ctitle">تفسير السور</div>
      <div style="font-family:var(--de-font);font-size:.8rem;color:var(--muted);margin-bottom:16px">
        Vers für Vers — jedes Wort mit Übersetzung
      </div>
      ${SURAS.map(s => `
        <div style="background:var(--card);border-radius:16px;border:1.5px solid var(--border);border-top:3px solid #92400e;padding:16px;margin-bottom:12px;cursor:pointer;transition:all .2s;box-shadow:0 2px 8px rgba(0,0,0,.04)" data-sura="${s.number}">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
            <div>
              <div style="font-family:var(--ar-font);font-size:1.2rem;font-weight:700;color:#92400e;direction:rtl">${s.name_ar}</div>
              <div style="font-family:var(--de-font);font-size:.78rem;color:var(--muted);margin-top:2px">${s.name_de}</div>
            </div>
            <div style="text-align:right">
              <div style="background:#fef9e7;border:1px solid #fcd34d;border-radius:10px;padding:3px 10px;font-family:var(--de-font);font-size:.7rem;font-weight:700;color:#92400e;margin-bottom:4px">Sure ${s.number}</div>
              <div style="font-family:var(--de-font);font-size:.62rem;color:var(--muted)">${(s as any).verses_count} Verse</div>
            </div>
          </div>
          <div style="background:#fef9e7;border-radius:8px;padding:8px 10px;font-family:var(--de-font);font-size:.72rem;color:#92400e;margin-bottom:8px">
            💡 ${(s as any).theme}
          </div>
          <div style="font-family:var(--ar-font);font-size:1rem;color:var(--muted);direction:rtl;line-height:1.7;text-align:right">
            ${s.verses[0].ar}
          </div>
        </div>`).join('')}
      <div id="suraDetail"></div>
    </div>`;

  container.querySelectorAll<HTMLElement>('[data-sura]').forEach(el => {
    el.addEventListener('click', () => {
      const num = Number(el.dataset.sura);
      const sura = SURAS.find(s => s.number === num)!;
      showSura(sura);
    });
  });
}

function showSura(sura: typeof SURAS[0]): void {
  const detail = document.getElementById('suraDetail');
  if (!detail) return;

  detail.innerHTML = `
    <div style="position:fixed;inset:0;z-index:500;background:rgba(15,23,42,.8);display:flex;flex-direction:column;overflow-y:auto" id="suraOverlay">
      <div style="background:white;min-height:100%;padding:20px 16px;max-width:720px;margin:0 auto;width:100%">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
          <button id="closeSura" style="background:#f1f5f9;border:none;border-radius:10px;padding:8px 14px;cursor:pointer;font-family:var(--ui-font);font-size:.82rem">← Zurück</button>
          <div>
            <div style="font-family:var(--ar-font);font-size:1.2rem;font-weight:700;color:#92400e">${sura.name_ar}</div>
            <div style="font-family:var(--de-font);font-size:.75rem;color:var(--muted)">${sura.name_de}</div>
          </div>
        </div>

        ${sura.verses.map(v => `
          <div style="margin-bottom:20px;background:#fdf8f0;border-radius:14px;padding:16px;border-left:3px solid #fbbf24">
            <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px">
              <div style="font-family:var(--ar-font);font-size:1.8rem;color:#1c1917;direction:rtl;line-height:2;text-align:right;flex:1">
                ${v.ar}
                <span style="font-size:.85rem;color:#92400e;margin-right:6px;font-family:var(--de-font)">﴿${v.verse}﴾</span>
              </div>
              <button class="spk-verse" data-surah="${sura.number}" data-verse="${v.verse}"
                style="background:rgba(146,64,14,.1);border:1.5px solid rgba(146,64,14,.25);
                border-radius:50%;width:38px;height:38px;display:inline-flex;align-items:center;
                justify-content:center;cursor:pointer;font-size:.9rem;padding:0;flex-shrink:0;
                transition:all .2s">🔊</button>
            </div>
            <div style="font-family:var(--de-font);font-size:.88rem;color:#374151;margin-bottom:12px;font-style:italic;line-height:1.5">${v.de}</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;direction:rtl">
              ${v.words.map((w, wi) => `
                <div class="word-chip"
                  data-surah="${sura.number}" data-verse="${v.verse}" data-word="${wi + 1}" data-ar="${encodeURIComponent(w.ar)}"
                  style="background:white;border:1px solid #e2e8f0;border-radius:8px;padding:6px 10px;text-align:center;cursor:pointer;transition:all .2s;user-select:none">
                  <div style="font-family:var(--ar-font);font-size:1.05rem;color:#1c1917">${w.ar}</div>
                  <div style="font-family:var(--de-font);font-size:.62rem;color:#92400e;margin-top:2px">${w.de}</div>
                </div>`).join('')}
            </div>
          </div>`).join('')}

        <button id="markSuraBtn" style="width:100%;padding:13px;background:linear-gradient(135deg,#92400e,#f59e0b);color:white;border:none;border-radius:12px;font-family:var(--ui-font);font-size:.9rem;font-weight:700;cursor:pointer;margin-top:10px">
          ✓ Sure abgeschlossen (+30 XP)
        </button>
      </div>
    </div>`;

  bindVerseBtns(detail);
  bindWordChips(detail);
  document.getElementById('closeSura')?.addEventListener('click', () => { stopCurrentAudio(); detail.innerHTML = ''; });
  document.getElementById('markSuraBtn')?.addEventListener('click', () => {
    addXP(30);
    showToast(`🕌 Sure ${sura.name_ar} abgeschlossen! +30 XP`);
    detail.innerHTML = '';
  });
}
