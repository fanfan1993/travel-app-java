import { useEffect, useRef, useState } from 'react';
import { useChatStore } from '../stores/chatStore';

const QUICK_PROMPTS = [
  '帮我规划一个 3 天的成都美食之旅 🌶️',
  '预算 3000 元，推荐几个好玩的地方',
  '大理有哪些必打卡的小众景点？',
  '11 月去哪儿看秋色最好？',
];

export default function AiPage() {
  const messages = useChatStore((s) => s.messages);
  const streaming = useChatStore((s) => s.streaming);
  const streamText = useChatStore((s) => s.streamText);
  const error = useChatStore((s) => s.error);
  const send = useChatStore((s) => s.send);
  const clear = useChatStore((s) => s.clear);
  const pendingQuestion = useChatStore((s) => s.pendingQuestion);
  const setPendingQuestion = useChatStore((s) => s.setPendingQuestion);

  const [input, setInput] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const pendingSentRef = useRef(false);

  // 详情页跳转过来的「问 AI」自动发送
  useEffect(() => {
    if (pendingQuestion && !pendingSentRef.current) {
      pendingSentRef.current = true;
      setPendingQuestion(null);
      void send(pendingQuestion);
    }
  }, [pendingQuestion, setPendingQuestion, send]);

  // 自动滚到底部
  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages.length, streamText]);

  const doSend = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || streaming) return;
    setInput('');
    void send(content);
  };

  return (
    <div className="ai-page">
      <header className="ai-header">
        <div className="ai-avatar">🌸</div>
        <div>
          <h1>AI 旅行助手 · 小粉</h1>
          <p>{streaming ? '正在思考…' : '行程规划 / 美食 / 避坑，随便问'}</p>
        </div>
        {messages.length > 0 && !streaming && (
          <button className="ai-clear" onClick={clear}>
            清空
          </button>
        )}
      </header>

      <div className="ai-list" ref={listRef}>
        {messages.length === 0 && !streaming && (
          <div className="ai-welcome">
            <div className="ai-welcome-emoji">🌸</div>
            <p>你好呀，我是小粉～</p>
            <p>想去哪儿玩？我可以帮你做攻略、排行程、找美食 💕</p>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={m.role === 'user' ? 'ai-row mine' : 'ai-row'}>
            {m.role === 'assistant' && <div className="ai-mini-avatar">🌸</div>}
            <div
              className={
                m.role === 'user' ? 'ai-bubble ai-bubble-mine' : 'ai-bubble ai-bubble-other'
              }
            >
              {m.content}
            </div>
          </div>
        ))}

        {streaming && (
          <div className="ai-row">
            <div className="ai-mini-avatar">🌸</div>
            <div className="ai-bubble ai-bubble-other">
              {streamText || (
                <span className="typing">
                  <i />
                  <i />
                  <i />
                </span>
              )}
            </div>
          </div>
        )}

        {error && <div className="ai-error">⚠️ {error}</div>}
      </div>

      {messages.length === 0 && (
        <div className="ai-quick">
          {QUICK_PROMPTS.map((q) => (
            <button key={q} className="chip chip-quick" onClick={() => doSend(q)}>
              {q}
            </button>
          ))}
        </div>
      )}

      <footer className="ai-input">
        <input
          value={input}
          placeholder="问问小粉…"
          disabled={streaming}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && doSend()}
        />
        <button className="ai-send" onClick={() => doSend()} disabled={streaming || !input.trim()}>
          发送
        </button>
      </footer>
    </div>
  );
}
