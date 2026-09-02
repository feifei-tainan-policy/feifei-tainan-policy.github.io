import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { policies } from "./data/policies";
import { siteConfig } from "./data/site";
import { assetUrl } from "./lib/assets";
import { loadYouTubeApi } from "./lib/youtube";

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

function App() {
  const [activeId, setActiveId] = useState(policies[0].id);
  const [isStageExpanded, setIsStageExpanded] = useState(false);
  const [hasStartedVideo, setHasStartedVideo] = useState(false);
  const stageRef = useRef<HTMLElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // "auto" 先嘗試自動播放；偵測到沒播起來就切成 "manual"，
  // 讓 YouTube 顯示正常播放器介面，避免停在黑畫面。
  const [playbackMode, setPlaybackMode] = useState<"auto" | "manual">("auto");
  const active = policies.find((policy) => policy.id === activeId) ?? policies[0];

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsStageExpanded(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const selectPolicy = (id: string) => {
    setActiveId(id);
    // 切換政策時收起已載入的 YouTube 播放器，避免上一支影片繼續播放
    setHasStartedVideo(false);
    setPlaybackMode("auto");
  };

  // autoplay=1 能否成功依瀏覽器而異：可以的話直接播放（維持一鍵），
  // 被擋下時 YouTube 會隱藏介面停在全黑。因此這裡用 Player API 監看
  // 實際狀態，2.5 秒內沒真的播起來就切換成有介面的版本讓使用者自己按。
  useEffect(() => {
    if (!hasStartedVideo || !active.youtubeId || playbackMode !== "auto") return;

    let cancelled = false;
    let timer = 0;

    loadYouTubeApi().then((YT) => {
      if (cancelled) return;
      const frame = iframeRef.current;
      // API 載不進來時不要降級：此時無從判斷是否正在播放，貿然換掉
      // iframe 會把已經順利播放的影片打斷。維持現狀較安全。
      if (!YT || !frame) return;

      const player = new YT.Player(frame, {
        events: {
          onStateChange: (event: { data: number }) => {
            // 1 = 播放中，3 = 緩衝中，兩者都代表自動播放成功
            if (event.data === 1 || event.data === 3) window.clearTimeout(timer);
          },
        },
      });

      timer = window.setTimeout(() => {
        if (cancelled) return;
        let state = -1;
        try {
          state = player.getPlayerState?.() ?? -1;
        } catch {
          state = -1;
        }
        if (state !== 1 && state !== 3) setPlaybackMode("manual");
      }, 2500);
    });

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [hasStartedVideo, active.youtubeId, playbackMode]);

  const toggleFullscreen = async () => {
    if (isStageExpanded && !document.fullscreenElement) {
      setIsStageExpanded(false);
      return;
    }

    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }

    if (stageRef.current?.requestFullscreen) {
      try {
        await stageRef.current.requestFullscreen();
        if (!document.fullscreenElement) {
          setIsStageExpanded(true);
        }
      } catch {
        setIsStageExpanded(true);
      }
    } else {
      setIsStageExpanded((current) => !current);
    }
  };

  return (
    <main>
      <header className="siteHeader">
        <button
          className="brandButton"
          onClick={() => scrollToSection("top")}
          aria-label="回到首頁"
        >
          <img
            src={assetUrl(siteConfig.assets.brandImage)}
            alt="陳亭妃接棒競選標誌"
          />
        </button>
        <div className="headerLabel">
          <span className="liveDot" />
          台南400年第一位女市長
        </div>
        <nav aria-label="主要導覽">
          <button onClick={() => scrollToSection("policy-stage")}>
            觀看政策影片
          </button>
        </nav>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-title">
        <video
          className="heroVideo"
          src={assetUrl(siteConfig.assets.heroVideo)}
          poster={assetUrl(siteConfig.assets.heroPoster)}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-label="妃妃市長主視覺人物動畫"
        />
        <div className="heroShade" />
        <div className="heroContent">
          <p className="eyebrow">台南400年第一位女市長</p>
          <h1 id="hero-title">
            <span className="mayorTitle">妃妃市長</span>
            <span className="relayTitle">接棒台南</span>
          </h1>
          <p className="heroCopy">8 大政策，妃妃市長從點線面串聯大台南</p>
          <button
            className="primaryAction"
            onClick={() => scrollToSection("policy-stage")}
          >
            觀看政策影片 <span aria-hidden="true">↓</span>
          </button>
        </div>
        <div className="heroIndex" aria-hidden="true">
          <span>01</span>
          <i />
          <span>08</span>
        </div>
      </section>

      <section
        className={`stageSection ${isStageExpanded ? "stageFallback" : ""}`}
        id="policy-stage"
        ref={stageRef}
        style={
          {
            "--active-accent": active.accent,
            "--active-tint": active.tint,
          } as CSSProperties
        }
      >
        <div className="stageHeader">
          <div className="stageTitle">
            <span>{active.number}</span>
            <div>
              <p>{active.english}</p>
              <h2>{active.title}</h2>
            </div>
          </div>
          <button
            className="fullscreenButton"
            onClick={toggleFullscreen}
            aria-label={isStageExpanded ? "離開全螢幕" : "全螢幕播放"}
          >
            <span aria-hidden="true">⛶</span>
            {isStageExpanded ? "離開全螢幕" : "全螢幕展示"}
          </button>
        </div>

        <div className="stageLayout">
          <div className="videoFrame">
            {active.youtubeId ? (
              hasStartedVideo ? (
                <iframe
                  key={`${active.youtubeId}-${playbackMode}`}
                  ref={iframeRef}
                  className="youtubeFrame"
                  src={`https://www.youtube-nocookie.com/embed/${
                    active.youtubeId
                  }?rel=0&playsinline=1&enablejsapi=1${
                    playbackMode === "auto" ? "&autoplay=1" : ""
                  }`}
                  title={`${active.title}政策影片`}
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : (
                <button
                  className="videoFacade"
                  onClick={() => setHasStartedVideo(true)}
                  aria-label={`播放${active.title}政策影片`}
                >
                  {active.posterPath && (
                    <img src={assetUrl(active.posterPath)} alt="" />
                  )}
                  <span className="facadePlay" aria-hidden="true" />
                  <span className="facadeHint">4K 高畫質</span>
                </button>
              )
            ) : active.videoPath ? (
              <video
                key={active.videoPath}
                src={assetUrl(active.videoPath)}
                poster={
                  active.posterPath ? assetUrl(active.posterPath) : undefined
                }
                controls
                playsInline
                preload="metadata"
              >
                您的瀏覽器不支援影片播放。
              </video>
            ) : (
              <div className="videoPlaceholder">
                <span className="placeholderNumber">{active.number}</span>
                <div className="placeholderCopy">
                  <span>{active.english}</span>
                  <strong>{active.title}</strong>
                  <small>COMING SOON</small>
                </div>
                <span className="ratioTag">16 : 9</span>
              </div>
            )}
          </div>

          <aside className="policyInfo" aria-live="polite">
            <span className="infoLabel">政策內容</span>
            <h3>{active.summary}</h3>
            <ul>
              {active.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
            <div
              className={`videoStatus ${
                active.youtubeId || active.videoPath ? "online" : ""
              }`}
            >
              <span />
              {active.youtubeId || active.videoPath ? "影片已上線" : "Coming soon"}
            </div>
          </aside>
        </div>

        <div className="policySwitcher" aria-label="切換政策影片">
          {policies.map((policy) => (
            <button
              key={policy.id}
              className={policy.id === activeId ? "active" : ""}
              onClick={() => selectPolicy(policy.id)}
              aria-label={`切換至${policy.title}`}
              aria-pressed={policy.id === activeId}
            >
              <span>{policy.number}</span>
              {policy.shortTitle}
              {(policy.youtubeId || policy.videoPath) && (
                <i aria-label="影片已上線" />
              )}
            </button>
          ))}
        </div>
      </section>

      <footer>
        <img
          src={assetUrl(siteConfig.assets.brandImage)}
          alt=""
          aria-hidden="true"
        />
        <div>
          <strong>妃妃市長 8 大政策 接棒台南</strong>
          <span>台南400年第一位女市長</span>
        </div>
        <p>陳亭妃競選總部</p>
      </footer>
    </main>
  );
}

export default App;
