import { create } from 'zustand';
import { fetchDestinations, fetchFeatured } from '../api/client';
import type { DestinationSummary } from '../types';

interface DestinationState {
  featured: DestinationSummary[];
  list: DestinationSummary[];
  total: number;
  loading: boolean;
  category: string;
  keyword: string;
  /** 设置分类并立即刷新列表 */
  setCategory: (category: string) => void;
  /** 设置搜索词（不自动刷新，配合 search() 使用） */
  setKeyword: (keyword: string) => void;
  search: () => Promise<void>;
  loadFeatured: () => Promise<void>;
  loadList: () => Promise<void>;
}

export const useDestinationStore = create<DestinationState>((set, get) => ({
  featured: [],
  list: [],
  total: 0,
  loading: false,
  category: '',
  keyword: '',

  setCategory: (category) => {
    set({ category });
    void get().loadList();
  },

  setKeyword: (keyword) => set({ keyword }),

  search: () => get().loadList(),

  loadFeatured: async () => {
    try {
      set({ featured: await fetchFeatured() });
    } catch {
      /* 静默失败，页面显示空态 */
    }
  },

  loadList: async () => {
    const { category, keyword } = get();
    set({ loading: true });
    try {
      const { list, total } = await fetchDestinations({ category, keyword });
      set({ list, total });
    } catch {
      set({ list: [], total: 0 });
    } finally {
      set({ loading: false });
    }
  },
}));
