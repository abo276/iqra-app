import { showToast } from '../main';

// ── Stimmen einmalig cachen ───────────────────────────────────────────────
let _cachedArVoice: SpeechSynthesisVoice | null | undefined = undefined;

function _getArVoice(): SpeechSynthesisVoice | null {
  if (_cachedArVoice !== undefined) return _cachedArVoice;
  const voices = window.speechSynthesis.getVoices();
  _cachedArVoice = voices.find(v => v.lang.startsWith('ar') && v.name.toLowerCase().includes('google'))
                ?? voices.find(v => v.lang.startsWith('ar'))
                ?? null;
  return _cachedArVoice;
}

if ('speechSynthesis' in window) {
  window.speechSynthesis.addEventListener('voiceschanged', () => {
    _cachedArVoice = undefined; // Cache invalidieren, beim nächsten Aufruf neu laden
  });
}

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

function _stopCurrent(): void {
  if (_currentAudio) { _currentAudio.pause(); _currentAudio = null; }
  _resetBtn();
}

function _playMp3(url: string, btn: HTMLElement | null, fallback?: () => void): void {
  _stopCurrent();

  const audio = new Audio(url);
  _currentAudio = audio;
  _currentBtn = btn;

  if (btn) { btn.textContent = '⏸'; btn.style.background = 'rgba(146,64,14,.3)'; }

  // Guard: verhindert doppelten fallback()-Aufruf (onerror + play().catch feuern beide)
  let handled = false;
  const onFail = () => {
    if (handled) return;
    handled = true;
    if (_currentAudio === audio) _stopCurrent();
    if (fallback) fallback(); else showToast('⚠️ Audio konnte nicht geladen werden');
  };

  audio.onended = () => { if (_currentAudio === audio) _stopCurrent(); };
  audio.onerror = onFail;
  audio.play().catch(onFail);
}

// ── Arabisch-TTS: Chrome-Cloud-Stimme → Google TTS URL ───────────────────
export function speakAr(text: string): void {
  if ('speechSynthesis' in window) {
    const arVoice = _getArVoice();
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
  const url1 = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ar&client=tw-ob`;
  const url2 = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ar&client=gtx`;
  _playMp3(url1, null, () => _playMp3(url2, null, () =>
    showToast('⚠️ Audio nur auf dem Handy verfügbar (Netzwerk-Einschränkung)')
  ));
}

// ── Ganzen Vers abspielen (everyayah.com — Alafasy 128kbps) ───────────────
export function speakVerse(surahNum: number, verseNum: number, btn: HTMLElement | null = null): void {
  if (_currentAudio && !_currentAudio.paused) { _stopCurrent(); return; }
  const s = String(surahNum).padStart(3, '0');
  const v = String(verseNum).padStart(3, '0');
  _playMp3(`https://everyayah.com/data/Alafasy_128kbps/${s}${v}.mp3`, btn, () =>
    showToast('⚠️ Vers-Audio konnte nicht geladen werden')
  );
}

export function stopCurrentAudio(): void {
  _stopCurrent();
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

export function bindWordChips(root: HTMLElement): void {
  // Vers-Buttons einmalig indexieren — kein DOM-Query bei jedem Klick
  const verseBtnMap = new Map<string, HTMLElement>();
  root.querySelectorAll<HTMLElement>('.spk-verse').forEach(btn => {
    verseBtnMap.set(`${btn.dataset.surah}-${btn.dataset.verse}`, btn);
  });

  root.querySelectorAll<HTMLElement>('.word-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      const surah = Number(chip.dataset.surah);
      const verse = Number(chip.dataset.verse);
      if (!surah || !verse) return;
      chip.style.background = '#fef3c7';
      chip.style.borderColor = '#fbbf24';
      setTimeout(() => { chip.style.background = 'white'; chip.style.borderColor = '#e2e8f0'; }, 1000);
      speakVerse(surah, verse, verseBtnMap.get(`${surah}-${verse}`) ?? null);
    });
  });
}
