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

// ── Arabisch-TTS: Chrome-Cloud → Google TTS URL ───────────────────────────
export function speakAr(text: string): void {
  // Chrome hat eingebaute Google-Cloud-Stimmen — zuerst versuchen
  if ('speechSynthesis' in window) {
    const voices = window.speechSynthesis.getVoices();
    const arVoice = voices.find(v => v.lang.startsWith('ar') && v.name.toLowerCase().includes('google'))
                 ?? voices.find(v => v.lang.startsWith('ar'));
    if (arVoice) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.voice = arVoice;
      u.lang = 'ar';
      u.rate = 0.8;
      window.speechSynthesis.speak(u);
      return;
    }
  }
  // Fallback: Google Translate TTS als MP3
  const url1 = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ar&client=tw-ob`;
  const url2 = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ar&client=gtx`;
  _playMp3(url1, undefined, () => _playMp3(url2, undefined, () =>
    showToast('⚠️ Audio nur auf dem Handy verfügbar (Netzwerk-Einschränkung)')
  ));
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

export function stopCurrentAudio(): void {
  if (_currentAudio) { _currentAudio.pause(); _currentAudio = null; }
  _resetBtn();
  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
}

// ── HTML-Hilfsfunktionen ──────────────────────────────────────────────────
export function spkBtn(text: string, label = '🔊'): string {
  return `<button class="spk-ar" data-ar="${encodeURIComponent(text)}"
    style="background:rgba(146,64,14,.1);border:1.5px solid rgba(146,64,14,.25);
    border-radius:50%;width:36px;height:36px;display:inline-flex;align-items:center;
    justify-content:center;cursor:pointer;font-size:.9rem;padding:0;flex-shrink:0;
    transition:all .2s">${label}</button>`;
}

// Buttons für Buchstaben, Vokabeln, Tajweed-Beispiele
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

// Wort-Chips: spielt den ganzen Vers (wie Quran.com & Tarteel)
// Einzelne herausgeschnittene Wörter klingen abgehackt und respektlos —
// der vollständige Vers klingt natürlich und ist die Standard-Lösung.
export function bindWordChips(root: HTMLElement): void {
  root.querySelectorAll<HTMLElement>('.word-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      const surah = Number(chip.dataset.surah);
      const verse = Number(chip.dataset.verse);
      if (!surah || !verse) return;

      // Visuelles Feedback am Chip
      chip.style.background = '#fef3c7';
      chip.style.borderColor = '#fbbf24';
      setTimeout(() => { chip.style.background = 'white'; chip.style.borderColor = '#e2e8f0'; }, 1000);

      // Den Vers-Button des gleichen Verses finden und mitaktualisieren
      const verseBtn = root.querySelector<HTMLElement>(`.spk-verse[data-surah="${surah}"][data-verse="${verse}"]`) ?? undefined;
      speakVerse(surah, verse, verseBtn);
    });
  });
}
