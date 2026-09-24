import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FeatureCard, RowCard } from '../components/DestinationCard';
import { useDestinationStore } from '../stores/destinationStore';

const CATEGORIES = ['全部', '自然风光', '古城古镇', '文化古迹', '美食之都', '海岛'];

export default function HomePage() {
  const navigate = useNavigate();
  const featured = useDestinationStore((s) => s.featured);
  const list = useDestinationStore((s) => s.list);
  const loadFeatured = useDestinationStore((s) => s.loadFeatured);
  const loadList = useDestinationStore((s) => s.loadList);

  useEffect(() => {
    void loadFeatured();
    void loadList();
  }, [loadFeatured, loadList]);

  const hot = [...list].sort((a, b) => b.rating - a.rating).slice(0, 5);

  return (
    <div className="page">
      <header className="home-header">
        <div className="home-greet">
          <p className="home-hi">嗨，旅行家 👋</p>
          <h1>探索中国的美</h1>
          <p className="home-sub">地方特色 · 美食 · 小众玩法，AI 帮你规划</p>
        </div>
        <div className="search-pill" onClick={() => navigate('/explore')}>
          <span>🔍</span>
          <span>搜一搜：成都 / 大理 / 海岛…</span>
        </div>
        <div className="chips">
          {CATEGORIES.slice(1).map((c) => (
            <span
              key={c}
              className="chip chip-glass"
              onClick={() => navigate(`/explore?cat=${encodeURIComponent(c)}`)}
            >
              {c}
            </span>
          ))}
        </div>
      </header>

      <section className="section">
        <div className="section-head">
          <h2>🌸 精选目的地</h2>
        </div>
        <div className="feature-scroll">
          {featured.map((d) => (
            <FeatureCard key={d.id} d={d} />
          ))}
          {featured.length === 0 && <div className="empty-inline">加载中…</div>}
        </div>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>🔥 热门榜单</h2>
          <span className="section-more" onClick={() => navigate('/explore')}>
            查看全部 ›
          </span>
        </div>
        {hot.map((d) => (
          <RowCard key={d.id} d={d} />
        ))}
      </section>

      <section className="ai-banner" onClick={() => navigate('/ai')}>
        <div className="ai-banner-left">
          <div className="ai-banner-title">✨ AI 旅行助手「小粉」</div>
          <div className="ai-banner-sub">行程规划 / 美食推荐 / 预算攻略，秒回答</div>
        </div>
        <div className="ai-banner-btn">去提问</div>
      </section>
    </div>
  );
}
