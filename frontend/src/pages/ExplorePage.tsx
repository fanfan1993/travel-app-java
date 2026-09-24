import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { RowCard } from '../components/DestinationCard';
import { useDestinationStore } from '../stores/destinationStore';

const CATEGORIES = ['全部', '自然风光', '古城古镇', '文化古迹', '美食之都', '海岛'];

export default function ExplorePage() {
  const [params] = useSearchParams();
  const list = useDestinationStore((s) => s.list);
  const total = useDestinationStore((s) => s.total);
  const loading = useDestinationStore((s) => s.loading);
  const category = useDestinationStore((s) => s.category);
  const keyword = useDestinationStore((s) => s.keyword);
  const setCategory = useDestinationStore((s) => s.setCategory);
  const setKeyword = useDestinationStore((s) => s.setKeyword);
  const search = useDestinationStore((s) => s.search);

  // 支持从首页分类入口带参进入
  useEffect(() => {
    const cat = params.get('cat') || '';
    setCategory(cat === '全部' ? '' : cat);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return (
    <div className="page">
      <header className="page-header">
        <h1>发现</h1>
        <p>每一个目的地，都有自己的味道</p>
      </header>

      <div className="search-bar">
        <input
          value={keyword}
          placeholder="搜索目的地 / 城市"
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && void search()}
        />
        <button onClick={() => void search()}>搜索</button>
      </div>

      <div className="chips chips-scroll">
        {CATEGORIES.map((c) => {
          const val = c === '全部' ? '' : c;
          return (
            <span
              key={c}
              className={category === val ? 'chip chip-active' : 'chip'}
              onClick={() => setCategory(val)}
            >
              {c}
            </span>
          );
        })}
      </div>

      {loading && <div className="empty-inline">loading…</div>}
      {!loading && list.length === 0 && (
        <div className="empty-block">
          <div className="empty-emoji">🌸</div>
          没有找到相关目的地，换个关键词试试～
        </div>
      )}
      {list.map((d) => (
        <RowCard key={d.id} d={d} />
      ))}
      {!loading && list.length > 0 && (
        <div className="list-end">— 共 {total} 个目的地 —</div>
      )}
    </div>
  );
}
