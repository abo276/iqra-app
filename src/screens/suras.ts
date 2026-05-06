import SURAS from '../data/suras.json';
import { addXP, getState, showToast } from '../main';

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
        <div style="background:var(--card);border-radius:16px;border:1.5px solid var(--border);padding:16px;margin-bottom:12px;cursor:pointer;transition:all .2s;box-shadow:0 2px 8px rgba(0,0,0,.04)" data-sura="${s.number}">
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div>
              <div style="font-family:var(--ar-font);font-size:1.2rem;font-weight:700;color:#92400e;direction:rtl">${s.name_ar}</div>
              <div style="font-family:var(--de-font);font-size:.8rem;color:var(--muted);margin-top:2px">${s.name_de}</div>
            </div>
            <div style="background:#fef9e7;border:1px solid #fcd34d;border-radius:10px;padding:4px 12px;font-family:var(--de-font);font-size:.75rem;font-weight:700;color:#92400e">
              Sure ${s.number}
            </div>
          </div>
          <div style="margin-top:10px;font-family:var(--ar-font);font-size:.85rem;color:var(--muted);direction:rtl;line-height:1.6">
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
            <div style="font-family:var(--ar-font);font-size:1.6rem;color:#1c1917;direction:rtl;line-height:1.8;margin-bottom:12px;text-align:right">
              ${v.ar}
              <span style="font-size:.9rem;color:#92400e;margin-right:8px">(${v.verse})</span>
            </div>
            <div style="font-family:var(--de-font);font-size:.85rem;color:#374151;margin-bottom:12px;font-style:italic">${v.de}</div>
            <div style="display:flex;flex-wrap:wrap;gap:6px;direction:rtl">
              ${v.words.map(w => `
                <div style="background:white;border:1px solid #e2e8f0;border-radius:8px;padding:6px 10px;text-align:center;cursor:pointer;transition:all .2s" class="word-chip">
                  <div style="font-family:var(--ar-font);font-size:1rem;color:#1c1917">${w.ar}</div>
                  <div style="font-family:var(--de-font);font-size:.6rem;color:#92400e;margin-top:2px">${w.de}</div>
                </div>`).join('')}
            </div>
          </div>`).join('')}

        <button id="markSuraBtn" style="width:100%;padding:13px;background:linear-gradient(135deg,#92400e,#f59e0b);color:white;border:none;border-radius:12px;font-family:var(--ui-font);font-size:.9rem;font-weight:700;cursor:pointer;margin-top:10px">
          ✓ Sure abgeschlossen (+30 XP)
        </button>
      </div>
    </div>`;

  document.getElementById('closeSura')?.addEventListener('click', () => detail.innerHTML = '');
  document.getElementById('markSuraBtn')?.addEventListener('click', () => {
    addXP(30);
    showToast(`🕌 Sure ${sura.name_ar} abgeschlossen! +30 XP`);
    detail.innerHTML = '';
  });
}
