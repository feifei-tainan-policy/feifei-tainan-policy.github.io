/**
 * 載入 YouTube IFrame Player API，並以 Promise 形式回傳全域的 YT 物件。
 *
 * 用途：監看播放器狀態。網站的封面是覆蓋在播放器上方的裝飾層，設為
 * pointer-events: none，使用者的點擊會直接穿透到底下 YouTube 自己的
 * 播放鍵（因此是 iframe 內的真實點擊，行動瀏覽器不會阻擋）。播放一旦
 * 開始，就靠這個 API 回報的狀態把封面淡出。
 */
type YouTubeApi = {
  Player: new (el: HTMLElement, options: Record<string, unknown>) => {
    playVideo?: () => void;
    destroy?: () => void;
  };
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const API_SRC = "https://www.youtube.com/iframe_api";
const LOAD_TIMEOUT_MS = 6000;

let pending: Promise<YouTubeApi | null> | null = null;

export function loadYouTubeApi(): Promise<YouTubeApi | null> {
  if (pending) return pending;

  pending = new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve(window.YT);
      return;
    }

    let settled = false;
    const finish = (value: YouTubeApi | null) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    // 網路被擋或載入過慢時，讓呼叫端有機會退回單純的 iframe
    const timer = window.setTimeout(() => finish(null), LOAD_TIMEOUT_MS);

    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      window.clearTimeout(timer);
      finish(window.YT ?? null);
    };

    if (!document.querySelector(`script[src="${API_SRC}"]`)) {
      const script = document.createElement("script");
      script.src = API_SRC;
      script.async = true;
      script.onerror = () => {
        window.clearTimeout(timer);
        finish(null);
      };
      document.head.appendChild(script);
    }
  });

  return pending;
}
