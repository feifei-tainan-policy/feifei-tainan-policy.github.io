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
  const stageRef = useRef<HTMLElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  // 播放開始後才把封面淡出
  const [isPlaying, setIsPlaying] = useState(false);
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
    setIsPlaying(false);
  };

  // 封面是覆蓋在播放器上的裝飾層（pointer-events: none），使用者的點擊
  // 會穿透到底下 YouTube 的播放鍵。那是 iframe 內的真實使用者操作，
  // 行動瀏覽器不會阻擋，所以手機上同樣只需按一下。
  //
  // 這裡負責在播放真的開始之後把封面收掉。兩個訊號：
  //   1. Player API 回報狀態為播放中或緩衝中（主要）
  //   2. 視窗失焦且焦點落在 iframe 上（備援，涵蓋 API 載入失敗的情況）
  useEffect(() => {
    if (!active.youtubeId || isPlaying) return;

    let cancelled = false;

    const onBlur = () => {
      if (document.activeElement === iframeRef.current) setIsPlaying(true);
    };
    window.addEventListener("blur", onBlur);

    loadYouTubeApi().then((YT) => {
      if (cancelled || !YT || !iframeRef.current) return;
      new YT.Player(iframeRef.current, {
        events: {
          onStateChange: (event: { data: number }) => {
            // 1 = 播放中，3 = 緩衝中
            if (event.data === 1 || event.data === 3) setIsPlaying(true);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      window.removeEventListener("blur", onBlur);
    };
  }, [active.youtubeId, isPlaying]);

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
              <>
                <iframe
                  key={active.youtubeId}
                  ref={iframeRef}
                  className="youtubeFrame"
                  src={`https://www.youtube-nocookie.com/embed/${active.youtubeId}?rel=0&playsinline=1&enablejsapi=1`}
                  title={`${active.title}政策影片`}
                  loading="lazy"
                  allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
                {!isPlaying && (
                  <div className="videoFacade" aria-hidden="true">
                    {active.posterPath && (
                      <img src={assetUrl(active.posterPath)} alt="" />
                    )}
                    <span className="facadePlay" />
                    <span className="facadeHint">4K 高畫質</span>
                  </div>
                )}
              </>
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
