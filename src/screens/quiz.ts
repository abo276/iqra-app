import LETTERS from '../data/alphabet.json';
import VOCAB from '../data/vocab.json';
import { addXP, getState, showToast } from '../main';

type QuizMode = 'letters' | 'vocab' | 'reverse';

interface Question {
  question: string;
  questionSub?: string;
  options: string[];
  correctIdx: number;
  isArabic?: boolean;
}

let currentMode: QuizMode = 'vocab';
let questions: Question[] = [];
let current = 0;
let score = 0;
let answered = false;

export function initQuiz(): void {
  const container = document.getElementById('sc-quiz');
  if (!container) return;
  renderModeSelect(container);
}

function renderModeSelect(container: HTMLElement): void {
  container.innerHTML = `
    <div style="padding:16px">
      <div class="ctag">Quiz</div>
      <div class="ctitle">اختبر نفسك</div>
      <div style="font-family:var(--de-font);font-size:.85rem;color:var(--muted);margin-bottom:20px">
        Teste dein Wissen — wähle einen Modus:
      </div>

      ${modeCard('letters', '🔤', 'Buchstaben-Quiz', 'Buchstabe → Name & Aussprache', '#92400e')}
      ${modeCard('vocab', '📖', 'Wort-Quiz', 'Arabisches Wort → Deutsche Bedeutung', '#166534')}
      ${modeCard('reverse', '🔄', 'Umgekehrtes Quiz', 'Deutsche Bedeutung → Arabisches Wort', '#1e3a8a')}

      <div id="quizArea" style="margin-top:20px"></div>
    </div>`;

  container.querySelectorAll<HTMLElement>('[data-mode]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentMode = btn.dataset.mode as QuizMode;
      startQuiz(document.getElementById('quizArea')!);
    });
  });
}

function modeCard(mode: string, icon: string, title: string, sub: string, color: string): string {
  return `<div data-mode="${mode}" style="background:white;border:2px solid #e2e8f0;border-left:4px solid ${color};border-radius:14px;padding:16px;margin-bottom:10px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:14px">
    <span style="font-size:1.8rem">${icon}</span>
    <div>
      <div style="font-family:var(--de-font);font-size:.9rem;font-weight:700;color:#0f172a">${title}</div>
      <div style="font-family:var(--de-font);font-size:.72rem;color:var(--muted);margin-top:2px">${sub}</div>
    </div>
    <span style="margin-left:auto;color:var(--muted)">→</span>
  </div>`;
}

function buildQuestions(mode: QuizMode): Question[] {
  if (mode === 'letters') {
    const shuffled = [...LETTERS].sort(() => Math.random() - 0.5).slice(0, 10);
    return shuffled.map(l => {
      const wrongs = LETTERS.filter(x => x.letter !== l.letter)
        .sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.name);
      const options = [...wrongs, l.name].sort(() => Math.random() - 0.5);
      return {
        question: l.letter,
        questionSub: 'Wie heißt dieser Buchstabe?',
        options,
        correctIdx: options.indexOf(l.name),
        isArabic: true,
      };
    });
  }

  if (mode === 'vocab') {
    const shuffled = [...VOCAB].sort(() => Math.random() - 0.5).slice(0, 10);
    return shuffled.map(v => {
      const wrongs = VOCAB.filter(x => x.ar !== v.ar)
        .sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.de);
      const options = [...wrongs, v.de].sort(() => Math.random() - 0.5);
      return {
        question: v.ar,
        questionSub: v.ph,
        options,
        correctIdx: options.indexOf(v.de),
        isArabic: true,
      };
    });
  }

  // reverse
  const shuffled = [...VOCAB].sort(() => Math.random() - 0.5).slice(0, 10);
  return shuffled.map(v => {
    const wrongs = VOCAB.filter(x => x.ar !== v.ar)
      .sort(() => Math.random() - 0.5).slice(0, 3).map(x => x.ar);
    const options = [...wrongs, v.ar].sort(() => Math.random() - 0.5);
    return {
      question: v.de,
      questionSub: `Wurzel: ${v.root}`,
      options,
      correctIdx: options.indexOf(v.ar),
      isArabic: false,
    };
  });
}

function startQuiz(area: HTMLElement): void {
  questions = buildQuestions(currentMode);
  current = 0;
  score = 0;
  answered = false;
  renderQuestion(area);
}

