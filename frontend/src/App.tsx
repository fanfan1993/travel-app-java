import { HashRouter, Route, Routes } from 'react-router-dom';
import TabBar from './components/TabBar';
import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import DetailPage from './pages/DetailPage';
import AiPage from './pages/AiPage';
import FavoritesPage from './pages/FavoritesPage';

export default function App() {
  return (
    <HashRouter>
      <div className="phone">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/destination/:id" element={<DetailPage />} />
          <Route path="/ai" element={<AiPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
        </Routes>
        <TabBar />
      </div>
    </HashRouter>
  );
}
