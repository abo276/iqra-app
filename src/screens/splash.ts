export function initSplash(onStart: () => void): void {
  const splash = document.getElementById('splash');
  if (!splash) return;

  const saved = localStorage.getItem('iqra_name');
  if (saved) {
    hideSplash(splash, onStart);
    return;
  }

  const startBtn = document.getElementById('splashStartBtn');
  startBtn?.addEventListener('click', () => {
    const name = (document.getElementById('splashName') as HTMLInputElement)?.value.trim() || 'Schüler';
    localStorage.setItem('iqra_name', name);
    const hdrName = document.getElementById('hdrName');
    if (hdrName) hdrName.textContent = name;
    hideSplash(splash, onStart);
  });

  document.getElementById('splashName')?.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Enter') startBtn?.click();
  });
}

function hideSplash(splash: HTMLElement, onStart: () => void): void {
  const name = localStorage.getItem('iqra_name') ?? '';
  const hdrName = document.getElementById('hdrName');
  if (hdrName) hdrName.textContent = name;
  splash.classList.add('hidden');
  setTimeout(() => { splash.style.display = 'none'; onStart(); }, 500);
}
