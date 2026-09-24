import { RowCard } from '../components/DestinationCard';
import { useFavoritesStore } from '../stores/favoritesStore';

export default function FavoritesPage() {
  const items = useFavoritesStore((s) => s.items);

  return (
    <div className="page">
      <header className="page-header">
        <h1>我的收藏</h1>
        <p>心动的地方，都替你记着 💗</p>
      </header>

      {items.length === 0 ? (
        <div className="empty-block">
          <div className="empty-emoji">🫧</div>
          还没有收藏的目的地
          <br />
          去首页逛逛，点亮小心心吧～
        </div>
      ) : (
        items.map((d) => <RowCard key={d.id} d={d} />)
      )}
    </div>
  );
}