function renderQuestion(area: HTMLElement): void {
  if (current >= questions.length) { renderResult(area); return; }
  const q = questions[current];
  const pct = Math.round((current / questions.length) * 100);
  answered = false;

  area.innerHTML = `
    <div style="animation:slideUp .25s ease">
      <!-- Fortschritt -->
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:16px">
        <div style="flex:1;height:5px;background:#e2e8f0;border-radius:3px;overflow:hidden">
          <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,#92400e,#fbbf24);border-radius:3px;transition:width .3s"></div>
        </div>
        <span style="font-family:var(--de-font);font-size:.72rem;color:var(--muted)">${current + 1}/${questions.length}</span>
        <span style="font-family:var(--de-font);font-size:.72rem;font-weight:700;color:#166534">${score} ✓</span>
      </div>

      <!-- Frage -->
      <div style="background:linear-gradient(135deg,#1a0d00,#92400e);border-radius:20px;padding:28px 20px;text-align:center;margin-bottom:18px;box-shadow:0 8px 24px rgba(146,64,14,.25)">
        <div style="font-family:${q.isArabic ? 'var(--ar-font)' : 'var(--de-font)'};font-size:${q.isArabic ? '2.4rem' : '1.4rem'};font-weight:700;color:white;line-height:1.2;direction:${q.isArabic ? 'rtl' : 'ltr'}">${q.question}</div>
        ${q.questionSub ? `<div style="font-family:var(--de-font);font-size:.78rem;color:rgba(255,255,255,.5);margin-top:8px">${q.questionSub}</div>` : ''}
      </div>

      <!-- Optionen -->
      <div style="display:flex;flex-direction:column;gap:8px">
        ${q.options.map((opt, i) => `
          <button class="quiz-opt" data-idx="${i}"
            style="padding:14px 16px;border:2px solid #e2e8f0;border-radius:12px;
            background:white;cursor:pointer;font-family:${currentMode === 'reverse' ? 'var(--ar-font)' : 'var(--de-font)'};
            font-size:${currentMode === 'reverse' ? '1.2rem' : '.9rem'};color:#0f172a;
            transition:all .2s;text-align:${currentMode === 'reverse' ? 'right' : 'center'};
            direction:${currentMode === 'reverse' ? 'rtl' : 'ltr'}">
            ${opt}
          </button>`).join('')}
      </div>

      <div id="quizFeedback" style="min-height:20px;margin-top:10px"></div>
      <button id="quizNext" style="display:none;width:100%;padding:13px;margin-top:8px;background:linear-gradient(135deg,#92400e,#fbbf24);color:white;border:none;border-radius:12px;font-family:var(--ui-font);font-size:.9rem;font-weight:700;cursor:pointer">
        ${current + 1 < questions.length ? 'Weiter →' : 'Ergebnis ★'}
      </button>
    </div>`;

  area.querySelectorAll<HTMLButtonElement>('.quiz-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      const idx = Number(btn.dataset.idx);
      const correct = idx === q.correctIdx;

      area.querySelectorAll<HTMLButtonElement>('.quiz-opt').forEach((b, i) => {
        b.disabled = true;
        if (i === q.correctIdx) { b.style.background = '#dcfce7'; b.style.borderColor = '#22c55e'; b.style.color = '#166534'; }
        else if (i === idx) { b.style.background = '#fee2e2'; b.style.borderColor = '#f87171'; b.style.color = '#dc2626'; }
      });

      if (correct) {
        score++;
        addXP(5);
        showToast('✅ Richtig! +5 XP');
      } else {
        const correctOpt = q.options[q.correctIdx];
        const fb = document.getElementById('quizFeedback');
        if (fb) fb.innerHTML = `<div style="background:#fef9e7;border:1px solid #fcd34d;border-radius:8px;padding:8px 12px;font-family:var(--de-font);font-size:.8rem;color:#92400e">💡 Richtige Antwort: <strong>${correctOpt}</strong></div>`;
      }

      const nb = document.getElementById('quizNext');
      if (nb) nb.style.display = 'block';
    });
  });

  document.getElementById('quizNext')?.addEventListener('click', () => { current++; renderQuestion(area); });
}

function renderResult(area: HTMLElement): void {
  const pct = Math.round((score / questions.length) * 100);
  const bonus = pct >= 80 ? 20 : pct >= 60 ? 10 : 5;
  addXP(bonus);
  const emoji = pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '💪';
  const msg = pct >= 80 ? 'Ausgezeichnet! Ma schaa Allah!' : pct >= 60 ? 'Gut gemacht! Weiter üben.' : 'Noch etwas üben — du schaffst das!';

  area.innerHTML = `
    <div style="text-align:center;padding:20px 10px;animation:popIn .4s ease">
      <div style="font-size:3.5rem;margin-bottom:12px">${emoji}</div>
      <div style="font-family:var(--de-font);font-size:3rem;font-weight:900;color:#92400e;margin-bottom:4px">${score}/${questions.length}</div>
      <div style="font-family:var(--de-font);font-size:.9rem;color:var(--muted);margin-bottom:6px">${pct}% richtig · +${bonus} XP Bonus</div>
      <div style="font-family:var(--de-font);font-size:.85rem;color:#1c1917;margin-bottom:20px">${msg}</div>
      <div style="display:flex;gap:10px;justify-content:center">
        <button id="quizRetry" style="padding:12px 20px;background:linear-gradient(135deg,#92400e,#fbbf24);color:white;border:none;border-radius:12px;font-family:var(--ui-font);font-size:.85rem;font-weight:700;cursor:pointer">🔄 Nochmal</button>
        <button id="quizMenu" style="padding:12px 20px;background:#f1f5f9;border:none;border-radius:12px;font-family:var(--ui-font);font-size:.85rem;color:var(--muted);cursor:pointer">← Menü</button>
      </div>
    </div>`;

  document.getElementById('quizRetry')?.addEventListener('click', () => startQuiz(area));
  document.getElementById('quizMenu')?.addEventListener('click', () => {
    const sc = document.getElementById('sc-quiz');
    if (sc) renderModeSelect(sc);
  });
}
