import { useNavigate } from 'react-router-dom';
import type { DestinationSummary } from '../types';

/** 横向滑动大卡片 */
export function FeatureCard({ d }: { d: DestinationSummary }) {
  const navigate = useNavigate();
  return (
    <div className="feature-card" onClick={() => navigate(`/destination/${d.id}`)}>
      <div className="feature-thumb" style={{ background: d.gradient }}>
        <span className="feature-emoji">{d.emoji}</span>
        <span className="feature-rating">★ {d.rating.toFixed(1)}</span>
      </div>
      <div className="feature-info">
        <div className="feature-title">
          {d.name} <span className="feature-city">{d.city}</span>
        </div>
        <div className="feature-summary">{d.summary}</div>
      </div>
    </div>
  );
}

/** 纵向列表小卡片 */
export function RowCard({ d }: { d: DestinationSummary }) {
  const navigate = useNavigate();
  return (
    <div className="row-card" onClick={() => navigate(`/destination/${d.id}`)}>
      <div className="row-thumb" style={{ background: d.gradient }}>
        <span>{d.emoji}</span>
      </div>
      <div className="row-info">
        <div className="row-title">
          {d.name}
          <span className="row-rating">★ {d.rating.toFixed(1)}</span>
        </div>
        <div className="row-summary">{d.summary}</div>
        <div className="row-tags">
          {d.tags.slice(0, 3).map((t) => (
            <span key={t} className="mini-tag">
              {t}
            </span>
          ))}
        </div>
      </div>
      <span className="row-arrow">›</span>
    </div>
  );
}
