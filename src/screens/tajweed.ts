import RULES from '../data/tajweed.json';
import { addXP, showToast } from '../main';
import { bindSpkBtns } from '../utils/speak';

export function initTajweed(): void {
  const container = document.getElementById('sc-tajweed');
  if (!container) return;
  renderTajweedList(container);
}

function renderTajweedList(container: HTMLElement): void {
  container.innerHTML = `
    <div style="padding:16px">
      <div class="ctag">Tajweed-Grundregeln</div>
      <div class="ctitle">أحكام التجويد</div>
      <div style="background:#fef9e7;border:1px solid #fcd34d;border-radius:12px;padding:12px 14px;margin-bottom:16px">
        <div style="font-family:var(--de-font);font-size:.78rem;color:#92400e;line-height:1.6">
          📿 Tajweed bedeutet „Verschönerung" — es sind die Regeln zur korrekten Aussprache des Korans. Beginne mit den Grundregeln und höre dir die Verse genau an.
        </div>
      </div>

      ${RULES.map(r => `
        <div data-rule="${r.id}" style="background:var(--card);border-radius:16px;border:1.5px solid var(--border);border-left:4px solid ${r.color};padding:16px;margin-bottom:10px;cursor:pointer;transition:all .2s;box-shadow:0 2px 8px rgba(0,0,0,.04)">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="font-size:1.8rem;min-width:40px;text-align:center">${r.icon}</div>
            <div style="flex:1">
              <div style="font-family:var(--de-font);font-size:.9rem;font-weight:700;color:#0f172a">${r.title}</div>
              <div style="font-family:var(--ar-font);font-size:.85rem;color:${r.color};margin-top:1px">${r.title_ar}</div>
              <div style="font-family:var(--de-font);font-size:.72rem;color:var(--muted);margin-top:3px">${r.short}</div>
            </div>
            <div style="font-size:.8rem;color:var(--muted)">→</div>
          </div>
        </div>`).join('')}

      <div id="ruleDetail"></div>
    </div>`;

  container.querySelectorAll<HTMLElement>('[data-rule]').forEach(el => {
    el.addEventListener('click', () => {
      const rule = RULES.find(r => r.id === el.dataset.rule)!;
      showRule(rule);
    });
  });
}

function showRule(rule: typeof RULES[0]): void {
  const detail = document.getElementById('ruleDetail');
  if (!detail) return;

  detail.innerHTML = `
    <div style="position:fixed;inset:0;z-index:500;background:rgba(15,23,42,.8);display:flex;flex-direction:column;overflow-y:auto" id="ruleOverlay">
      <div style="background:white;min-height:100%;padding:20px 16px;max-width:720px;margin:0 auto;width:100%">

        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
          <button id="closeRule" style="background:#f1f5f9;border:none;border-radius:10px;padding:8px 14px;cursor:pointer;font-family:var(--ui-font);font-size:.82rem">← Zurück</button>
          <div>
            <div style="font-size:1.5rem">${rule.icon} <span style="font-family:var(--de-font);font-size:1rem;font-weight:700;color:#0f172a">${rule.title}</span></div>
            <div style="font-family:var(--ar-font);font-size:.9rem;color:${rule.color}">${rule.title_ar}</div>
          </div>
        </div>

        ${rule.rules.map((r, idx) => `
          <div style="background:#fdf8f0;border-radius:14px;padding:16px;margin-bottom:14px;border:1.5px solid #fde68a">

            <!-- Regel-Header -->
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
              <div style="background:${rule.color};color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;font-family:var(--de-font);font-size:.75rem;font-weight:700;flex-shrink:0">${idx + 1}</div>
              <div>
                <div style="font-family:var(--ar-font);font-size:1rem;font-weight:700;color:${rule.color}">${r.name}</div>
                <div style="font-family:var(--de-font);font-size:.75rem;color:var(--muted);margin-top:1px">${r.name_de}</div>
              </div>
            </div>

            ${r.letters.length > 0 ? `
            <!-- Buchstaben -->
            <div style="margin-bottom:10px">
              <div style="font-family:var(--de-font);font-size:.6rem;color:#92400e;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px">Buchstaben</div>
              <div style="display:flex;flex-wrap:wrap;gap:6px">
                ${r.letters.map(l => `<span style="background:white;border:1.5px solid ${rule.color};border-radius:8px;padding:4px 10px;font-family:var(--ar-font);font-size:1.2rem;color:${rule.color}">${l}</span>`).join('')}
              </div>
            </div>` : ''}

            <!-- Beispiel -->
            <div style="background:white;border-radius:10px;padding:12px;margin-bottom:10px">
              <div style="font-family:var(--de-font);font-size:.6rem;color:#92400e;letter-spacing:2px;text-transform:uppercase;margin-bottom:6px">Beispiel</div>
              <div style="font-family:var(--ar-font);font-size:1.4rem;color:#1c1917;direction:rtl;text-align:right;margin-bottom:6px">${r.example_ar}</div>
              <div style="font-family:var(--de-font);font-size:.8rem;color:var(--muted);font-style:italic">${r.example_de}</div>
              <button class="spk-ar" data-ar="${encodeURIComponent(r.example_ar)}"
                style="margin-top:8px;background:#fef9e7;border:1px solid #fcd34d;border-radius:8px;padding:5px 12px;cursor:pointer;font-family:var(--ui-font);font-size:.75rem;color:#92400e">
                🔊 Anhören
              </button>
            </div>

            <!-- Merkhilfe -->
            <div style="background:#f0fdf4;border-radius:8px;padding:10px;display:flex;gap:8px;align-items:flex-start">
              <span style="font-size:.9rem">💡</span>
              <div style="font-family:var(--de-font);font-size:.78rem;color:#166534;line-height:1.5">${r.tip}</div>
            </div>
          </div>`).join('')}

        <button id="markRuleBtn" style="width:100%;padding:13px;background:linear-gradient(135deg,#92400e,#f59e0b);color:white;border:none;border-radius:12px;font-family:var(--ui-font);font-size:.9rem;font-weight:700;cursor:pointer;margin-top:6px">
          ✓ Regel verstanden (+15 XP)
        </button>
      </div>
    </div>`;

  bindSpkBtns(detail);

  document.getElementById('closeRule')?.addEventListener('click', () => detail.innerHTML = '');
  document.getElementById('ruleOverlay')?.addEventListener('click', (e) => { if (e.target === e.currentTarget) detail.innerHTML = ''; });
  document.getElementById('markRuleBtn')?.addEventListener('click', () => {
    addXP(15);
    showToast(`📿 ${rule.title} gelernt! +15 XP`);
    detail.innerHTML = '';
  });
}
