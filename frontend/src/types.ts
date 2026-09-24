/** 目的地摘要（列表/卡片用） */
export interface DestinationSummary {
  id: number;
  name: string;
  province: string;
  city: string;
  category: string;
  summary: string;
  rating: number;
  emoji: string;
  gradient: string;
  tags: string[];
  featured: boolean;
}

/** 目的地详情（含地方特色） */
export interface DestinationDetail extends DestinationSummary {
  description: string;
  highlights: string[];
  foods: string[];
  bestSeason: string;
  avgCost: number;
}

/** 聊天消息 */
export interface ChatMsg {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: number;
}

/** 发给后端的对话历史条目 */
export interface ChatHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

/** SSE 流事件 */
export type ChatEvent =
  | { type: 'delta'; content: string }
  | { type: 'done' }
  | { type: 'error'; message: string };
