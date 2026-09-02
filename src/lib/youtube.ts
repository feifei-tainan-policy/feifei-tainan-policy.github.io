/**
 * 載入 YouTube IFrame Player API，並以 Promise 形式回傳全域的 YT 物件。
 *
 * 為什麼不直接用 autoplay=1：該參數會讓 YouTube 隱藏縮圖與播放鍵、直接
 * 進入播放狀態，一旦播放沒能開始（iOS/WebKit 不會把父頁面的點擊授權傳給
 * 跨網域 iframe），畫面就永遠停在全黑且沒有任何可點擊的東西。
 *
 * 改用 Player API：播放器介面照常載入，再由程式呼叫 playVideo()。允許的
 * 瀏覽器會立刻開始播放（維持一鍵體驗），被擋下的則會看到完整播放器，
 * 使用者可自行按播放，不會出現黑畫面。
 */
type YouTubeApi = {
  Player: new (
    el: HTMLElement,
    options: Record<string, unknown>,
  ) => {
    getPlayerState?: () => number;
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
