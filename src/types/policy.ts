export type Policy = {
  id: string;
  number: string;
  shortTitle: string;
  title: string;
  english: string;
  summary: string;
  points: string[];
  accent: string;
  tint: string;
  /** YouTube 影片 ID，設定後優先於自架的 videoPath */
  youtubeId?: string;
  videoPath?: string;
  posterPath?: string;
};

export type PolicyBriefBlock = {
  heading: string;
  body: string;
};

export type PolicyBrief = {
  /** 一句話核心主張，取代標題的角色 */
  lead: string;
  /** 關鍵字標籤，讓不看內文的人也能抓到重點 */
  tags: string[];
  /** 分段重點，每段一個小標加一段說明 */
  blocks: PolicyBriefBlock[];
  /** 陳亭妃的引言 */
  quote?: string;
  /** 內容出處 */
  source?: string;
  /** 尚無專屬新聞稿，內容由其他稿件摘錄而來 */
  pending?: boolean;
};
