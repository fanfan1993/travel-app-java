import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DestinationSummary } from '../types';

interface FavoritesState {
  items: DestinationSummary[];
  toggle: (d: DestinationSummary) => void;
  isFav: (id: number) => boolean;
}

/** 收藏夹：zustand persist 持久化到 localStorage */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (d) =>
        set((s) => ({
          items: s.items.some((i) => i.id === d.id)
            ? s.items.filter((i) => i.id !== d.id)
            : [d, ...s.items],
        })),
      isFav: (id) => get().items.some((i) => i.id === id),
    }),
    { name: 'pink-travel-favorites' },
  ),
);
