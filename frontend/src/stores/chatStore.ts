import { create } from 'zustand';
import { streamChat } from '../api/client';
import type { ChatMsg } from '../types';

interface ChatState {
  messages: ChatMsg[];
  streaming: boolean;
  /** 流式过程中正在生成的文本（完成后并入 messages） */
  streamText: string;
  error: string;
  /** 详情页「问 AI 了解更多」携带的待发送问题 */
  pendingQuestion: string | null;
  setPendingQuestion: (q: string | null) => void;
  send: (text: string) => Promise<void>;
  clear: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  streaming: false,
  streamText: '',
  error: '',
  pendingQuestion: null,

  setPendingQuestion: (q) => set({ pendingQuestion: q }),

  send: async (text) => {
    const content = text.trim();
    if (!content || get().streaming) return;

    const history = get().messages.map((m) => ({ role: m.role, content: m.content }));

    set((s) => ({
      messages: [
        ...s.messages,
        { id: `u_${Date.now()}`, role: 'user', content, ts: Date.now() },
      ],
      streaming: true,
      streamText: '',
      error: '',
    }));

    try {
      await streamChat(content, history, (ev) => {
        if (ev.type === 'delta') {
          set((s) => ({ streamText: s.streamText + ev.content }));
        } else if (ev.type === 'error') {
          set({ error: ev.message });
        }
      });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    } finally {
      const finalText = get().streamText;
      set((s) => ({
        streaming: false,
        streamText: '',
        messages: finalText
          ? [
              ...s.messages,
              {
                id: `a_${Date.now()}`,
                role: 'assistant',
                content: finalText,
                ts: Date.now(),
              },
            ]
          : s.messages,
      }));
    }
  },

  clear: () => set({ messages: [], streamText: '', error: '' }),
}));
