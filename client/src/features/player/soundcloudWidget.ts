declare global {
  interface Window {
    SC?: any;
  }
}

let widget: any = null;
let readyPromise: Promise<any> | null = null;

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.SC?.Widget) return resolve();
    const s = document.createElement('script');
    s.src = 'https://w.soundcloud.com/player/api.js';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Не удалось загрузить SoundCloud Widget API'));
    document.head.appendChild(s);
  });
}

export async function getWidget(): Promise<any> {
  if (widget) return widget;
  if (!readyPromise) {
    readyPromise = (async () => {
      await loadScript();
      const iframe = document.createElement('iframe');
      iframe.id = 'sc-widget';
      iframe.allow = 'autoplay';
      iframe.style.display = 'none';
      iframe.src = 'https://w.soundcloud.com/player/?url=';
      document.body.appendChild(iframe);
      widget = window.SC.Widget(iframe);
      await new Promise<void>((resolve) => widget.bind(window.SC.Widget.Events.READY, () => resolve()));
      return widget;
    })();
  }
  return readyPromise;
}

export async function playTrack(permalinkUrl: string) {
  const w = await getWidget();
  return new Promise<void>((resolve) => {
    w.load(permalinkUrl, {
      auto_play: true,
      show_artwork: false,
      callback: () => {
        w.play();
        resolve();
      },
    });
  });
}

export async function togglePlay() {
  const w = await getWidget();
  w.isPaused((paused: boolean) => (paused ? w.play() : w.pause()));
}

export async function setVolume(percent: number) {
  // Widget принимает значение от 0 до 1
  const w = await getWidget();
  w.setVolume(Math.max(0, Math.min(1, percent / 100)));
}

export async function seekTo(seconds: number) {
  const w = await getWidget();
  w.seekTo(seconds * 1000);
}

export async function getPosition(): Promise<number> {
  const w = await getWidget();
  return new Promise((resolve) => w.getPosition((ms: number) => resolve(ms / 1000)));
}

export async function getDuration(): Promise<number> {
  const w = await getWidget();
  return new Promise((resolve) => w.getDuration((ms: number) => resolve(ms / 1000)));
}