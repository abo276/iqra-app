import { showToast } from '../main';

// ── Echte Aufnahmen für alle 28 arabischen Buchstaben (islamcan.com) ───────
const _BASE = 'https://www.islamcan.com/audio/arabic-alphabets/';
const LETTER_AUDIO: Record<string, string> = {
  'أَلِف': _BASE + '001-alif.mp3',
  'بَاء':  _BASE + '002-ba.mp3',
  'تَاء':  _BASE + '003-taa.mp3',
  'ثَاء':  _BASE + '004-tha.mp3',
  'جِيم':  _BASE + '005-jeem.mp3',
  'حَاء':  _BASE + '006-haa.mp3',
  'خَاء':  _BASE + '007-khaa.mp3',
  'دَال':  _BASE + '008-dal.mp3',
  'ذَال':  _BASE + '009-dhal.mp3',
  'رَاء':  _BASE + '010-raa.mp3',
  'زَاي':  _BASE + '011-jaa.mp3',
  'سِين':  _BASE + '012-seen.mp3',
  'شِين':  _BASE + '013-sheen.mp3',
  'صَاد':  _BASE + '014-saad.mp3',
  'ضَاد':  _BASE + '015-dhaad.mp3',
  'طَاء':  _BASE + '016-toa.mp3',
  'ظَاء':  _BASE + '017-dhaa.mp3',
  'عَيْن': _BASE + '018-ain.mp3',
  'غَيْن': _BASE + '019-ghain.mp3',
  'فَاء':  _BASE + '020-faa.mp3',
  'قَاف':  _BASE + '021-qaaf.mp3',
  'كَاف':  _BASE + '022-kaaf.mp3',
  'لَام':  _BASE + '023-laam.mp3',
  'مِيم':  _BASE + '024-meem.mp3',
  'نُون':  _BASE + '025-noon.mp3',
  'وَاو':  _BASE + '026-waw.mp3',
  'هَاء':  _BASE + '027-ha.mp3',
  'يَاء':  _BASE + '029-yaa.mp3',
};

// ── Chrome Google-Arabic-Stimme cachen ────────────────────────────────────
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
  window.speechSynthesis.addEventListener('voiceschanged', () => { _cachedArVoice = undefined; });
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

// ── Arabisch sprechen: Azure Neural TTS → Buchstaben-MP3 → Browser TTS ───
export function speakAr(text: string): void {
  _azureTts(text, () => {
    // Fallback: bekannte Buchstaben-MP3
    const letterUrl = LETTER_AUDIO[text];
    if (letterUrl) { _playMp3(letterUrl, null, () => _browserTts(text)); return; }
    _browserTts(text);
  });
}

async function _azureTts(text: string, fallback: () => void): Promise<void> {
  const key    = (import.meta.env.VITE_AZURE_KEY    as string | undefined) ?? '';
  const region = (import.meta.env.VITE_AZURE_REGION as string | undefined) ?? 'germanywestcentral';
  if (!key) { fallback(); return; }

  // Sonderzeichen für SSML escapen
  const safe = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const ssml = `<speak version='1.0' xml:lang='ar-SA'><voice name='ar-SA-HamedNeural'><prosody rate='-10%'>${safe}</prosody></voice></speak>`;

  try {
    const res = await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`, {
      method: 'POST',
      headers: {
        'Ocp-Apim-Subscription-Key': key,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-48kbitrate-mono-mp3',
      },
      body: ssml,
    });
    if (!res.ok) { fallback(); return; }
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    _playMp3(url, null, fallback);
  } catch {
    fallback();
  }
}

function _browserTts(text: string): void {
  if ('speechSynthesis' in window) {
    const arVoice = _getArVoice();
    if (arVoice) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.voice = arVoice; u.lang = 'ar'; u.rate = 0.8;
      window.speechSynthesis.speak(u);
      return;
    }
  }
  const url1 = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ar&client=tw-ob`;
  const url2 = `https://translate.googleapis.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ar&client=gtx`;
  _playMp3(url1, null, () => _playMp3(url2, null, () => showToast('⚠️ Audio nicht verfügbar')));
}

// ── Ganzen Vers (Alafasy MP3, everyayah.com) ──────────────────────────────
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
