import type {
  ChatEvent,
  ChatHistoryItem,
  DestinationDetail,
  DestinationSummary,
} from '../types';

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || `请求失败 (${res.status})`);
  return data as T;
}

export function fetchFeatured(): Promise<DestinationSummary[]> {
  return getJson('/api/destinations/featured');
}

export interface DestListParams {
  category?: string;
  keyword?: string;
  page?: number;
  size?: number;
}

export function fetchDestinations(
  params: DestListParams = {},
): Promise<{ list: DestinationSummary[]; total: number }> {
  const qs = new URLSearchParams();
  if (params.category) qs.set('category', params.category);
  if (params.keyword) qs.set('keyword', params.keyword);
  qs.set('page', String(params.page ?? 0));
  qs.set('size', String(params.size ?? 10));
  return getJson(`/api/destinations?${qs.toString()}`);
}

export function fetchDestinationDetail(id: number | string): Promise<DestinationDetail> {
  return getJson(`/api/destinations/${id}`);
}

export function fetchCategories(): Promise<string[]> {
  return getJson('/api/categories');
}

/** AI 助手流式对话（SSE），逐段回调 delta/done/error */
export async function streamChat(
  message: string,
  history: ChatHistoryItem[],
  onEvent: (ev: ChatEvent) => void,
): Promise<void> {
  const res = await fetch('/api/chat/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error((data as { error?: string }).error || `请求失败 (${res.status})`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const parts = buf.split('\n\n');
    buf = parts.pop() || '';
    for (const part of parts) {
      const line = part.split('\n').find((l) => l.startsWith('data:'));
      if (line) {
        try {
          onEvent(JSON.parse(line.slice(5)) as ChatEvent);
        } catch {
          /* 忽略不完整分片 */
        }
      }
    }
  }
}
