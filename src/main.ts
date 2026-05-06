import './styles/main.css';
import { initSplash } from './screens/splash';
import { initHome } from './screens/home';
import { initAlphabet } from './screens/alphabet';
import { initVocab } from './screens/vocab';
import { initSuras } from './screens/suras';
import { initQuiz } from './screens/quiz';
import { initTajweed } from './screens/tajweed';

let xp = Number(localStorage.getItem('iqra_xp') ?? 0);
let learnedLetters = new Set<string>(JSON.parse(localStorage.getItem('iqra_letters') ?? '[]'));
let learnedWords = new Set<string>(JSON.parse(localStorage.getItem('iqra_words') ?? '[]'));

export function getState() { return { xp, learnedLetters, learnedWords }; }

export function addXP(n: number) {
  xp += n;
  localStorage.setItem('iqra_xp', String(xp));
  const el = document.getElementById('hdrXp');
  if (el) el.textContent = `${xp} XP`;
}

export function markLetterLearned(letter: string) {
  learnedLetters.add(letter);
  localStorage.setItem('iqra_letters', JSON.stringify([...learnedLetters]));
}

export function markWordLearned(ar: string) {
  learnedWords.add(ar);
  localStorage.setItem('iqra_words', JSON.stringify([...learnedWords]));
}

export function showToast(msg: string) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2200);
}

export function switchTab(tab: string) {
  document.querySelectorAll<HTMLElement>('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(`sc-${tab}`)?.classList.add('active');
  document.querySelectorAll<HTMLElement>('.bn').forEach(b => b.classList.remove('active'));
  document.querySelector<HTMLElement>(`.bn[data-tab="${tab}"]`)?.classList.add('active');
}

document.addEventListener('DOMContentLoaded', () => {
  initSplash(() => {
    document.getElementById('hdr')!.style.display = 'flex';
    document.getElementById('bnav')!.style.display = 'flex';
    document.getElementById('main')!.style.display = 'block';
    switchTab('home');
    initHome();
  });

  document.querySelectorAll<HTMLElement>('.bn[data-tab]').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab!;
      switchTab(tab);
      if (tab === 'alphabet') initAlphabet();
      if (tab === 'vocab') initVocab();
      if (tab === 'suras') initSuras();
      if (tab === 'quiz') initQuiz();
      if (tab === 'tajweed') initTajweed();
      if (tab === 'home') initHome();
    });
  });
});
