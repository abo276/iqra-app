import { showToast } from '../main';

// ── MP3-Audio-Player ──────────────────────────────────────────────────────
let _currentAudio: HTMLAudioElement | null = null;
let _currentBtn: HTMLElement | null = null;

function _resetBtn(): void {
  if (_currentBtn) {
    _currentBtn.textContent = '🔊';
    _currentBtn.style.background = 'rgba(146,64,14,.1)';
    _currentBtn = null;
  }
}

function _playMp3(url: string, btn?: HTMLElement, fallback?: () => void): void {
  if (_currentAudio) { _currentAudio.pause(); _currentAudio = null; _resetBtn(); }

  const audio = new Audio(url);
  _currentAudio = audio;
  _currentBtn = btn ?? null;

  if (btn) { btn.textContent = '⏸'; btn.style.background = 'rgba(146,64,14,.3)'; }

  audio.onended = () => { if (_currentAudio === audio) { _currentAudio = null; _resetBtn(); } };
  audio.onerror = () => {
    if (_currentAudio === audio) { _currentAudio = null; _resetBtn(); }
    if (fallback) fallback(); else showToast('⚠️ Audio konnte nicht geladen werden');
  };
  audio.play().catch(() => {
    _currentAudio = null; _resetBtn();
    if (fallback) fallback(); else showToast('⚠️ Bitte zuerst eine andere Taste drücken');
  });
}

// ── Arabisch-Audio: Google Translate TTS (kein Sprachpaket nötig) ─────────
export function speakAr(text: string, rate = 0.7): void {
  const url = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ar&client=gtx&ttsspeed=${rate}`;
  _playMp3(url, undefined, () => showToast('⚠️ Internetverbindung prüfen'));
}

// ── Ganzen Vers abspielen (everyayah.com — Alafasy 128kbps) ───────────────
export function speakVerse(surahNum: number, verseNum: number, btn?: HTMLElement): void {
  if (_currentAudio && !_currentAudio.paused) {
    _currentAudio.pause(); _currentAudio = null; _resetBtn(); return;
  }
  const s = String(surahNum).padStart(3, '0');
  const v = String(verseNum).padStart(3, '0');
  _playMp3(`https://everyayah.com/data/Alafasy_128kbps/${s}${v}.mp3`, btn, () => {
    showToast('⚠️ Vers-Audio konnte nicht geladen werden');
  });
}

// ── Einzelnes Wort (Quran.com wbw-CDN — Alafasy, Fallback: Google TTS) ───
export function speakWord(surahNum: number, verseNum: number, wordPos: number, fallbackText: string, btn?: HTMLElement): void {
  if (_currentAudio && !_currentAudio.paused) {
    _currentAudio.pause(); _currentAudio = null; _resetBtn(); return;
  }
  _playMp3(
    `https://audio.qurancdn.com/wbw/${surahNum}/${verseNum}/${wordPos}.mp3`,
    btn,
    () => speakAr(fallbackText)
  );
}

export function stopCurrentAudio(): void {
  if (_currentAudio) { _currentAudio.pause(); _currentAudio = null; }
  _resetBtn();
}

// ── HTML-Hilfsfunktionen ──────────────────────────────────────────────────
export function spkBtn(text: string, label = '🔊'): string {
  return `<button class="spk-ar" data-ar="${encodeURIComponent(text)}"
    style="background:rgba(146,64,14,.1);border:1.5px solid rgba(146,64,14,.25);
    border-radius:50%;width:36px;height:36px;display:inline-flex;align-items:center;
    justify-content:center;cursor:pointer;font-size:.9rem;padding:0;flex-shrink:0;
    transition:all .2s">${label}</button>`;
}

// Buttons für Buchstaben, Vokabeln, Tajweed-Beispiele (Google TTS)
export function bindSpkBtns(root: HTMLElement): void {
  root.querySelectorAll<HTMLElement>('.spk-ar').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const text = decodeURIComponent(el.dataset.ar ?? '');
      if (!text) return;
      speakAr(text);
      el.style.background = 'rgba(146,64,14,.3)';
      setTimeout(() => { el.style.background = ''; }, 700);
    });
  });
}

// Vers-Buttons (🔊 neben jedem Vers — Alafasy MP3)
export function bindVerseBtns(root: HTMLElement): void {
  root.querySelectorAll<HTMLButtonElement>('.spk-verse').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const surah = Number(btn.dataset.surah);
      const verse = Number(btn.dataset.verse);
      if (!surah || !verse) return;
      speakVerse(surah, verse, btn);
    });
  });
}

// Wort-Chips in Suren (Alafasy wbw, Fallback Google TTS)
export function bindWordChips(root: HTMLElement): void {
  root.querySelectorAll<HTMLElement>('.word-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      const surah = Number(chip.dataset.surah);
      const verse = Number(chip.dataset.verse);
      const word  = Number(chip.dataset.word);
      const ar    = decodeURIComponent(chip.dataset.ar ?? '');
      if (surah && verse && word) {
        speakWord(surah, verse, word, ar, chip);
      } else if (ar) {
        speakAr(ar);
      }
    });
  });
}
