let arVoice: SpeechSynthesisVoice | null = null;

function loadVoice(): void {
  const voices = speechSynthesis.getVoices();
  arVoice =
    voices.find(v => v.lang === 'ar-SA') ??
    voices.find(v => v.lang.startsWith('ar')) ??
    null;
}

if ('speechSynthesis' in window) {
  loadVoice();
  speechSynthesis.addEventListener('voiceschanged', loadVoice);
}

export function speakAr(text: string, rate = 0.7): void {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'ar-SA';
  u.rate = rate;
  if (arVoice) u.voice = arVoice;
  speechSynthesis.speak(u);
}

export function spkBtn(text: string, label = '🔊'): string {
  return `<button class="spk-ar" data-ar="${encodeURIComponent(text)}"
    style="background:rgba(146,64,14,.1);border:1.5px solid rgba(146,64,14,.25);
    border-radius:50%;width:34px;height:34px;display:inline-flex;align-items:center;
    justify-content:center;cursor:pointer;font-size:.85rem;padding:0;flex-shrink:0;
    transition:all .2s">${label}</button>`;
}

export function bindSpkBtns(root: HTMLElement): void {
  root.querySelectorAll<HTMLButtonElement>('.spk-ar').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      speakAr(decodeURIComponent(btn.dataset.ar!));
      btn.style.background = 'rgba(146,64,14,.25)';
      setTimeout(() => btn.style.background = 'rgba(146,64,14,.1)', 800);
    });
  });
}
