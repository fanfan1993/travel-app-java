import { Link, useLocation } from 'react-router-dom';

const TABS = [
  { to: '/', label: '首页', icon: '🏠', match: (p: string) => p === '/' },
  { to: '/explore', label: '发现', icon: '🧭', match: (p: string) => p.startsWith('/explore') || p.startsWith('/destination') },
  { to: '/ai', label: 'AI 助手', icon: '✨', match: (p: string) => p.startsWith('/ai') },
  { to: '/favorites', label: '收藏', icon: '💗', match: (p: string) => p.startsWith('/favorites') },
];

export default function TabBar() {
  const { pathname } = useLocation();
  // 详情页沉浸式浏览，隐藏底部导航
  if (pathname.startsWith('/destination/')) return null;

  return (
    <nav className="tabbar">
      {TABS.map((t) => {
        const active = t.match(pathname);
        return (
          <Link key={t.to} to={t.to} className={active ? 'tab active' : 'tab'}>
            <span className="tab-icon">{t.icon}</span>
            <span className="tab-label">{t.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
