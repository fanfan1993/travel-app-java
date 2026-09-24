import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchDestinationDetail } from '../api/client';
import { useChatStore } from '../stores/chatStore';
import { useFavoritesStore } from '../stores/favoritesStore';
import type { DestinationDetail } from '../types';

export default function DetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [detail, setDetail] = useState<DestinationDetail | null>(null);
  const [error, setError] = useState('');

  const items = useFavoritesStore((s) => s.items);
  const toggle = useFavoritesStore((s) => s.toggle);
  const setPendingQuestion = useChatStore((s) => s.setPendingQuestion);
  const fav = detail ? items.some((i) => i.id === detail.id) : false;

  useEffect(() => {
    fetchDestinationDetail(id!)
      .then(setDetail)
      .catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, [id]);

  if (error) return <div className="page"><div className="empty-block">⚠️ {error}</div></div>;
  if (!detail) return <div className="page"><div className="empty-inline">loading…</div></div>;

  const askAi = () => {
    setPendingQuestion(`帮我规划一次${detail.name}的旅行，包括必去景点、美食和行程安排～`);
    navigate('/ai');
  };

  return (
    <div className="detail-page">
      <div className="detail-hero" style={{ background: detail.gradient }}>
        <button className="back-btn" onClick={() => navigate(-1)}>‹</button>
        <button
          className={fav ? 'fav-btn fav-on' : 'fav-btn'}
          onClick={() => toggle(detail)}
        >
          {fav ? '💗' : '🤍'}
        </button>
        <span className="detail-emoji">{detail.emoji}</span>
        <div className="detail-hero-info">
          <h1>{detail.name}</h1>
          <p>
            {detail.province} · {detail.city} · {detail.category}
          </p>
        </div>
      </div>

      <div className="detail-body">
        <div className="detail-stats">
          <div>
            <div className="stat-num">★ {detail.rating.toFixed(1)}</div>
            <div className="stat-label">评分</div>
          </div>
          <div>
            <div className="stat-num">{detail.bestSeason}</div>
            <div className="stat-label">最佳季节</div>
          </div>
          <div>
            <div className="stat-num">¥{detail.avgCost}</div>
            <div className="stat-label">日均预算</div>
          </div>
        </div>

        <div className="detail-tags">
          {detail.tags.map((t) => (
            <span key={t} className="chip chip-active">
              {t}
            </span>
          ))}
        </div>

        <section className="detail-section">
          <h2>📖 地方特色</h2>
          <p className="detail-text">{detail.description}</p>
        </section>

        <section className="detail-section">
          <h2>🌟 必体验</h2>
          <ul className="highlight-list">
            {detail.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </section>

        <section className="detail-section">
          <h2>🍜 特色美食</h2>
          <div className="food-wrap">
            {detail.foods.map((f) => (
              <span key={f} className="food-tag">
                {f}
              </span>
            ))}
          </div>
        </section>
      </div>

      <footer className="detail-footer">
        <button className="btn-ai" onClick={askAi}>
          ✨ 问 AI 规划「{detail.name}」行程
        </button>
      </footer>
    </div>
  );
}
