import { showToast } from '../main';

// ── TTS: Stimmen so früh wie möglich laden (async in Chrome) ──────────────
let _voices: SpeechSynthesisVoice[] = [];

function _loadVoices(): void {
  const v = window.speechSynthesis.getVoices();
  if (v.length > 0) _voices = v;
}

if ('speechSynthesis' in window) {
  _loadVoices();
  window.speechSynthesis.addEventListener('voiceschanged', _loadVoices);
}

function _getArVoice(): SpeechSynthesisVoice | null {
  if (_voices.length === 0) _voices = window.speechSynthesis.getVoices();
  return (
    _voices.find(v => v.lang === 'ar-SA') ??
    _voices.find(v => v.lang === 'ar') ??
    _voices.find(v => v.lang.startsWith('ar')) ??
    null
  );
}

export function speakAr(text: string, rate = 0.7): void {
  if (!('speechSynthesis' in window)) {
    showToast('⚠️ Audio nicht unterstützt');
    return;
  }

  const doSpeak = () => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ar-SA';
    u.rate = rate;
    u.pitch = 1;
    u.volume = 1;

    const arVoice = _getArVoice();
    if (arVoice) u.voice = arVoice;

    // Chrome-Bug: Speech Synthesis friert manchmal ein — keepalive
    let keepAlive: ReturnType<typeof setInterval> | null = null;
    const stopKeepAlive = () => { if (keepAlive) { clearInterval(keepAlive); keepAlive = null; } };

    u.onstart = () => {
      keepAlive = setInterval(() => {
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        if (!window.speechSynthesis.speaking) stopKeepAlive();
      }, 5000);
    };
    u.onend = stopKeepAlive;
    u.onerror = (e) => {
      stopKeepAlive();
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        showToast('⚠️ Keine arabische Stimme installiert');
      }
    };

    window.speechSynthesis.speak(u);
  };

  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
    setTimeout(doSpeak, 250);
  } else {
    doSpeak();
  }
}

// ── MP3-Audio-Player (Verse & Wörter) ─────────────────────────────────────
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

// Ganzen Vers abspielen (everyayah.com — Alafasy 128kbps)
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

// Einzelnes Wort abspielen (Quran.com wbw-CDN — Alafasy, Fallback: TTS)
export function speakWord(surahNum: number, verseNum: number, wordPos: number, fallbackText: string, btn?: HTMLElement): void {
  if (_currentAudio && !_currentAudio.paused) {
    _currentAudio.pause(); _currentAudio = null; _resetBtn(); return;
  }
  const url = `https://audio.qurancdn.com/wbw/${surahNum}/${verseNum}/${wordPos}.mp3`;
  _playMp3(url, btn, () => speakAr(fallbackText));
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

// TTS-Buttons (Buchstaben, Vokabeln, Tajweed-Beispiele)
export function bindSpkBtns(root: HTMLElement): void {
  root.querySelectorAll<HTMLElement>('.spk-ar').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const text = decodeURIComponent((el as HTMLElement).dataset.ar ?? '');
      if (!text) return;
      speakAr(text);
      el.style.background = 'rgba(146,64,14,.3)';
      setTimeout(() => { el.style.background = ''; }, 700);
    });
  });
}

// Vers-Buttons (🔊 neben jedem Vers)
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

// Wort-Chips in Suren (echtes Alafasy-Wort-Audio, Fallback TTS)
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
