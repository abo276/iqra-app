import { showToast } from '../main';

export function speakAr(text: string, rate = 0.7): void {
  if (!('speechSynthesis' in window)) {
    showToast('⚠️ Audio nicht unterstützt');
    return;
  }

  const doSpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    const arVoice =
      voices.find(v => v.lang === 'ar-SA') ??
      voices.find(v => v.lang === 'ar') ??
      voices.find(v => v.lang.startsWith('ar')) ??
      null;

    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ar-SA';
    u.rate = rate;
    u.pitch = 1;
    u.volume = 1;
    if (arVoice) u.voice = arVoice;

    u.onerror = (e) => {
      if (e.error !== 'interrupted') {
        showToast('⚠️ Keine arabische Stimme installiert');
      }
    };

    window.speechSynthesis.speak(u);
  };

  // Stoppe aktuelle Wiedergabe, dann kurz warten
  if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
    window.speechSynthesis.cancel();
    setTimeout(doSpeak, 200);
  } else {
    doSpeak();
  }
}

export function spkBtn(text: string, label = '🔊'): string {
  return `<button class="spk-ar" data-ar="${encodeURIComponent(text)}"
    style="background:rgba(146,64,14,.1);border:1.5px solid rgba(146,64,14,.25);
    border-radius:50%;width:36px;height:36px;display:inline-flex;align-items:center;
    justify-content:center;cursor:pointer;font-size:.9rem;padding:0;flex-shrink:0;
    transition:all .2s">${label}</button>`;
}

export function bindSpkBtns(root: HTMLElement): void {
  root.querySelectorAll<HTMLButtonElement>('.spk-ar').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const text = decodeURIComponent(btn.dataset.ar ?? '');
      if (!text) return;
      speakAr(text);
      btn.style.background = 'rgba(146,64,14,.3)';
      setTimeout(() => { btn.style.background = 'rgba(146,64,14,.1)'; }, 700);
    });
  });
}
